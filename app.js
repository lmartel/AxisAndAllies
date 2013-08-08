Games = new Meteor.Collection("games");
Maps = new Meteor.Collection("maps");
Actions = new Meteor.Collection("actions");

/* Begin classes */
function Map(name, board){
    this.name = name;
    this.board = board;
}

function Terrain(name, bg){
    /* TODO: somehow inject arbitrary rules through terrain */
    /* Distance calculator asks each hex how much it costs? */
    this.name = name;
    this.bg = bg;
}
/* End classes */

if (Meteor.isClient) {

    var board;
    var KLASS = "test";
    var SELECT = "." + KLASS;

    Template.board.events({
        'click': function(e){
            var coords = H$.Util.relativeCoordsFromClick(KLASS, e);
            //console.log(coords);
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
        board = (new H$.HexGrid(480, 420, 28, KLASS));
        board.addMany(BOARD).drawAll().get(0,0).setBackgroundImage(BACKGROUND.replace("100", "200").replace("100", "200")).draw();

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

    /* Begin private client helper functions */

    function renderAction(action){
        board.action(action.document).$exec();
    }

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
    Meteor.startup(function () {
        initializeMaps();

        // Everything below here: test code

        // Actions.remove({});

        //var board = new H$.HexGrid(0, 0, 32, "foo");
    });

    /* Begin private server helper functions */


    function initializeMaps(){
        var BOARD = [
            [1,-4],[0,1],[0,0],[0,-1],[0,-3],[0,-2],[0,2],[0,3],[-1,4],[-2,4],
            [-3,4],[-4,4],[-3,3],[-2,2],[-2,3],[-1,3],[-1,2],[-1,1],[-1,0],[-2,1],[-3,2],
            [1,1],[1,0],[2,-1],[1,-1],[-1,-1],[1,-2],[2,-2],[3,-2],[3,-3],[2,-3],[1,-3],
            [2,-4],[3,-4],[4,-4],[0,-4],[-1,-3],[-1,-2],[-2,-1],[-2,0],[-3,1],[-4,2],
            [-4,3],[-5,4],[0,4],[1,3],[1,2],[2,1],[2,0],[3,-1],[4,-2],[4,-3],[5,-4]
        ];
        var villageSkirmish = new Map("Village Skirmish", BOARD);
    }

}
