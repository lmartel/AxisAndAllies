Games = new Meteor.Collection("games");
Maps = new Meteor.Collection("maps");

Armies = new Meteor.Collection("armies");
UnitCards = new Meteor.Collection("unitcards");
Units = new Meteor.Collection("units");

Actions = new Meteor.Collection("actions");

if (Meteor.isClient) {

    var _board;
    var width,
        height;
    var KLASS = "test";
    var SELECT = "." + KLASS;
    var DEPLOYMENT_ZONE_WIDTH = 3;

    Template.controlPanel.gameActive = function(){
        return getGame();
    };

    /**
     * Triggers a pause in gameplay and a "Wait for turn" message in the following situations:
     * 1. The game is still in the DRAFT phase but your army is ready
     * 2. The game is past the DRAFT phase and it is the other player's turn
     * @returns {boolean}
     */
    Template.controlPanel.notYourTurn = function(){
        var game = getGame();
        if(!game) return false;
        if(game.phase === Phase.DRAFT){
            var army = getArmy();
            return army && army.ready;
        }
        var activePlayer = whoseTurn();
        if(!activePlayer) return false;
        return activePlayer !== Meteor.userId();
    };
    
    Template.controlPanel.phaseIs = function(phase){
        var game = getGame();
        if(!game) return false;
        return game.phase === Phase[phase];
    };

    Template.controlPanel.army = function(){
        return getArmy();
    };

    Template.message.text = function(){
        var msg = Session.get("message");
        if(msg) msg = ">> " + msg + " <<";
        return msg;
    };

    /**
     * Clears the old message then renders the new one after a slight delay,
     * using the flicker to draw the eye.
     * @param text
     * @param flicker   whether to flicker. Default: true
     */
    function message(text, flicker){
        if(flicker !== false) flicker = true;
        if(flicker){
            if(Session.get("message")){
                Session.set("message", undefined);
                setTimeout(function(){
                    Session.set("message", text);
                }, 125);
                return;
            }
        }
        Session.set("message", text);
    }

    Template.gameList.events({
       'click .new-game-button': displayGameForm,
       'click .game-link': function(){
           return initializeGame(this);
       }
    });
    Template.gameList.userGames = function(){
        return Games.find({
            $or:[
                {"players.allies": Meteor.userId()},
                {"players.axis": Meteor.userId()}
            ]
        });
    };
    Template.gameList.rendered = function(){
        _board = undefined;
        Session.set("game", undefined);
        Session.set("army", undefined);
        Session.set("card", undefined);
        Session.set("unit", undefined);
        Session.set("message", undefined);
    };

    Template.gameSummary.faction = getFaction;

    Template.game.faction = getFaction;

    Template.board.rendered = function(){
        var board = getBoard();
        if(board){
            board.preloadBackgroundImages().drawAll();
            if(!this.rendered){
                Actions.find({ gameId: getGame()._id}, {sort: { timestamp: 1 } }).forEach(function(action){
                    renderAction(action, board);
                });
                this.rendered = true;
            }
        }
    };

    /**
     * These events trigger when a child of the svg is clicked (but not the svg itself)
     * to avoid intercepting right clicks in the margin
     */
    Template.board.events({
        'click svg *': makeClickHandler(false),
        'contextmenu svg *': makeClickHandler(true)
    });

    /**
     * Handle left- and right- clicks.
     * Return false (to eat the click) on successful action (deploy or undeploy),
     * return true (to allow the click to propegate) on failed/no action.
     * @param rightClick
     * @returns {Function}
     */
    function makeClickHandler(rightClick){
        return function(e){
            var coords = H$.Util.relativeCoordsFromClick(KLASS, e);
            switch(getGame().phase){
                case Phase.DRAFT:
                    break;
                case Phase.DEPLOY:
                    if(rightClick){
                        undeployHere(coords);
                    } else {
                        deployHere(coords);
                    }
                    break;
                case Phase.MOVEMENT:
                    if(!rightClick){
                        var unit = getUnitHere(coords);
                        if(unit && !unit.used){
                            toggleUnitSelection(unit);
                        }
                    }
                    break;
                default:
                    throw "board has no active game";
            }
            return false;
        }
    }

    function toggleUnitSelection(unit){
        var old = getUnit();
        var hex = getBoard().get(unit.location);
        if(old){
            var oldHex = getBoard().get(old.location);
            if(old._id === unit._id){
                undoBackground(oldHex);
                undoAllBackgrounds("lightgreen");
                setUnit(undefined);
            } else {
                undoBackground(oldHex);
                undoAllBackgrounds("lightgreen");
                temporaryBackground(hex, "green");
                setUnit(unit);
            }
        } else {
            temporaryBackground(hex, "green");
            setUnit(unit);
        }
    }

    function temporaryBackground(hex, color){
        if(!hex._bgBackup){
            hex._bgBackup = hex.fill;
        }
        hex.setBackgroundColor(color).draw();
    }

    function undoBackground(hex){
        if(!hex._bgBackup) return;
        hex.setBackgroundFill(hex._bgBackup).draw();
        hex._bgBackup = undefined;
    }

    function undoAllBackgrounds(color){
        getBoard().forEach(function(hex){
            if(!color || hex.fill === color) undoBackground(hex);
        });
    }

    Template.board.actions = function(){
        return Actions.find({ gameId: getGame()._id}, {sort: { timestamp: 1 } });
    };
    Template.board.width = function(){ return width; };
    Template.board.height = function(){ return height; };

    Template.action.exec = function(){
        var board = getBoard();
        if(board) renderAction(this, board);
    };

    Template.draft.rendered = initializeSpinners;

    Template.draft.events({
        'click .army-ready': function(e){
            var _self = this;
            Meteor.call("draftDone", this._id, function(err, nextPhaseStarting){
                _self.ready = !nextPhaseStarting;
            });
        }
    });

    Template.draft.availableCards = function(){
        return UnitCards.find({ "faction": getFaction() });
    };

    Template.draft.pointsLeft = function(){
        return this.MAX_POINTS - this.points;
    };

    Template.deployment.created = deployMessage;

    function deployMessage(flicker){
        var player = Meteor.userId();
        if(whoseTurn() !== player){
            message("It's the other player's turn to deploy.");
            return;
        }
        var game = getGame();
        var suffix;
        if(game.players.east === player){
            suffix = " the Eastern Front."
        } else if(game.players.west === player){
            suffix = " the Western Front."
        } else {
            suffix = " the East or West. Choose wisely!"
        }
        message("Deploy your forces within " + DEPLOYMENT_ZONE_WIDTH + " hexes of " + suffix, flicker)
    }

    Template.deployment.rendered = initializeSpinners;

    Template.deployment.availableCards = function(){
        var cards = this.unitIds.map(function(unitId){
            return getCard(unitId);
        });
        var seen = {};
        return cards.filter(function(card){
            var isNew = !(card.name in seen);
            seen[card.name] = true;
            return isNew;
        });
    };

    Template.deployment.unitsLeft = function(){
        countUndeployedUnits(this);
    };

    function countUndeployedUnits(army){
        return army.unitIds.reduce(function(count, id){
            if(Units.findOne(id).location === null) count++;
            return count;
        }, 0);
    }

    Template.deployment.events({
        'click .army-ready': function(e){
            var leftover = countUndeployedUnits(this);
            if(leftover > 0){
                message("You have " + leftover + " units left to deploy.");
                return false;
            }

            Meteor.call("deployDone", this._id);
            return false;
        }
    });

    Template.movement.created = function(){
        if(whoseTurn() === Meteor.userId()){
            message("Your turn to move.");
        } else {
            message("Other player's turn to move.");
        }
    };

    Template.movement.unitsLeft = function(){
        return Units.find({_id: {$in: this.unitIds}, used: false }).count();
    };

    Template.movement.range = function(){
        var active = getUnit();
        var board = getBoard();
        if(!active || !board) return;
        var valid = board.get(active.location).getMovementRange(getCard(active).speed, function(hex){
            var terrain = Terrain[hex.getBackgroundImage()];
            if(active.type === UnitType.SOLDIER){
                return terrain.soldier;
            } else {
                return terrain.vehicle;
            }
        });

        // Filter list to empty hexes only
        valid = valid.reduce(function(array, hex){
            if(hex.getPayloadData() === null) array.push(hex);
            return array;
        }, []);
        for(var i = 0; i < valid.length; i++){
            var hex = valid[i];
            temporaryBackground(hex, "lightgreen");
        }
    };

    Template.unitCard.events({
        'click .unit-card-title': function(e){
            var _self = this;
            var old = $(".unit-card.selected");
            if(old.attr("data-unit") === _self.name){
                focusSpinner();
                return;
            }

            old.slideUp(200);
            $(".unit-card[data-unit='" + _self.name + "']").slideDown(200, function(){
                Session.set("card", _self._id);
                focusSpinner();
            });

            function focusSpinner(){
                if(getGame().phase === Phase.DRAFT){
                    setTimeout(function(){
                        $(".unit-spinner[data-unit='" + _self.name + "']").trigger("focus");
                    }, 1);
                }
            }
        },
        'blur .unit-spinner': function(e){
            if(getGame().phase === Phase.DRAFT){
                $(".unit-spinner[data-unit='" + this.name + "']").removeClass("selected");
            }
        },
        'focus .unit-spinner': function(e){
            if(getGame().phase === Phase.DRAFT){
                $(".unit-spinner[data-unit='" + this.name + "']").addClass("selected");
            }
        }
    });

    Template.unitCard.rendered = function(){
        var title = $(this.firstNode);
        if(title.hasClass("selected")){

            // This is a slightly hacky way to force the jQuery to execute after the meteor rerender
            setTimeout(function(){
                title.find(".unit-spinner").focus();
            }, 1);
        }
    };

    Template.unitCard.isSelected = function(){
        return this._id === Session.get("card");
    };

    Template.unitCard.isSelectedSpinner = function(){
        var game = getGame();
        return game && game.phase === Phase.DRAFT && this._id === Session.get("card");
    };

    /* Prettyprint missing attack values as "-" instead of "null" */
    Template.unitCard.renderAttacks = function(){
        var html = "";
        var types = ["soldier", "vehicle"];
        var ranges = ["short", "medium", "long"];
        for(var i = 0; i < types.length; i++){
            var t = types[i];
            html += "<tr><th>" + titleize(t) + "</th>\n";
            for(var j = 0; j < ranges.length; j++){
                var r = ranges[j];
                html += "<td>" + (this.attacks[t][r] || "-") + "</td>\n"
            }
            html += "</tr>\n";
        }
        return html;
    };

    /* Begin private client helper functions */

    function renderAction(action, board){
        board.action(action.document).$exec();
        board.drawAll();
    }

    function createGameFromForm(){
        var input = formToHash(".new-game-form");

        Meteor.call("userLookup", input["opponent"], function(err, opponent){
            if(err) throw(err);
            if(!opponent){
                alert("No one's registered with that email address! Tell your friend at "
                    + input["opponent"] + " to make an account so you can play.");
                return false;
            }

            var name = input["name"],
                allies,
                axis,
                user = Meteor.userId();

            if(user === opponent){
                alert("You can't play with yourself! (At least make two accounts so we can keep track of who's who)");
                return false;
            }

            if(input["faction"] === "Allies"){
                allies = user;
                axis = opponent;
            } else {
                allies = opponent;
                axis = user;
            }

            // TODO: map selection
            var map = Maps.findOne();
            var game = new Game(name, allies, axis, map);
            game._id = Games.insert(game);
            initializeGame(game);
            return true;
        });
    }

    /**
     * Checks that the clicked hexagon obeys deployment and stacking rules,
     * then places the unit and updates all necessary data structures.
     * @param click     [x, y] of the click within the svg coordinate system
     * @returns {boolean}
     */
    function deployHere(click){
        var spinner = $(".unit-card-title.selected .unit-spinner");
        if(spinner.length === 0){
            message("Select a unit.");
            return false;
        }
        if(spinner.val() === "0"){
            message("You're out of those!");
            return false;
        }
        var board = getBoard();
        var hex = board.getAt(click);
        if(!hex) return false;

        var unit = getArmy().findUndeployed(spinner.attr("data-unit"));
        var game = getGame();
        var player = Meteor.userId();

        var allowedEast = false;
        var allowedWest = false;
        if(game.players.east === player){
            allowedEast = validDeployment(board, hex, H$.DIRECTION.E);
        } else if(game.players.west === player){
            allowedWest = validDeployment(board, hex, H$.DIRECTION.W);
        } else {
            allowedEast = validDeployment(board, hex, H$.DIRECTION.E);
            allowedWest = validDeployment(board, hex, H$.DIRECTION.W);
        }
        if(!allowedEast && !allowedWest){
            message("You can't deploy there!");
            return false;
        }
        var success = setUnitLocation(unit, hex.getCoords(), board);
        if(!success) return false;

        if(!game.players.east && allowedEast){
            game.players.east = player;
            game.players.west = getOpponent();
            message("You've chosen the Eastern front!");
        } else if(!game.players.west && allowedWest){
            game.players.west = player;
            game.players.east = getOpponent();
            message("You've chosen the Western front!");
        } else {
            deployMessage(false);
            return true;
        }
        Games.update(game._id, {$set: {players: game.players} });
        return true;
    }

    /**
     * Calculate whather the target hex is a valid deployment for the given side.
     * "Valid" means {DEPLOYMENT_ZONE_WIDTH} hexes from the east/west edge.
     * @param board
     * @param hex
     * @param dir
     * @returns {boolean}
     */
    function validDeployment(board, hex, dir){
        var edge = hex.farthestInDirection(dir);
        var dist = hex.getStraightLineDistanceTo(edge);
        return dist < DEPLOYMENT_ZONE_WIDTH;
    }

    function undeployHere(click){
        var army = getArmy();
        var board = getBoard();
        var hex = board.getAt(click);
        if(!hex) return false;
        var coords = hex.getCoords();
        for(var i = 0; i < army.unitIds.length; i++){
            var unit = Units.findOne(army.unitIds[i]);
            if(arrayEquals(unit.location, coords)){
                setUnitLocation(unit, null, board);
            }
        }
        return true;
    }

    function getUnitHere(click){
        var board = getBoard();
        var hex = board.getAt(click);
        if(!hex) return undefined;
        var coords = hex.getCoords();
        var army = getArmy();
        for(var i = 0; i < army.unitIds.length; i++){
            var unit = Units.findOne(army.unitIds[i]);
            if(arrayEquals(unit.location, coords)){
                return unit;
            }
        }
        return undefined;

    }

    // Eventual TODO: undeploy deletes deploy action instead of creating an undeploy action
    function setUnitLocation(unit, coords, board){
        if(!allowStacking(unit, coords, board)){
            message("You can't move units on top of each other.");
            return false;
        }
        var oldLoc = unit.location;
        var action = new H$.Action(board);
        if(coords === null){
            action.get(oldLoc).popPayload();
        } else if(oldLoc){
            action.get(coords).setPayload(new H$.Action(board).get(oldLoc).popPayload());
        } else {
            action.get(coords).setPayload(unit, getCard(unit).sprite);
        }
        unit.location = coords;
        Units.update(unit._id, {$set: {location: unit.location} });
        commitAction(action);
        return true;
    }

    function allowStacking(unit, coords, board){
        // Eventual TODO: stacking rules.
        if(!coords) return true;
        if(board.get(coords).getPayloadData()) return false;
        return true;
    }

    /**
     * Insert action into database (which will render it in the template)
     */
    function commitAction(action){
        Actions.insert({gameId: getGame()._id, timestamp: Date.now(), document: action.$serialize()});
    }

    function displayGameForm(){
        safeDOMEmpty(".content").append(Meteor.render(Template.newGame));
        $(".create-game").on("click", createGameFromForm);
        return false;
    }

    function initializeGame(game){
        width = window.innerWidth * 0.75;
        height = window.innerHeight * 0.75;
        Session.set("game", game._id);
        safeDOMEmpty(".content").append(Meteor.render(renderTemplate(Template.game, game)));
        // TODO: width = window.innerWidth * @ContentWidth; calculate max hex size for map, then get height from that
        var board = (new H$.HexGrid(width / 2, height / 2, 28, KLASS)).addMany(game.map.layout).drawAll();
        setBoard(board);
        var army = getArmy();
        if(!army){
            army = new Army(game, getFaction(game));
            army._id = Armies.insert(army);
        }
        return false;
    }

    function initializeSpinners(){
        var army = this.data;
        var spinner = $(".unit-spinner");

        if(getGame().phase === Phase.DRAFT){
            spinner.spinner({
                spin: draftSpin
            }).each(setDraftCount);
        } else {
            spinner.spinner({
                min: 0,
                spin: function(event){
                    event.stopPropagation();
                    return false;
                }
            }).each(setDeployCount);
        }

        function setDraftCount(){
            setCount(this, Phase.DRAFT);
        }

        function setDeployCount(){
            setCount(this, Phase.DEPLOY);
        }

        /**
         * Update the "count" spinner for the current unit.
         * In the DRAFT phase, accounts for all units; in the
         * DEPLOY phase, only counts undeployed (location === null) units.
         */
        function setCount(spinner, phase){
            var unitName = $(spinner).attr("data-unit");
            var count = army.unitIds.reduce(function(count, id){
                var unit = Units.findOne(id);
                if(getCard(unit).name === unitName && (phase === Phase.DRAFT || unit.location === null)) count++;
                return count;
            }, 0);
            $(spinner).attr("value", count);
        }

        function update(){
            Armies.update({ _id: army._id}, {$set: {unitIds: army.unitIds, points: army.points}});
            $(".draft-points-left").text(army.MAX_POINTS - army.points);
        }

        function draftSpin(event, ui){
            event.stopPropagation();
            var next = ui.value;
            var old = this.value || 0;
            var delta = next - old;
            if(next < 0 || delta === 0) return false;

            var unitName = $(this).attr("data-unit");
            if(delta > 0){
                /* attempt to add units */
                var card = UnitCards.findOne({"name": unitName});
                if(army.add(card, delta)){
                    update();
                    $(this).spinner("value", ui.value);
                } /* else insufficient space, do nothing */
            } else {
                var removed = army.remove(unitName, Math.abs(delta));
                if(removed){
                    update();
                    $(this).spinner("value", old - removed);
                }
            }
            return false;
        }
    }

    /* Stubs of server methods */
    Meteor.methods({});

    Meteor.startup(function(){

        // Do something maybe I don't know

    });

}

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
    });

}
