if (Meteor.isServer) {
    Meteor.startup(function(){
        //*
        var RESET_DB = false;
        /*/
        var RESET_DB = true;
        //*/
        if(RESET_DB){
            Maps.remove({});
            Seed.maps();

            UnitCards.remove({});
            Seed.unitCards();

            Games.remove({});
            Armies.remove({});
            Actions.remove({});
        }
    });

    Meteor.methods({
        /**
         * Looks up whether a user exists without exposing the entire email database to the client.
         * @param {String} arg      an email address or an _id.
         *
         * lookup(_id) returns an email address, lookup(email) returns an id.
         */
        userLookup: function(arg){
            var user = Meteor.users.findOne(arg);
            if(user) return user.emails[0].address;

            user = Meteor.users.findOne({"emails.address": arg});
            if(user) return user._id;

            return undefined;
        },
        draftDone: function(armyId){
            var army = Armies.findOne(armyId);
            army.ready = true;
            Armies.update(army._id, {$set: {ready: army.ready, unitIds: army.unitIds}});
            var readyCount = Armies.find({ gameId: army.gameId, ready: true }).count();
            if(readyCount === 2){
                Games.update(army.gameId, {$set: { phase: Phase.DEPLOY }});
                Armies.update({gameId: army.gameId}, {$set: {ready: false} }, {multi: true});
                return true;
            } else return false;
        },
        deployDone: function(armyId){
            var army = Armies.findOne(armyId);
            army.ready = true;
            Armies.update(army._id, {$set: {ready: army.ready} });
            var readyCount = Armies.find({ gameId: army.gameId, ready: true }).count();

            if(readyCount === 2){
                Meteor.call("startPlayTurn", army.gameId);
                return true;
            } else {
                var turn = Games.findOne(army.gameId).isFirstPlayerTurn;
                Games.update(army.gameId, {$set: {isFirstPlayerTurn: !turn} });
                return false;
            }
        },
        startPlayTurn: function(gameId){
            startMovementPhase(gameId);
        },
        // Toggle turn, update phase, reset units
        endPlayTurn: function(armyId){
            var army = Armies.findOne(armyId);
            Units.update({_id: {$in: army.unitIds}}, {$set: {used: false } }, {multi: true});
            var game = Games.findOne(army.gameId);
            if(game.isFirstPlayerTurn){
                Games.update(game._id, {$set: {isFirstPlayerTurn: false }});
            } else {
                switch(game.phase){
                    case Phase.MOVEMENT:
                        Games.update(game._id, {$set: {isFirstPlayerTurn: true, phase: Phase.ASSAULT } });
                        break;
                    case Phase.ASSAULT:
                        casualtyPhase(game._id);
                        startMovementPhase(game._id);
                        break;
                    default:
                        throw "unhandled game phase in endPlayTurn";
                        break;
                }
            }

        },
        attack: function(gameId, attacker, defender){
            var game = Games.findOne(gameId);
            var count = getAttacks(attacker, defender);
            var attacks = [];
            for(var i = 0; i < count; i++){
                attacks.push(attackRoll(attacker));
            }

            var hits = countHits(attacks, defender);
            var cover = rollCover(gameId, defender);

            var oldPendingStatus = defender.pendingStatus;
            for(var i = 0; i < hits; i++){
                incrementStatus(defender, cover);
            }

            Units.update(attacker._id, {$set: {used: true } });
            Units.update(defender._id, {$set: {pendingStatus: defender.pendingStatus } });

            var duration = fireProjectiles(attacker, count, defender, hits === 0);

            return new CombatResults(attacks, hits, cover, defender.pendingStatus, duration);

            function attackRoll(attacking){
                var base = Math.floor((Math.random() * 6) + 1);
                if(hasStatus(attacking)){
                    base--;
                }
                return base;
            }

            function incrementStatus(unit, cover){
                switch(unit.pendingStatus){
                    case null:
                        unit.pendingStatus = UnitStatus.DISRUPTED;
                        break;
                    case UnitStatus.DISRUPTED:
                        if(cover) break;

                        // Vehicles get a damage counter if they don't already have one
                        if(getCard(unit).type === UnitType.VEHICLE && !isDamaged(unit)){
                            unit.pendingStatus = UnitStatus.DISRUPTED_AND_DAMAGED;
                            break;
                        } // else fall through:
                    case UnitStatus.DISRUPTED_AND_DAMAGED:
                        unit.pendingStatus = UnitStatus.DESTROYED;
                    case UnitStatus.DESTROYED:
                    default:
                        break;
                }
            }

            function fireProjectiles(attacking, n, defending, miss){
                var projectiles;
                var projectileWidth;
                var projectileLength; // px
                if(getCard(attacking).type === UnitType.SOLDIER){
                    projectiles = n;
                    projectileWidth = 3;
                    projectileLength = 6;
                } else {
                    projectiles = 1;
                    projectileWidth = 12;
                    projectileLength = 18;
                }

                var dist = H$.Util.hexDistance(attacking.location, defending.location);
                // Projectile speed rules:
                // speed should be independent of distance
                // total duration should be independent of projectiles
                var duration = TICK_MILLISECONDS * dist / projectiles;
                // total duration should be at least 3 ticks
                duration = Math.max(duration, TICK_MILLISECONDS * 3 / projectiles);
                // individual projectile duration should be at least 1 tick
                duration = Math.max(duration, TICK_MILLISECONDS * projectiles);
                // total duration cannot exceed assault sub-round duration
                duration = Math.min(duration, MAX_ASSAULT / projectiles);
                var totalDuration = duration * projectiles;

                var fire = (new H$.Action()).get(attacking.location).drawLineTo(
                    (new H$.Action()).get(defending.location),
                    {
                        color: "#2c3539", // gunmetal-y
                        length: projectileLength,
                        width: projectileWidth,
                        animate: true,
                        iterations: projectiles,
                        translate: true,
                        duration: duration,
                        destroy: true,
                        miss: miss
                    }
                );

                Actions.insert({gameId: gameId, duration: totalDuration, round: calcFractionalRound(game), timestamp: Date.now(), document: fire.$serialize()});
                return totalDuration;
            }
        }
    });

    function startMovementPhase(gameId){
        var game = injectPrototype(Games.findOne(gameId), Game);
        if(game.phase === Phase.END) return false;
        game.rollInitiative();
        game.round += 1;
        game.isFirstPlayerTurn = true;
        game.phase = Phase.MOVEMENT;
        Games.update(game._id, {$set: {
            players: game.players,
            round: game.round,
            isFirstPlayerTurn: game.isFirstPlayerTurn,
            phase: game.phase
        } });
        return true;
    }

    function casualtyPhase(gameId){
        var game = injectPrototype(Games.findOne(gameId), Game);
        Armies.find({gameId: gameId}).forEach(function(army){
            forEachUnitInArmy(army, function(unit){

                // Remove disrupted status
                if(isDisrupted(unit)){
                    if(isDamaged(unit)){
                        unit.status = UnitStatus.DAMAGED;
                    } else {
                        unit.status = null;
                    }
                    var clearDisruption = (new H$.Action()).get(unit.location).clearHighlight().draw();
                    commitHighlight(clearDisruption, 0);

                }
                // TODO add actions for removing pending highlight, add active highlight
                // TODO: on move, if status: action:clear immediately, action:reapply after move

                // Activate pending status
                if(unit.pendingStatus){
                    unit.status = unit.pendingStatus;
                    unit.pendingStatus = null;

                    //var rollStatus = (new H$.Action()).get(unit.location).setHighlight
                }

                // Remove destroyed units
                if(unit.status === UnitStatus.DESTROYED){
                    var i = army.unitIds.indexOf(unit._id);
                    army.unitIds.splice(i, 1);
                    Armies.update(army._id, {$set: { unitIds: army.unitIds } });
                    // Does NOT remove the unit from the Units collection, since it will still be used in the replay

                    var destroyUnit = (new H$.Action()).get(unit.location).setPayload(null).clearHighlight().draw();
                    commitHighlight(destroyUnit, 2);
                } else {
                    Units.update(unit._id, {$set: { status: unit.status, pendingStatus: unit.pendingStatus } });
                }

            });
        });
        checkEndGame(game);

        function commitHighlight(action, order){
            Actions.insert({gameId: gameId, duration: 0, round: game.round + 0.94 + (order / 100), timestamp: Date.now(), document: action.$serialize()});
        }
    }

    function checkEndGame(game){
        var loser = null;

        // First, check if someone has no units left
        Armies.find({gameId: game._id}).forEach(function(army){
            if(army.unitIds.length === 0) loser = army.faction;
        });
        if(loser){
            return factionLost(loser);
        }

        // Next, check if someone controls the objective and round >= 7
        if(game.round >= 7){
            var map = Maps.findOne(game.mapId);
            var objective = new H$.Point(map.objective[0], map.objective[1]);
            var control = [objective];
            for(var i = H$.DIRECTION.START; i < H$.DIRECTION.END; i++){
                control.push(objective.add(H$.DIRECTION[i].offset));
            }

            var controllingFactions = {};
            forEachUnitInGame(game._id, function(unit){
                for(var i = 0; i < control.length; i++){
                    if(unit.location[0] === control[i][0] && unit.location[1] === control[i][1]){
                        controllingFactions[getCard(unit).faction] = true;
                    }
                }
            });

            if(controllingFactions[Faction.ALLIES] && !controllingFactions[Faction.AXIS]){
                return factionLost(Faction.AXIS);
            } else if(!controllingFactions[Faction.ALLIES] && controllingFactions[Faction.AXIS]){
                return factionLost(Faction.ALLIES);
            }
        }

        // Finally, check if round >= 10 and someone has more remaining unit points
        if(game.round >= 10){
            var pointsLeft = {};
            Armies.find({gameId: game._id}).forEach(function(army){
                var points = 0;
                forEachUnitInArmy(army, function(unit){
                    points += getCard(unit).cost;
                });
                pointsLeft[army.faction] = points;
            });

            if(pointsLeft[Faction.ALLIES] > pointsLeft[Faction.AXIS]){
                return factionLost(Faction.AXIS);
            } else if (pointsLeft[Faction.ALLIES] < pointsLeft[Faction.AXIS]){
                return factionLost(Faction.ALLIES);
            }
        }

        // Nope, the game's still going!
        return false;

        function factionLost(losingFaction){
            if(losingFaction === Faction.ALLIES){
                game.players.winner = game.players.axis;
                game.players.loser = game.players.allies;

            } else {
                game.players.winner = game.players.allies;
                game.players.loser = game.players.axis;
            }
            Games.update(game._id, {$set: { players: game.players, phase: Phase.END, ended: Date.now() } });
            return true;
        }
    }

}
