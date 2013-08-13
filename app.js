Games = new Meteor.Collection("games");
Maps = new Meteor.Collection("maps");
Units = new Meteor.Collection("units");

Actions = new Meteor.Collection("actions");

if (Meteor.isClient) {

    var board;
    var KLASS = "test";
    var SELECT = "." + KLASS;

    Template.gameList.events({
       'click .new-game-button': displayGameForm(),
       'click .game-link': function(){
           displayGame(this);
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

    Template.gameSummary.faction = getFactionString;

    Template.game.faction = getFactionString;

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

    Template.action.exec = function(){
        if(board) renderAction(this);
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

    function getFactionString(){
        if(this.players.allies === Meteor.userId()) return Faction.ALLIES.name;
        return Faction.AXIS.name;
    }

    function displayGameForm(){
        safeDOMEmpty(".content").append(Template.newGame);
        $(".create-game").on("click", createGameFromForm);
    }

    function displayGame(game){
        safeDOMEmpty(".content").append(Template.game(game));
        board = (new H$.HexGrid(480, 420, 28, KLASS)).addMany(game.map.layout).drawAll();
        // immediate TODO: associate actions with game
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
            renderAction(action);
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
        var RESET_DB = false;
        if(RESET_DB){
            Maps.remove({});
            Seed.maps();

            Units.remove({});
            Seed.units();

            Games.remove({});
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
