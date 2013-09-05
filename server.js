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
        },
        endPlayTurn: function(armyId){
            var army = Armies.findOne(armyId);
            var game = Games.findOne(army.gameId);
            switch(game.phase){
                case Phase.MOVEMENT:
                    if(game.isFirstPlayerTurn){
                        game.isFirstPlayerTurn = false;
                        Games.update(game._id, {$set: {isFirstPlayerTurn: game.isFirstPlayerTurn} });
                    } else {
                        game.isFirstPlayerTurn = true;

                        game.phase = Phase.ASSAULT;
                        //Games.update(game._id, {$inc: {round: 1} })
                        //console.log("ending second player play turn");


                        Games.update(game._id, {$set: {isFirstPlayerTurn: game.isFirstPlayerTurn, phase: game.phase} });
                    }
                    Units.update({_id: {$in: army.unitIds}}, {$set: {used: false } }, {multi: true});
                    break;
                case Phase.ASSAULT:
                    if(game.isFirstPlayerTurn){
                        game.isFirstPlayerTurn = false;
                        Games.update(game._id, {$set: {isFirstPlayerTurn: game.isFirstPlayerTurn} });
                    } else {
                        throw "unhandled game phase in endPlayTurn";
                    }
                    break;
                default:
                    throw "unhandled game phase in endPlayTurn";
                    break;
            }
        }
    });

}
