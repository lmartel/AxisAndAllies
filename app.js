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

    /**
     * Triggers a pause in gameplay and a "Wait for turn" message in the following situations:
     * 1. The game is still in the DRAFT phase but your army is ready
     * 2. The game is past the DRAFT phase and it is the other player's turn
     * @returns {boolean}
     */
    Template.waitForTurn.notYourTurn = function(){
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

    Template.gameList.events({
       'click .new-game-button': displayGameForm,
       'click .game-link': function(){
           return displayGame(this);
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
        Session.set("game", undefined);
        Session.set("army", undefined);
        _board = undefined;
    };

    Template.gameSummary.faction = getFaction;

    Template.game.faction = getFaction;

    Template.board.rendered = function(){
        var board = getBoard();
        if(board){
            board.drawAll();
            if(!this.rendered){
                Actions.find().forEach(function(action){
                    renderAction(action, board);
                });
                this.rendered = true;
            }
        }
    };
    Template.board.events({
        'click': makeClickHandler(false),
        'dblclick': makeClickHandler(true)
    });

    function makeClickHandler(double){
        return function(e){
            switch(getGame().phase){
                case Phase.DRAFT:
                    break;
                case Phase.DEPLOY:
                    var coords = H$.Util.relativeCoordsFromClick(KLASS, e);
                    if(double){
                        undeployHere(coords);
                    } else {
                        deployHere(coords);
                    }
                    break;
                default:
                    throw "board has no active game";
            }
            return false;
        }
    }
    Template.board.actions = function(){
        return Actions.find();
    };
    Template.board.width = function(){ return width; };
    Template.board.height = function(){ return height; };

    Template.action.exec = function(){
        var board = getBoard();
        if(board) renderAction(this, board);
    };

    Template.buildArmy.rendered = displayArmyPopup;

    Template.buildArmy.events({
        'click .army-ready': function(e){
            this.finalize();
            Armies.update({_id: this._id}, {$set: {ready: this.ready, unitIds: this.unitIds}});
            var readyCount = 0;
            Armies.find({ gameId: getGame()._id }).forEach(function(army){
                if(army.ready) readyCount++;
            });
            if(readyCount === 2){
                var game = getGame();
                game.phase = Phase.DEPLOY;
                Games.update({ _id: getGame()._id }, {$set: { phase: game.phase }});
            }
            displayDeployment(this);
        }
    });

    Template.buildArmy.availableCards = function(){
        return UnitCards.find({ "faction": getFaction() });
    };

    Template.buildArmy.pointsLeft = function(){
        return this.MAX_POINTS - this.points;
    };

    Template.deployment.rendered = displayArmyPopup;

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
        return this.unitIds.reduce(function(count, id){
            if(Units.findOne(id).location === null) count++;
            return count;
        }, 0);
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
            displayGame(game);
            return true;
        });
    }

    function getGame(){
        var game = Games.findOne(Session.get("game"));
        if(game) return injectPrototype(game, Game);
        return undefined;
    }
    /**
     * Returns the current player's faction in the given game.
     * If no game is provided, attempts to pull the game out of the session.
     * As a last resort, attempts to use the current context (this) as the game.
     * @param game (optional)
     * @returns {string}
     */
    function getFaction(game){
        // hasOwnProperty check is necessary, as Spark sometimes passes an empty object as a parameter
        if(!game || !game.hasOwnProperty("players")) game = getGame() || this;
        if(game.players.allies === Meteor.userId()) return Faction.ALLIES;
        return Faction.AXIS;
    }

    function getArmy(){
        var id = Session.get("army");
        var army;
        if(id){
            army = Armies.findOne(id);
        } else {
            var game = getGame();
            army = Armies.findOne({ "gameId": game._id, "faction": getFaction(game) });
            if(!army) return undefined;
            Session.set("army", army._id);
        }
        return injectPrototype(army, Army);
    }

    function setBoard(board){
        _board = board;
        // Session.set("board", board.serialize());
    }

    function getBoard(){
        return _board;
//        var board = Session.get("board");
//        if(board) return (new H$.HexGrid(width / 2, height / 2, 28, KLASS)).loadFromJson(board);
//        return undefined;
    }

    /**
     * Returns the active player in the currently active game (unless no game is active)
     * @returns {string} or null
     */
    function whoseTurn(){
        var game = getGame();
        if(!game) return null;
        if(game.isFirstPlayerTurn){
            return game.players.first;
        } else {
            return game.players.second;
        }
    }

    function deployHere(click){
        var spinner = $(".unit-card-title.ui-accordion-header-active .unit-spinner");
        if(spinner.val() === 0) return;
        var unit = getArmy().findUndeployed(spinner.attr("data-unit"));
        var board = getBoard();
        var hex = board.getAt(click);
        if(!hex) return;
        // TODO check stacking rules - possibly add multiple payloads per hex?
        setUnitLocation(unit, hex.getCoords(), board);
        spinner.val(spinner.val() - 1);
    }

    function undeployHere(click){
        var army = getArmy();
        var board = getBoard();
        var hex = board.getAt(click);
        if(!hex) return;
        var coords = hex.getCoords();
        for(var i = 0; i < army.unitIds.length; i++){
            var unit = Units.findOne(army.unitIds[i]);
            if(arrayEquals(unit.location, coords)){
                setUnitLocation(unit, null, board);
                var spinner = $(".unit-spinner[data-unit='" + getCard(unit).name + "']");
                //spinner.val(spinner.val() + 1);
            }
        }
    }

    // Eventual TODO: undeploy deletes deploy action instead of creating an undeploy action
    function setUnitLocation(unit, coords, board){
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
        //TODO: this is a bad hack and you should feel bad. Remove jQuery ui ASAP
        $(".army-dialog").dialog("destroy");
        Units.update(unit._id, {$set: {location: unit.location} });
        commitAction(action);
    }

    /**
     * Insert action into database (which will render it in the template)
     */
    function commitAction(action){
        Actions.insert({document: action.$serialize()});
    }

    function displayGameForm(){
        safeDOMEmpty(".content").append(Meteor.render(Template.newGame)); // TODO: add a (new Game) context?
        $(".create-game").on("click", createGameFromForm);
        return false;
    }

    function displayGame(game){
        width = window.innerWidth * 0.8;
        height = window.innerHeight * 0.8;
        Session.set("game", game._id);
        safeDOMEmpty(".content").append(Meteor.render(renderTemplate(Template.game, game)));
        // TODO: calculate height/width of map to get hex size
        var board = (new H$.HexGrid(width / 2, height / 2, 28, KLASS)).addMany(game.map.layout).drawAll();
        setBoard(board);
        var army = getArmy();
        //var army = Armies.findOne({ "gameId": game._id, "faction": getFaction(game) });
        if(!army){
            army = new Army(game, getFaction(game));
            army._id = Armies.insert(army);
        }
        if(game.phase === Phase.DRAFT){
            $("body").append(Meteor.render(renderTemplate(Template.buildArmy, army)));
        } else {
            displayDeployment(army);
        }
        return false;
        // TODO: associate actions with game
    }

    function displayDeployment(army){
        safeDOMEmpty(".army-dialog").remove();
        $("body").append(Meteor.render(renderTemplate(Template.deployment, army)));
    }

    function displayArmyPopup(){
        var army = this.data;
        var dialog = $(".army-dialog");
        var accordion = $(".army-accordion");
        var spinner = $(".unit-spinner");

        dialog.dialog();
        accordion.accordion();
        if(!army.ready){
            $(".unit-spinner").spinner({
                spin: draftSpin
            }).each(setDraftCount).on("focus", function(){
                $(this).addClass("selected");
            }).on("blur", function(){
                $(this).removeClass("selected");
            });
        } else {
            $(".unit-spinner").spinner({
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
            var dialog = $(".ui-dialog-title");
            var title = dialog.text().replace(/ [0-9]+$/, " ") + (army.MAX_POINTS - army.points);
            dialog.text(title);
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

        // Set up board

        var BOARD = [
            [1,-4],[0,1],[0,0],[0,-1],[0,-3],[0,-2],[0,2],[0,3],[-1,4],[-2,4],
            [-3,4],[-4,4],[-3,3],[-2,2],[-2,3],[-1,3],[-1,2],[-1,1],[-1,0],[-2,1],[-3,2],
            [1,1],[1,0],[2,-1],[1,-1],[-1,-1],[1,-2],[2,-2],[3,-2],[3,-3],[2,-3],[1,-3],
            [2,-4],[3,-4],[4,-4],[0,-4],[-1,-3],[-1,-2],[-2,-1],[-2,0],[-3,1],[-4,2],
            [-4,3],[-5,4],[0,4],[1,3],[1,2],[2,1],[2,0],[3,-1],[4,-2],[4,-3],[5,-4]
        ];
        var BACKGROUND = "http://placekitten.com/100/100";
        var board = (new H$.HexGrid(480, 420, 8, KLASS));
        //board.addMany(BOARD).drawAll();
        //board.addMany([ [-9,-3],[-9,-2],[-10,-1],[-10,0],[-11,1],[-11,2],[-12,3],[-8,-3],[-7,-3],[-11,3],[-10,3],[-9,2],[-8,1],[-7,-2],[-7,-1],[-7,0],[-8,3],[-6,1],[-7,2],[-5,0],[-4,-1],[-3,-2],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-5,1],[-4,1],[-3,1],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[1,2],[2,1],[2,2],[2,3],[3,2],[4,1],[5,0],[6,-1],[7,-2],[8,-3],[2,0],[3,0],[4,3],[5,2],[6,1],[7,0],[8,-1],[9,-2],[10,-3],[10,-2],[10,-1],[10,0],[10,1],[10,2],[8,1],[7,1],[9,1] ]).drawAll();
        board.addMany([ [-9,-3],[-9,-2],[-10,-1],[-10,0, "grass.jpg"],[-11,1],[-11,2],[-12,3],[-8,-3],[-7,-3],[-11,3],[-10,3],[-9,2],[-8,1],[-7,-2],[-7,-1],[-7,0],[-8,3],[-6,1],[-7,2],[-5,0],[-4,-1],[-3,-2],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-5,1],[-4,1],[-3,1],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[1,2],[2,1],[2,2],[2,3],[3,2],[4,1],[5,0],[6,-1],[7,-2],[8,-3],[2,0],[3,0],[4,3],[5,2],[6,1],[7,0],[8,-1],[9,-2],[10,-3],[10,-2],[10,-1],[10,0],[10,1],[10,2],[8,1],[7,1],[9,1] ]).drawAll();
        // Render actions already in database


        // Everything below here: test code

        //var action = board.action().get(1,1).movePayload(board.action().get(0,3));
        //var next = board.action(action.$serialize());
        //next.$exec();

        //var newBoard = (new H$.HexGrid(480, 420, 28, "unused")).loadFromJson(board.serialize()).drawAll();

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

        // Everything below here: test code

        // Actions.remove({});

        //var board = new H$.HexGrid(0, 0, 32, "foo");
    });

    Meteor.methods({
        /**
         * Looks up whether a user exists without exposing the entire email database to the client.
         */
       userLookup: function(email){
            var user = Meteor.users.findOne({"emails.address": email});
            if(user) return user._id;
            return undefined;
       }
    });

}
