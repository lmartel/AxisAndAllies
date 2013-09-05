resetSession = _resetSession;
function _resetSession(){
    Session.set("width", undefined);
    Session.set("height", undefined);
    Session.set("game", undefined);
    Session.set("army", undefined);
    Session.set("card", undefined);
    Session.set("unit", undefined);
    Session.set("message", undefined);
    Session.set("suppress", undefined);
    Session.set("replay", undefined);
    Session.set("replay_data", undefined);

    Session.set("can_move_to", undefined);
    Session.set("can_attack", undefined);
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

setGame = _setGame;
function _setGame(game){
    Session.set("game", game._id);
}

getGame = _getGame;
function _getGame(){
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
getFaction = _getFaction;
function _getFaction(game){
    // hasOwnProperty check is necessary, as Spark sometimes passes an empty object as a parameter
    if(!game || !game.hasOwnProperty("players")) game = getGame() || this;
    if(game.players.allies === Meteor.userId()) return Faction.ALLIES;
    return Faction.AXIS;
}

getArmy = _getArmy;
function _getArmy(){
    var id = Session.get("army");
    var army;
    if(id){
        army = Armies.findOne(id);
    } else {
        var game = getGame();
        army = Armies.findOne({ gameId: game._id, faction: getFaction(game) });
        if(!army) return undefined;
        Session.set("army", army._id);
    }
    return injectPrototype(army, Army);
}

getOpposingArmy = _getOpposingArmy;
function _getOpposingArmy(){
    var game = getGame();
    var army = Armies.findOne({ gameId: game._id, faction: {$not: getFaction(game) } });
    if(!army) return undefined;
    return injectPrototype(army, Army);
}

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
    window._board = board;
    board.setMovementCost(movementCostFn);
    board.setLineOfSightFn(lineOfSightFn);
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

addSuppression = _addSuppression;
function _addSuppression(arg){
    var timestamp = arg;
    if(arg.timestamp) timestamp = arg.timestamp;
    var suppress = Session.get("suppress");
    if(!suppress) suppress = [];
    suppress.push(timestamp);
    Session.set("suppress", suppress);
}

isSuppressed = _isSuppressed;
function _isSuppressed(action){
    var suppress = Session.get("suppress");
    return suppress && suppress.indexOf(action.timestamp) !== -1;
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
    return JSON.parse(Session.get("replay_data"));
}

isReplayOver = _isReplayOver;
function _isReplayOver(){
    return Session.get("replay") === false;
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

/**
 * Clears the old message then renders the new one after a slight delay,
 * using the flicker to draw the eye.
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
            return;
        }
    }
    Session.set("message", text);
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
    return activePlayer !== Meteor.userId();
}

defaultMessage = _defaultMessage;
function _defaultMessage(flicker){
    if(!isReplayOver()){

        // Allow replay to set message
        return;
    }
    switch(getGame().phase){
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

