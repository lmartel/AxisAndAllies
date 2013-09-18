resetSession = _resetSession;
function _resetSession(){
    // Session.set("width", undefined);
    // Session.set("height", undefined);
    // Session.set("board", undefined);
    // Session.set("demo", undefined);
    // Session.set("replay", undefined);
    // Session.set("replay_data", undefined);

    Session.set("game", undefined);
    Session.set("army", undefined);
    Session.set("card", undefined);
    Session.set("unit", undefined);
    Session.set("defender", undefined)

    Session.set("message", undefined);

    Session.set("movement_active", undefined);
    Session.set("can_move_to", undefined);
    Session.set("can_attack", undefined);
    Session.set("winner", undefined);
}

setWidth = _setWidth;
function _setWidth(width){
    Session.set("width", width);
}

getWidth = _getWidth;
function _getWidth(){
    return Session.get("width");
}


setHeight = _setHeight;
function _setHeight(height){
    Session.set("height", height);
}

getHeight = _getHeight;
function _getHeight(){
    return Session.get("height");
}

setDemo= _setDemo;
function _setDemo(game){
    if(game && game._id) game = game._id;
    Session.set("demo", game);
}

getDemo = _getDemo;
function _getDemo(){
    var game = Games.findOne(Session.get("demo"));
    if(game) return injectPrototype(game, Game);
    return undefined;
}

setGame = _setGame;
function _setGame(game){
    if(game && game._id) game = game._id;
    Session.set("game", game);
}

getGame = _getGame;
function _getGame(){
    var game = Games.findOne(Session.get("game"));
    if(game) return injectPrototype(game, Game);
    return undefined;
}

setIsMovementActive = _setIsMovementActive;
function _setIsMovementActive(bool){
    Session.set("movement_active", bool);
}

getIsMovementActive = _getIsMovementActive;
function _getIsMovementActive(bool){
    return Session.equals("movement_active", true);
}

/**
 * Returns the current player's faction in the given game.
 * If no game is provided, attempts to pull the game out of the session.
 * As a last resort, attempts to use the current context (this) as the game.
 * @param game (optional)
 * @returns {string}
 */
getFaction = _getFaction;
function _getFaction(game){
    // hasOwnProperty check is necessary, as Spark sometimes passes an empty object as a parameter
    if(!game || !game.hasOwnProperty("players")) game = getGame() || this;
    if(game.players.allies === Meteor.userId()) return Faction.ALLIES;
    return Faction.AXIS;
}

getArmy = _getArmy;
function _getArmy(unit){
    var game = getGame();
    if(unit){

        // unitIds array contains unit id
        return Armies.findOne({ gameId: game._id, unitIds: unit._id });
    }
    var id = Session.get("army");
    var army;
    if(id){
        army = Armies.findOne(id);
    } else {
        army = Armies.findOne({ gameId: game._id, faction: getFaction(game) });
        if(!army) return undefined;
        Session.set("army", army._id);
    }
    return injectPrototype(army, Army);
}

getOpposingArmy = _getOpposingArmy;
function _getOpposingArmy(myArmy){
    var game = getGame();
    var army;
    if(myArmy){
        army = Armies.findOne({ gameId: game._id, _id: {$not: myArmy._id} });
    } else {
        army = Armies.findOne({ gameId: game._id, faction: {$not: getFaction(game) } });
    }
    if(!army) return undefined;
    return injectPrototype(army, Army);
}

setCard = _setCard;
function _setCard(card){
    if(card && card.cardId){
        card = card.cardId;
    } else if(card && card._id){
        card = card._id;
    }
    Session.set("card", card);
}

/** getCard located in util.js **/

setUnit = _setUnit;
function _setUnit(unit){
    if(unit && unit._id){
        unit = unit._id;
    }
    Session.set("unit", unit);
}

getUnit = _getUnit;
function _getUnit(){
    var id = Session.get("unit");
    if(!id) return undefined;
    return injectPrototype(Units.findOne(id), Unit);
}

setBoard = _setBoard;
function _setBoard(board){
    board.setMovementCost(movementCostFn);
    board.setLineOfSightFn(lineOfSightFn);
    window._board = board;

    // Prod the session to trigger meteor rerender
    //Session.set("board", {});
}

movementCostFn = _movementCostFn;
function _movementCostFn(unit, hex){
    var terrain = Terrain[hex.getBackgroundImage()];
    if(getCard(unit).type === UnitType.SOLDIER){
        return terrain.soldier;
    } else {
        return terrain.vehicle;
    }
}

lineOfSightFn = _lineOfSightFn;
function _lineOfSightFn(unit, hex){
    var terrain = Terrain[hex.getBackgroundImage()];
    switch(terrain){
        case Terrain.TOWN:
        case Terrain.FOREST:
        case Terrain.HILL:
            return false;
        default:
            return true;
    }
}

getBoard = _getBoard;
function _getBoard(){
    //if(Session.equals("board", undefined)) return undefined;
    return window._board;
}

/**
 * Returns the active player in the currently active game (unless no game is active)
 * @returns {string} or null
 */
whoseTurn = _whoseTurn;
function _whoseTurn(){
    var game = getGame();
    if(!game) return null;
    if(game.isFirstPlayerTurn){
        return game.players.first;
    } else {
        return game.players.second;
    }
}

getOpponent = _getOpponent;
function _getOpponent(){
    var game = getGame();
    if(!game) return null;
    var player = Meteor.userId();
    if(game.players.allies === player) return game.players.axis;
    return game.players.allies;
}

/**
 * Replay data is an array of {actionId: x, timeoutId: y} hashes
 * used to skip through the replay if necessary.
 */
startReplay = _startReplay;
function _startReplay(data){
    Session.set("replay", true);
    Session.set("replay_data", JSON.stringify(data));
}

stopReplay = _stopReplay;
function _stopReplay(){
    Session.set("replay", false);
    Session.set("replay_data", undefined);
}

actionReplayDone = _actionReplayDone;
function _actionReplayDone(action){
    var data = getReplayData();
    delete data[action._id];
    Session.set("replay_data", JSON.stringify(data));
}

getReplayData = _getReplayData;
function _getReplayData(){
    var data = Session.get("replay_data");
    if(!data) return undefined;
    return JSON.parse(data);
}

isReplayOver = _isReplayOver;
function _isReplayOver(){
    return Session.get("replay") === false;
}

resetReplay = _resetReplay;
function _resetReplay(){
    Session.set("replay", undefined);
    Session.set("replay_data", undefined);
}

setCanMoveTo = _setCanMoveTo;
function _setCanMoveTo(valid){
    if(!valid){
        Session.set("can_move_to", valid);
        return;
    }
    Session.set("can_move_to", valid.map(function(hex){
        return hex.getLocation().toString();
    }));
}

canMoveTo = _canMoveTo;
function _canMoveTo(hex){
    var valid = Session.get("can_move_to");
    if(!valid) return false;

    var loc = hex.getLocation().toString();
    for(var i = 0; i < valid.length; i++){
        if(loc === valid[i]) return true;
    }
    return false;
}

setCanAttack = _setCanAttack;
function _setCanAttack(valid){
    if(!valid){
        Session.set("can_attack", valid);
        return;
    }
    Session.set("can_attack", valid.map(function(hex){
        return hex.getLocation().toString();
    }));
}

canAttack = _canAttack;
function _canAttack(hex){
    var valid = Session.get("can_attack");
    if(!valid) return false;

    var loc = hex.getLocation().toString();
    for(var i = 0; i < valid.length; i++){
        if(loc === valid[i]) return true;
    }
    return false;
}

setDefender = function _setDefender(unit){
    if(unit && unit._id){
        unit = unit._id;
    }
    Session.set("defender", unit);
};

getDefender = function _getDefender(){
    var id = Session.get("defender");
    if(!id) return undefined;
    return injectPrototype(Units.findOne(id), Unit);
};

isCombatActive = function _isCombatActive(){
    return !Session.equals("defender", undefined);
};

setWinner = function _setWinner(email){
    Session.set("winner", email);
};

getWinner = function _getWinner(){
    return Session.get("winner");
};

/**
 * Clears the old message then renders the new one after a slight delay,
 * using the flicker to draw the eye. The flicker also allows custom messages to be rendered
 * slightly after the default message, overriding it.
 * @param text
 * @param flicker   whether to flicker. Default: true
 */
message = _message;
function _message(text, flicker){
    if(flicker !== false) flicker = true;
    if(flicker){
        if(Session.get("message")){
            Session.set("message", undefined);
            setTimeout(function(){
                Session.set("message", text);
            }, 125);
        }
    } else {
        Session.set("message", text);
    }
}

getMessage = _getMessage;
function _getMessage(){
    return Session.get("message");
}

/**
 * Triggers a pause in gameplay and a "Wait for turn" message in the following situations:
 * 1. The game is still in the DRAFT phase but your army is ready
 * 2. The game is past the DRAFT phase and it is the other player's turn
 * @returns {boolean}
 */
notYourTurn = _notYourTurn;
function _notYourTurn(){
    var game = getGame();
    if(!game) return false;
    if(game.phase === Phase.DRAFT){
        var army = getArmy();
        return army && army.ready;
    }
    var activePlayer = whoseTurn();
    if(!activePlayer) return false;

    if(!isReplayOver()) return true;
    if(game.phase === Phase.END) return false;

    return activePlayer !== Meteor.userId();
}

defaultMessage = _defaultMessage;
function _defaultMessage(flicker){
    if(!isReplayOver()){

        // Allow replay to set message
        return;
    }
    var game = getGame();
    switch(game.phase){
        case Phase.DRAFT:
            if(notYourTurn()){
                message("Waiting for your opponent to finish drafting.", flicker);
            } else {
                message("Draft phase: choose your units.", flicker);
            }
            break;
        case Phase.DEPLOY:
            deployMessage(flicker);
            break;
        case Phase.MOVEMENT:
            if(notYourTurn()){
                message("Other player's turn to move.", flicker);
            } else {
                message("Your turn to move.", flicker);
            }
            break;
        case Phase.ASSAULT:
            if(notYourTurn()){
                message("Other player's assault phase.", flicker);
            } else {
                message("Assault phase: move or declare attacks!", flicker);
            }
            break;
        case Phase.END:
            var superlative;
            if(game.players.winner === game.players.axis){
                superlative = "proud " + Faction.AXIS + " has";
            } else {
                superlative = "brave " + Faction.ALLIES + " have";
            }
            var msg = "The " + superlative + " prevailed!\n";
            var me = Meteor.userId();
            if(me === game.players.winner){
                msg += "You won!";
            } else if(me === game.players.loser) {
                msg += ("You lost.")
            }
            message(msg);
            break;
        default:
            message("IMPLEMENT A DEFAULT MESSAGE FOR THIS PHASE, FUUUARK");
            break;
    }

    function deployMessage(flicker){
        var DEPLOYMENT_ZONE_WIDTH = 3;

        var player = Meteor.userId();
        if(notYourTurn()){
            message("It's the other player's turn to deploy.", flicker);
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
        message("Deploy your forces within " + DEPLOYMENT_ZONE_WIDTH + " hexes of " + suffix, flicker);
    }
}

