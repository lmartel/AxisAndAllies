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
         */
        userLookup: function(email){
            var user = Meteor.users.findOne({"emails.address": email});
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
        endPlayTurn: function(armyId){
            var army = Armies.findOne(armyId);
            var game = Games.findOne(army.gameId);
            if(!game.isFirstPlayerTurn){
                switch(game.phase){
                    case Phase.MOVEMENT:
                        game.phase = Phase.ASSAULT;
                        break;
                    case Phase.ASSAULT:
                        return startMovementPhase(game._id);
                        // TODO damage phase
                        break;
                    default:
                        throw "unhandled game phase in endPlayTurn";
                        break;
                }
            }

            // Toggle turn, update phase, reset units
            Games.update(game._id, {$set: {isFirstPlayerTurn: !game.isFirstPlayerTurn, phase: game.phase} });
            Units.update({_id: {$in: army.unitIds}}, {$set: {used: false } }, {multi: true});
        },
        attack: function(gameId, attacker, defender){
            var count = getAttacks(attacker, defender);
            var attacks = [];
            for(var i = 0; i < count; i++){
                attacks.push(roll(attacker));
            }

            var hits = countHits(attacks, defender);
            var cover = hasCover(gameId, defender);


            for(var i = 0; i < hits; i++){
                incrementStatus(defender, cover);
            }

            // Units.update(defender._id, {$set: {pendingStatuses: defender.pendingStatuses } });

            fireProjectiles(attacker, count, defender, hits === 0);
            return hits;

            function roll(attacking){
                var base = Math.floor((Math.random() * 6) + 1);
                if(hasStatus(attacking)){
                    base--;
                }
                return base;
            }

            function incrementStatus(unit, cover){
                switch(unit.pendingStatuses.length){
                    case 0:
                        unit.pendingStatuses.push(UnitStatus.DISRUPTED);
                        break;
                    case 1:
                        if(getCard(unit).type === UnitType.VEHICLE){
                            if(cover) break;
                            unit.pendingStatuses.push(UnitStatus.DAMAGED);
                            break;
                        } // else fall through:
                    default:
                        if(cover) break;
                        unit.pendingStatuses.push(UnitStatus.DESTROYED);
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
                // total duration cannot exceed round duration
                duration = Math.min(duration, ROUND_MILLISECONDS / projectiles);

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

                Actions.insert({gameId: gameId, duration: duration, round: Games.findOne(gameId).round, timestamp: Date.now(), document: fire.$serialize()});

            }
        }
    });

    function startMovementPhase(gameId){
        var game = injectPrototype(Games.findOne(gameId), Game);
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
    }

}
