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
        army = Armies.findOne({ "gameId": game._id, "faction": getFaction(game) });
        if(!army) return undefined;
        Session.set("army", army._id);
    }
    return injectPrototype(army, Army);
}

setUnit = _setUnit;
function _setUnit(unit){
    if(unit){
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