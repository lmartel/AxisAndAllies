Game = _Game;
function _Game(name, alliesPlayer, axisPlayer, map){
    this.name = name;
    this.players = {
        allies: alliesPlayer,
        axis: axisPlayer,
        east: undefined,
        west: undefined
    };
    _rollInitiative(this);
    this.map = map;
    this.round = 0;
    this.isFirstPlayerTurn = true;
    this.phase = Phase.DRAFT;
}

_Game.prototype.rollInitiative = _rollInitiative;
function _rollInitiative(game){
    game = game || this;
    if(Math.round(Math.random())){
        game.players.first = game.players.allies;
        game.players.second = game.players.axis;
    } else {
        game.players.first = game.players.axis;
        game.players.second = game.players.allies;
    }
}

Map = _Map;
function _Map(name, layout){
    this.name = name;
    this.layout = layout;
}

Terrain = null;
(function(){
    var terrain = {
        CLEAR: { path: "grass.jpg", vehicle: 1, soldier: 1 },
        MARSH: { path: "marsh.jpg", vehicle: Infinity, soldier: 1},
        TOWN: { path: "town.jpg", vehicle: 1, soldier: 1},
        FOREST: { path: "forest.jpg", vehicle: 2, soldier: 1},
        HILL: { path: "hill.jpg", vehicle: 2, soldier: 1},
        POND: { path: "pond.jpg", vehicle: Infinity, soldier: Infinity},
        HOLES: { path: "holes.jpg", vehicle: 1, soldier: 1}
    };

    setupEnumMapping(terrain, ["path"]);
    Terrain = Object.freeze(terrain);
})();

Phase = null;
(function(){
    var phase = {
        DRAFT: "Draft",
        DEPLOY: "Deploy",
        MOVEMENT: "Movement"
        /* move, attack, damage, whatever */
    };

    Phase = Object.freeze(phase);
})();
