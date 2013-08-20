Game = _Game;
function _Game(name, alliesPlayer, axisPlayer, map){
    this.name = name;
    this.players = {
        allies: alliesPlayer,
        axis: axisPlayer
    };
    if(Math.round(Math.random())){
        this.players.first = alliesPlayer;
        this.players.second = axisPlayer;
    } else {
        this.players.first = axisPlayer;
        this.players.second = alliesPlayer;
    }
    this.map = map;
    this.round = 1;
    this.isFirstPlayerTurn = true;
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