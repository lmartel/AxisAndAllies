Game = _Game;
function _Game(name, alliesPlayer, axisPlayer, map){
    this.name = name;
    this.players = {
        allies: alliesPlayer,
        axis: axisPlayer
    };
    this.map = map;
    this.turn = 1;
}

Map = _Map;
function _Map(name, layout){
    this.name = name;
    this.layout = layout;
}

/* TODO: somehow inject arbitrary rules through terrain */
/* Distance calculator asks each hex how much it costs? */
Terrain = _Terrain;
function _Terrain(name, bg){
    this.name = name;
    this.bg = bg;
}