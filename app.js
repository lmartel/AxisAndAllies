Games = new Meteor.Collection("games");
Maps = new Meteor.Collection("maps");

Armies = new Meteor.Collection("armies");
UnitCards = new Meteor.Collection("unitcards");

Actions = new Meteor.Collection("actions");

if (Meteor.isClient) {

    var board,
        width,
        height;
    var KLASS = "test";
    var SELECT = "." + KLASS;

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

    Template.gameSummary.faction = getFaction;

    Template.game.faction = getFaction;

    Template.board.events({
        'click': function(e){
            var coords = H$.Util.relativeCoordsFromClick(KLASS, e);
            var hex = board.getAt(coords);
            if(hex !== null){
                var action = hex.action().setBackgroundImage("http://placekitten.com/300/300").draw();
                Actions.insert({ document: action.$serialize() });
            }
        }
    });
    Template.board.actions = function(){
        return Actions.find();
    };
    Template.board.width = function(){ return width; };
    Template.board.height = function(){ return height; };

    Template.action.exec = function(){
        if(board) renderAction(this);
    };

    Template.buildArmy.rendered = function(){
        var army = this.data;
        if(!this.rendered){
            $(".build-army-dialog").dialog();
            $(".build-army-accordion").accordion();
            $(".unit-spinner").spinner({
                spin: function(event, ui){
                    event.stopPropagation();
                    var next = ui.value;
                    var old = this.value || 0;
                    var delta = next - old;
                    if(next < 0 || delta === 0) return false;

                    var unitName = $(this).attr("data-unit");
                    if(delta > 0){
                        /* attempt to add units */
                        var unit = UnitCards.findOne({"name": unitName});
                        if(army.add(unit, delta)){
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
            }).on("focus", function(){
                $(this).addClass("selected");
            }).on("blur", function(){
                $(this).removeClass("selected");
            }).each(setCount);
            this.rendered = true;
        }

        function setCount(){
            var unitName = $(this).attr("data-unit");
            var count = army.units.reduce(function(count, cur){
                if(cur.name === unitName) count++;
                return count;
            }, 0);
            $(this).attr("value", count);
        }

        function update(){
            Armies.update({ "_id": army._id}, {$set: {units: army.units, points: army.points}});
            var dialog = $(".ui-dialog-title");
            var title = dialog.text().replace(/ [0-9]+$/, " ") + (army.MAX_POINTS - army.points);
            dialog.text(title);
        }
    };

    Template.buildArmy.preserve([".build-army-accordion"]);

    Template.buildArmy.availableUnits = function(){
        return UnitCards.find({ "faction": getFaction() });
    };

    Template.buildArmy.pointsLeft = function(){
        return this.MAX_POINTS - this.points;
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

    function renderAction(action){
        board.action(action.document).$exec();
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
            Games.insert(game);
            displayGame(game);
            return true;
        });
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
        if(!game || !game.hasOwnProperty("players")) game = Session.get("game") || this;
        if(game.players.allies === Meteor.userId()) return Faction.ALLIES;
        return Faction.AXIS;
    }

    function displayGameForm(){
        safeDOMEmpty(".content").append(Meteor.render(Template.newGame)); // TODO: add a (new Game) context?
        $(".create-game").on("click", createGameFromForm);
        return false;
    }

    function displayGame(game){
        width = window.innerWidth * 0.8;
        height = window.innerHeight * 0.8;
        Session.set("game", game);
        safeDOMEmpty(".content").append(Meteor.render(renderTemplate(Template.game, game)));
        // TODO: calculate height/width of map to get hex size
        board = (new H$.HexGrid(width / 2, height / 2, 28, KLASS)).addMany(game.map.layout).drawAll();
        var army = injectPrototype(Armies.findOne({ "gameId": game._id, "faction": getFaction(game) }), Army);
        //var army = Armies.findOne({ "gameId": game._id, "faction": getFaction(game) });
        if(!army){
            army = new Army(game, getFaction(game));
            army._id = Armies.insert(army);
        }
        if(!army.ready){
            $(".content").append(Meteor.render(renderTemplate(Template.buildArmy, army)));
        }
        return false;
        // TODO: associate actions with game
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
        board = (new H$.HexGrid(480, 420, 8, KLASS));
        //board.addMany(BOARD).drawAll();
        //board.addMany([ [-9,-3],[-9,-2],[-10,-1],[-10,0],[-11,1],[-11,2],[-12,3],[-8,-3],[-7,-3],[-11,3],[-10,3],[-9,2],[-8,1],[-7,-2],[-7,-1],[-7,0],[-8,3],[-6,1],[-7,2],[-5,0],[-4,-1],[-3,-2],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-5,1],[-4,1],[-3,1],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[1,2],[2,1],[2,2],[2,3],[3,2],[4,1],[5,0],[6,-1],[7,-2],[8,-3],[2,0],[3,0],[4,3],[5,2],[6,1],[7,0],[8,-1],[9,-2],[10,-3],[10,-2],[10,-1],[10,0],[10,1],[10,2],[8,1],[7,1],[9,1] ]).drawAll();
        board.addMany([ [-9,-3],[-9,-2],[-10,-1],[-10,0, "grass.jpg"],[-11,1],[-11,2],[-12,3],[-8,-3],[-7,-3],[-11,3],[-10,3],[-9,2],[-8,1],[-7,-2],[-7,-1],[-7,0],[-8,3],[-6,1],[-7,2],[-5,0],[-4,-1],[-3,-2],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-5,1],[-4,1],[-3,1],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[1,2],[2,1],[2,2],[2,3],[3,2],[4,1],[5,0],[6,-1],[7,-2],[8,-3],[2,0],[3,0],[4,3],[5,2],[6,1],[7,0],[8,-1],[9,-2],[10,-3],[10,-2],[10,-1],[10,0],[10,1],[10,2],[8,1],[7,1],[9,1] ]).drawAll();
        // Render actions already in database
        Actions.find().forEach(function(action){
            // renderAction(action);
        });


        // Everything below here: test code

        //var action = board.action().get(1,1).movePayload(board.action().get(0,3));
        //var next = board.action(action.$serialize());
        //next.$exec();

        //var newBoard = (new H$.HexGrid(480, 420, 28, "unused")).loadFromJson(board.serialize()).drawAll();

    });

}

if (Meteor.isServer) {
    Meteor.startup(function () {
        var RESET_DB = true;
        if(RESET_DB){
            Maps.remove({});
            Seed.maps();

            UnitCards.remove({});
            Seed.unitCards();

            // Games.remove({});
            // Armies.remove({});
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
