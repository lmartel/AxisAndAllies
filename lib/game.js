Game = Game_class;
function Game_class(name, alliesPlayer, axisPlayer, map){
    this.name = name;
    this.players = {
        allies: alliesPlayer,
        axis: axisPlayer
    };
    this.map = map;
    this.turn = 0;
}

Map = Map_class;
function Map_class(name, layout){
    this.name = name;
    this.layout = layout;
}

/* TODO: somehow inject arbitrary rules through terrain */
/* Distance calculator asks each hex how much it costs? */
Terrain = Terrain_class;
function Terrain_class(name, bg){
    this.name = name;
    this.bg = bg;
}