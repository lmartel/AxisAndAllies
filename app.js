if (Meteor.isClient) {

    Meteor.startup(function(){
        // Test code
        var BOARD = [ [0,0],[-1,1],[-1,0],[0,-1],[1,-1],[1,0],[0,1],[-2,2],[-1,2] ];
        var BACKGROUND = "http://placekitten.com/100/100";

        var board = (new H$.HexGrid(480, 420, 28, "test"));
        var action = board.action().addMany(BOARD).addMany([[3,3], [5,5]]).setGlobalBackgroundImage(BACKGROUND).drawAll().get(3,3).setBackgroundImage(BACKGROUND.replace("100", "200")).movePayload(board.action().get(5,5));
        action.$exec();
        console.log(action);
        console.log(action.$serialize());

        //var newBoard = (new H$.HexGrid(480, 420, 28, "unused")).loadFromJson(board.serialize()).drawAll();

    });

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
    Meteor.startup(function () {
        // Test code
        
        var board = new H$.HexGrid(0, 0, 32, "foo");
    });
}
