Seed = {};
Seed.maps = function(){

    var CLEAR = Terrain.CLEAR.path;
    var MARSH = Terrain.MARSH.path;
    var TOWN = Terrain.TOWN.path;
    var FOREST = Terrain.FOREST.path;
    var HILL = Terrain.HILL.path;
    var POND = Terrain.POND.path;
    var HOLES = Terrain.HOLES.path;

    var HALF_AND_HALF = [ [0,0,CLEAR],[0,1,CLEAR],[-1,2,CLEAR],[-1,3,CLEAR],[-2,4,CLEAR],[-2,5,CLEAR],[1,5,CLEAR],[2,5,CLEAR],
        [3,5,CLEAR],[4,5,CLEAR],[5,5,CLEAR],[6,3,CLEAR],[7,1,CLEAR],[7,0,CLEAR],[9,-4,CLEAR],[10,-5,CLEAR],[9,-5,CLEAR],
        [8,-5,CLEAR],[7,-5,CLEAR],[6,-5,CLEAR],[3,-5,CLEAR],[-3,5,CLEAR],[-4,5,CLEAR],[-7,5,CLEAR],[-8,5,CLEAR],
        [-9,5,CLEAR],[-10,5,CLEAR],[-9,4,CLEAR],[-9,3,CLEAR],[-8,2,CLEAR],[-8,1,CLEAR],[-7,0,CLEAR],[-7,-1,CLEAR],
        [-6,-2,CLEAR],[-6,-3,CLEAR],[-4,-5,CLEAR],[-3,-5,CLEAR],[0,-5,CLEAR],[-1,-5,CLEAR],[-6,0,CLEAR],[-5,0,CLEAR],
        [-4,0,CLEAR],[-3,0,CLEAR],[-2,0,CLEAR],[-1,0,CLEAR],[-5,1,CLEAR],[-5,2,CLEAR],[-6,3,CLEAR],[-6,4,CLEAR],
        [-7,4,CLEAR],[-5,4,CLEAR],[-3,4,CLEAR],[-3,3,CLEAR],[-4,3,CLEAR],[-5,3,CLEAR],[-4,2,CLEAR],[-4,1,CLEAR],
        [-3,1,CLEAR],[-3,2,CLEAR],[-2,1,CLEAR],[-1,1,CLEAR],[-2,2,CLEAR],[-2,3,CLEAR],[0,3,CLEAR],[1,3,CLEAR],[1,4,CLEAR],
        [2,4,CLEAR],[3,4,CLEAR],[4,4,CLEAR],[4,3,CLEAR],[5,2,CLEAR],[6,1,CLEAR],[1,0,CLEAR],[1,1,CLEAR],[0,2,CLEAR],
        [1,2,CLEAR],[2,1,CLEAR],[2,0,CLEAR],[3,0,CLEAR],[4,0,CLEAR],[5,0,CLEAR],[6,0,CLEAR],[5,1,CLEAR],[4,1,CLEAR],
        [3,1,CLEAR],[2,2,CLEAR],[3,2,CLEAR],[4,2,CLEAR],[3,3,CLEAR],[2,3,CLEAR],[5,3,MARSH],[6,2,MARSH],[0,5,TOWN],
        [-7,1,TOWN],[-6,1,TOWN],[-6,2,TOWN],[-7,2,TOWN],[-8,3,TOWN],[-7,3,TOWN],[-8,4,TOWN],[-6,5,FOREST],
        [-5,5,FOREST],[-4,4,FOREST],[5,4,FOREST],[-1,4,HILL],[0,4,HILL],[-1,5,HILL],[0,-1,CLEAR],[1,-2,CLEAR],
        [1,-3,CLEAR],[2,-4,CLEAR],[-5,-4,FOREST],[-5,-3,FOREST],[-5,-2,FOREST],[-5,-5,FOREST],[1,-5,FOREST],[1,-4,FOREST],
        [-2,-5,FOREST],[-2,-4,FOREST],[-2,-3,FOREST],[-2,-2,FOREST],[2,-5,HILL],[0,-2,TOWN],[-1,-1,TOWN],[-6,-1,CLEAR],
        [-5,-1,CLEAR],[-4,-1,CLEAR],[-4,-2,CLEAR],[-4,-3,CLEAR],[-4,-4,CLEAR],[-3,-4,CLEAR],[-3,-3,CLEAR],
        [-3,-2,CLEAR],[-3,-1,CLEAR],[-2,-1,CLEAR],[-1,-2,CLEAR],[-1,-3,CLEAR],[0,-3,CLEAR],[0,-4,CLEAR],[-1,-4,CLEAR],
        [9,-3,TOWN],[8,-2,TOWN],[8,-1,TOWN],[8,-3,TOWN],[7,-1,TOWN],[6,-2,MARSH],[5,-1,MARSH],[4,-1,FOREST],
        [2,-1,FOREST],[1,-1,FOREST],[4,-4,FOREST],[5,-5,FOREST],[4,-5,FOREST],[5,-2,POND],[6,-3,POND],[3,-4,CLEAR],
        [2,-3,CLEAR],[2,-2,CLEAR],[3,-3,CLEAR],[4,-3,CLEAR],[3,-2,CLEAR],[3,-1,CLEAR],[4,-2,CLEAR],[5,-3,CLEAR],
        [5,-4,CLEAR],[6,-4,CLEAR],[7,-4,CLEAR],[8,-4,CLEAR],[7,-3,CLEAR],[7,-2,CLEAR],[6,-1,CLEAR] ];

    var KNIFE_FIGHT = [ [0,0,CLEAR],[0,1,CLEAR],[0,-5,CLEAR],[0,2,CLEAR],[0,3,CLEAR],[0,4,CLEAR],[0,5,CLEAR],[1,0,CLEAR],
        [2,0,CLEAR],[3,0,CLEAR],[4,0,CLEAR],[5,0,CLEAR],[6,0,CLEAR],[7,0,CLEAR],[-1,0,CLEAR],[-2,0,CLEAR],[-3,0,CLEAR],
        [-4,0,CLEAR],[-5,0,CLEAR],[-6,0,CLEAR],[-7,0,CLEAR],[7,1,CLEAR],[6,1,CLEAR],[5,1,CLEAR],[4,1,CLEAR],[3,1,CLEAR],
        [-1,1,CLEAR],[-2,1,CLEAR],[-3,1,CLEAR],[-4,1,CLEAR],[-5,1,CLEAR],[-8,1,CLEAR],[-5,-1,CLEAR],[-4,-1,CLEAR],[-2,-1,CLEAR],
        [-1,-1,CLEAR],[3,-1,CLEAR],[4,-1,CLEAR],[6,-1,CLEAR],[7,-1,CLEAR],[8,-2,CLEAR],[9,-3,CLEAR],[9,-4,CLEAR],[9,-5,CLEAR],
        [10,-5,CLEAR],[8,-5,CLEAR],[7,-5,CLEAR],[6,-5,CLEAR],[5,-5,CLEAR],[4,-5,CLEAR],[2,-5,CLEAR],[1,-5,CLEAR],[-1,-5,CLEAR],
        [-2,-5,CLEAR],[-3,-5,CLEAR],[-5,-5,CLEAR],[-6,-3,CLEAR],[-8,2,CLEAR],[-9,3,CLEAR],[-9,4,CLEAR],[-10,5,CLEAR],
        [-9,5,CLEAR],[-8,5,CLEAR],[-8,4,CLEAR],[-8,3,CLEAR],[-7,3,CLEAR],[-6,2,CLEAR],[-6,3,CLEAR],[-7,4,CLEAR],[-7,5,CLEAR],
        [-4,5,CLEAR],[-5,5,CLEAR],[-6,5,CLEAR],[-6,4,CLEAR],[-5,4,CLEAR],[-5,3,CLEAR],[-5,2,CLEAR],[-4,2,CLEAR],[-4,3,CLEAR],
        [-4,4,CLEAR],[-3,3,CLEAR],[-3,2,CLEAR],[-2,2,CLEAR],[-1,2,CLEAR],[-1,3,CLEAR],[-2,4,CLEAR],[-3,5,CLEAR],[-1,4,CLEAR],
        [3,5,CLEAR],[6,2,CLEAR],[5,2,CLEAR],[4,2,CLEAR],[4,3,CLEAR],[4,4,CLEAR],[2,3,CLEAR],[3,2,CLEAR],[2,2,CLEAR],[1,3,CLEAR],
        [1,4,CLEAR],[-2,-4,CLEAR],[-4,-4,CLEAR],[-5,-3,CLEAR],[-4,-3,CLEAR],[-5,-2,CLEAR],[-4,-2,CLEAR],[-2,-3,CLEAR],
        [-1,-4,CLEAR],[-1,-3,CLEAR],[-1,-2,CLEAR],[-2,-2,CLEAR],[1,-4,CLEAR],[1,-3,CLEAR],[2,-4,CLEAR],[2,-3,CLEAR],[1,-2,CLEAR],
        [2,-2,CLEAR],[3,-3,CLEAR],[4,-4,CLEAR],[4,-3,CLEAR],[3,-2,CLEAR],[4,-2,CLEAR],[5,-3,CLEAR],[6,-4,CLEAR],[7,-4,CLEAR],
        [8,-4,CLEAR],[6,-2,CLEAR],[5,4,TOWN],[5,5,TOWN],[4,5,TOWN],[5,3,TOWN],[6,3,TOWN],[-5,-4,TOWN],[-4,-5,TOWN],[1,5,FOREST],
        [-1,5,FOREST],[-2,5,FOREST],[1,1,FOREST],[2,1,FOREST],[1,2,FOREST],[-7,2,FOREST],[-6,1,FOREST],[-7,1,FOREST],
        [-6,-1,FOREST],[-6,-2,FOREST],[-3,-4,FOREST],[-3,-3,FOREST],[-3,-2,FOREST],[-3,-1,FOREST],[0,-4,FOREST],[0,-3,FOREST],
        [0,-2,FOREST],[0,-1,FOREST],[8,-3,FOREST],[7,-2,FOREST],[7,-3,CLEAR],[5,-4,FOREST],[8,-1,HILL],[2,-1,HILL],[1,-1,HILL],
        [3,-4,HILL],[3,-5,HILL],[-7,-1,HILL],[-2,3,HILL],[-3,4,HILL],[3,4,MARSH],[2,5,MARSH],[5,-1,MARSH],[5,-2,MARSH],
        [6,-3,MARSH],[3,3,POND],[2,4,POND] ];

    var HIGH_GROUND = [ [0,-5,CLEAR],[0,3,CLEAR],[1,0,CLEAR],[2,0,CLEAR],[3,0,CLEAR],[4,0,CLEAR],[5,0,CLEAR],[6,0,CLEAR],
        [7,0,CLEAR],[-1,0,CLEAR],[-2,0,CLEAR],[-3,0,CLEAR],[-4,0,CLEAR],[-5,0,CLEAR],[-6,0,CLEAR],[-7,0,CLEAR],[7,1,CLEAR],
        [6,1,CLEAR],[4,1,CLEAR],[3,1,CLEAR],[-1,1,CLEAR],[-2,1,CLEAR],[-3,1,CLEAR],[-4,1,CLEAR],[-5,1,CLEAR],[-8,1,CLEAR],
        [-2,-1,CLEAR],[-1,-1,CLEAR],[4,-1,CLEAR],[6,-1,CLEAR],[7,-1,CLEAR],[9,-3,CLEAR],[9,-5,CLEAR],[10,-5,CLEAR],[8,-5,CLEAR],
        [7,-5,CLEAR],[6,-5,CLEAR],[5,-5,CLEAR],[4,-5,CLEAR],[-2,-5,CLEAR],[-3,-5,CLEAR],[-5,-5,CLEAR],[-6,-3,CLEAR],[-8,2,CLEAR],
        [-9,3,CLEAR],[-9,4,CLEAR],[-10,5,CLEAR],[-9,5,CLEAR],[-8,5,CLEAR],[-8,4,CLEAR],[-8,3,CLEAR],[-7,3,CLEAR],[-6,2,CLEAR],
        [-6,3,CLEAR],[-7,4,CLEAR],[-7,5,CLEAR],[-4,5,CLEAR],[-5,5,CLEAR],[-6,5,CLEAR],[-6,4,CLEAR],[-5,4,CLEAR],[-5,3,CLEAR],
        [-5,2,CLEAR],[-4,2,CLEAR],[-4,3,CLEAR],[-4,4,CLEAR],[-3,3,CLEAR],[-3,2,CLEAR],[-2,2,CLEAR],[-1,2,CLEAR],[-1,3,CLEAR],
        [-2,4,CLEAR],[-3,5,CLEAR],[-1,4,CLEAR],[3,5,CLEAR],[6,2,CLEAR],[4,2,CLEAR],[4,3,CLEAR],[4,4,CLEAR],[2,3,CLEAR],[3,2,CLEAR],
        [2,2,CLEAR],[1,3,CLEAR],[-2,-4,CLEAR],[-4,-4,CLEAR],[-5,-3,CLEAR],[-5,-2,CLEAR],[-2,-3,CLEAR],[-1,-4,CLEAR],[-1,-3,CLEAR],
        [-1,-2,CLEAR],[-2,-2,CLEAR],[1,-3,CLEAR],[2,-4,CLEAR],[2,-3,CLEAR],[1,-2,CLEAR],[3,-3,CLEAR],[4,-4,CLEAR],[4,-3,CLEAR],
        [4,-2,CLEAR],[5,-3,CLEAR],[6,-4,CLEAR],[7,-4,CLEAR],[8,-4,CLEAR],[6,-2,CLEAR],[-4,-5,CLEAR],[-5,-4,CLEAR],[-6,-2,CLEAR],
        [-7,-1,CLEAR],[-6,-1,CLEAR],[-2,5,CLEAR],[2,5,CLEAR],[3,4,CLEAR],[2,4,CLEAR],[3,3,CLEAR],[4,5,CLEAR],[5,4,CLEAR],
        [5,3,CLEAR],[6,3,CLEAR],[5,5,CLEAR],[8,-1,CLEAR],[7,-2,CLEAR],[7,-3,CLEAR],[5,-2,CLEAR],[6,-3,CLEAR],[5,-1,CLEAR],
        [5,-4,CLEAR],[3,-5,CLEAR],[3,-4,CLEAR],[-1,-5,CLEAR],[-3,-1,CLEAR],[-3,-4,CLEAR],[0,-4,CLEAR],[0,-3,CLEAR],[0,-2,CLEAR],
        [0,-1,CLEAR],[1,-1,CLEAR],[1,2,CLEAR],[2,1,CLEAR],[0,0,CLEAR],[0,4,TOWN],[-1,5,TOWN],[3,-2,TOWN],[1,4,FOREST],
        [1,5,FOREST],[0,5,FOREST],[-7,1,FOREST],[-6,1,FOREST],[-7,2,FOREST],[8,-2,FOREST],[2,-2,HILL],[2,-1,HILL],[3,-1,HILL],
        [0,2,HILL],[1,1,HILL],[0,1,HILL],[-2,3,HILL],[-3,4,HILL],[2,-5,HILL],[1,-4,HILL],[1,-5,HILL],[-5,-1,HILL],[-4,-2,HILL],
        [-4,-3,HILL],[-3,-3,HILL],[-3,-2,HILL],[-4,-1,HILL],[9,-4,MARSH],[8,-3,MARSH],[5,2,POND],[5,1,POND] ];

    var URBAN_COMBAT = [ [0,-5,CLEAR],[1,0,CLEAR],[2,0,CLEAR],[3,0,CLEAR],[4,0,CLEAR],[5,0,CLEAR],[6,0,CLEAR],[7,0,CLEAR],
        [-1,0,CLEAR],[-2,0,CLEAR],[-3,0,CLEAR],[-4,0,CLEAR],[-5,0,CLEAR],[-6,0,CLEAR],[-7,0,CLEAR],[7,1,CLEAR],[6,1,CLEAR],
        [4,1,CLEAR],[3,1,CLEAR],[-1,1,CLEAR],[-2,1,CLEAR],[-3,1,CLEAR],[-4,1,CLEAR],[-5,1,CLEAR],[-8,1,CLEAR],[-2,-1,CLEAR],
        [-1,-1,CLEAR],[4,-1,CLEAR],[6,-1,CLEAR],[9,-3,CLEAR],[8,-5,CLEAR],[7,-5,CLEAR],[5,-5,CLEAR],[4,-5,CLEAR],[-2,-5,CLEAR],
        [-3,-5,CLEAR],[-6,-3,CLEAR],[-8,2,CLEAR],[-9,3,CLEAR],[-9,4,CLEAR],[-8,5,CLEAR],[-8,4,CLEAR],[-8,3,CLEAR],[-7,3,CLEAR],
        [-6,3,CLEAR],[-7,4,CLEAR],[-5,5,CLEAR],[-5,2,CLEAR],[-4,2,CLEAR],[-4,3,CLEAR],[-4,4,CLEAR],[-3,2,CLEAR],[-2,2,CLEAR],
        [-1,2,CLEAR],[-2,4,CLEAR],[3,5,CLEAR],[6,2,CLEAR],[4,2,CLEAR],[4,3,CLEAR],[4,4,CLEAR],[2,3,CLEAR],[3,2,CLEAR],[2,2,CLEAR],
        [1,3,CLEAR],[-2,-4,CLEAR],[-4,-4,CLEAR],[-5,-3,CLEAR],[-5,-2,CLEAR],[-1,-4,CLEAR],[-1,-3,CLEAR],[-2,-2,CLEAR],[1,-3,CLEAR],
        [2,-3,CLEAR],[1,-2,CLEAR],[4,-4,CLEAR],[4,-3,CLEAR],[4,-2,CLEAR],[5,-3,CLEAR],[7,-4,CLEAR],[8,-4,CLEAR],[-4,-5,CLEAR],
        [-6,-2,CLEAR],[-2,5,CLEAR],[2,4,CLEAR],[3,3,CLEAR],[4,5,CLEAR],[5,4,CLEAR],[5,3,CLEAR],[6,3,CLEAR],[5,5,CLEAR],[8,-1,CLEAR],
        [7,-2,CLEAR],[7,-3,CLEAR],[5,-2,CLEAR],[5,-1,CLEAR],[5,-4,CLEAR],[-1,-5,CLEAR],[0,-4,CLEAR],[0,-2,CLEAR],[1,-1,CLEAR],
        [2,1,CLEAR],[0,0,CLEAR],[-4,-3,CLEAR],[-3,-3,CLEAR],[-4,-2,CLEAR],[-4,-1,CLEAR],[-5,-1,CLEAR],[-6,2,CLEAR],[2,-5,CLEAR],
        [1,-5,CLEAR],[2,-4,CLEAR],[1,-4,CLEAR],[8,-3,CLEAR],[5,2,CLEAR],[5,1,CLEAR],[1,4,CLEAR],[0,4,CLEAR],[-1,5,CLEAR],
        [0,5,CLEAR],[2,-2,CLEAR],[3,-1,CLEAR],[2,-1,CLEAR],[7,-1,TOWN],[8,-2,TOWN],[-1,4,TOWN],[-1,3,TOWN],[0,3,TOWN],[0,2,TOWN],
        [1,2,TOWN],[1,1,TOWN],[0,1,TOWN],[-4,5,TOWN],[-3,5,TOWN],[-3,4,TOWN],[-2,3,TOWN],[-3,3,TOWN],[9,-4,FOREST],[9,-5,FOREST],
        [6,-5,FOREST],[6,-2,FOREST],[6,-3,FOREST],[6,-4,FOREST],[3,-2,FOREST],[3,-3,FOREST],[3,-4,FOREST],[3,-5,FOREST],
        [3,4,FOREST],[2,5,FOREST],[1,5,FOREST],[-9,5,FOREST],[-10,5,FOREST],[-7,5,FOREST],[-7,1,FOREST],[-6,1,FOREST],
        [-7,2,FOREST],[0,-3,FOREST],[-1,-2,FOREST],[-3,-4,FOREST],[0,-1,HILL],[-6,-1,HILL],[-7,-1,HILL],[-5,-4,HILL],[-5,-5,HILL],
        [10,-5,HILL],[-3,-1,MARSH],[-3,-2,MARSH],[-2,-3,MARSH],[-5,4,MARSH],[-6,5,MARSH],[-5,3,POND],[-6,4,POND] ];

    var HILL_107 = [ [0,-5,CLEAR],[0,3,CLEAR],[1,0,CLEAR],[2,0,CLEAR],[3,0,CLEAR],[4,0,CLEAR],[5,0,CLEAR],[6,0,CLEAR],
        [7,0,CLEAR],[-1,0,CLEAR],[-2,0,CLEAR],[-3,0,CLEAR],[-4,0,CLEAR],[-5,0,CLEAR],[-6,0,CLEAR],[-7,0,CLEAR],[7,1,CLEAR],
        [6,1,CLEAR],[4,1,CLEAR],[3,1,CLEAR],[-1,1,CLEAR],[-2,1,CLEAR],[-5,1,CLEAR],[-8,1,CLEAR],[-2,-1,CLEAR],[-1,-1,CLEAR],
        [4,-1,CLEAR],[6,-1,CLEAR],[7,-1,CLEAR],[9,-3,CLEAR],[9,-5,CLEAR],[10,-5,CLEAR],[8,-5,CLEAR],[7,-5,CLEAR],[6,-5,CLEAR],
        [5,-5,CLEAR],[4,-5,CLEAR],[-2,-5,CLEAR],[-5,-5,CLEAR],[-6,-3,CLEAR],[-8,2,CLEAR],[-9,3,CLEAR],[-8,5,CLEAR],[-8,4,CLEAR],
        [-8,3,CLEAR],[-7,3,CLEAR],[-6,3,CLEAR],[-7,4,CLEAR],[-7,5,CLEAR],[-4,5,CLEAR],[-5,5,CLEAR],[-6,5,CLEAR],[-6,4,CLEAR],
        [-5,4,CLEAR],[-4,4,CLEAR],[-3,3,CLEAR],[-3,2,CLEAR],[-2,2,CLEAR],[-1,2,CLEAR],[-1,3,CLEAR],[-2,4,CLEAR],[-3,5,CLEAR],
        [-1,4,CLEAR],[3,5,CLEAR],[6,2,CLEAR],[4,2,CLEAR],[4,3,CLEAR],[4,4,CLEAR],[2,3,CLEAR],[3,2,CLEAR],[2,2,CLEAR],[1,3,CLEAR],
        [-2,-4,CLEAR],[-5,-3,CLEAR],[-5,-2,CLEAR],[-2,-3,CLEAR],[-1,-4,CLEAR],[-1,-3,CLEAR],[-1,-2,CLEAR],[-2,-2,CLEAR],
        [2,-3,CLEAR],[1,-2,CLEAR],[3,-3,CLEAR],[4,-4,CLEAR],[4,-3,CLEAR],[4,-2,CLEAR],[5,-3,CLEAR],[6,-4,CLEAR],[7,-4,CLEAR],
        [8,-4,CLEAR],[6,-2,CLEAR],[-5,-4,CLEAR],[-6,-2,CLEAR],[-7,-1,CLEAR],[-6,-1,CLEAR],[7,-3,CLEAR],[-1,-5,CLEAR],
        [-3,-1,CLEAR],[-3,-4,CLEAR],[0,-4,CLEAR],[0,-3,CLEAR],[0,-1,CLEAR],[0,0,CLEAR],[-4,-3,CLEAR],[-3,-3,CLEAR],[-3,-2,CLEAR],
        [-4,-2,CLEAR],[-4,-1,CLEAR],[-5,-1,CLEAR],[-6,2,CLEAR],[-6,1,CLEAR],[-7,2,CLEAR],[-7,1,CLEAR],[2,-5,CLEAR],[1,-5,CLEAR],
        [2,-4,CLEAR],[1,-4,CLEAR],[9,-4,CLEAR],[8,-2,CLEAR],[5,2,CLEAR],[5,1,CLEAR],[1,4,CLEAR],[0,4,CLEAR],[0,5,CLEAR],
        [-3,4,CLEAR],[-2,3,CLEAR],[0,2,CLEAR],[0,1,CLEAR],[2,-2,CLEAR],[3,-2,CLEAR],[3,-1,CLEAR],[5,3,TOWN],[6,3,TOWN],
        [5,4,TOWN],[4,5,TOWN],[5,5,TOWN],[-2,5,FOREST],[-1,5,FOREST],[1,5,FOREST],[1,2,FOREST],[1,1,FOREST],[2,1,FOREST],
        [-4,-4,FOREST],[-3,-5,FOREST],[-4,-5,FOREST],[8,-3,FOREST],[7,-2,FOREST],[5,-4,FOREST],[8,-1,HILL],[1,-1,HILL],
        [2,-1,HILL],[1,-3,HILL],[0,-2,HILL],[3,-5,HILL],[3,-4,HILL],[-9,4,HILL],[-10,5,HILL],[-9,5,HILL],[-4,2,HILL],[-4,1,HILL],
        [-3,1,HILL],[-5,2,HILL],[-5,3,HILL],[-4,3,HILL],[2,5,MARSH],[3,4,MARSH],[5,-1,MARSH],[5,-2,MARSH],[6,-3,MARSH],
        [2,4,POND],[3,3,POND] ];

    var TIGER_HEAVEN = [ [0,-5,CLEAR],[0,3,CLEAR],[1,0,CLEAR],[2,0,CLEAR],[3,0,CLEAR],[4,0,CLEAR],[5,0,CLEAR],[6,0,CLEAR],
        [7,0,CLEAR],[-1,0,CLEAR],[-2,0,CLEAR],[-3,0,CLEAR],[-4,0,CLEAR],[-5,0,CLEAR],[-6,0,CLEAR],[-7,0,CLEAR],[7,1,CLEAR],
        [6,1,CLEAR],[3,1,CLEAR],[-1,1,CLEAR],[-2,1,CLEAR],[-4,1,CLEAR],[-5,1,CLEAR],[-2,-1,CLEAR],[-1,-1,CLEAR],[4,-1,CLEAR],
        [6,-1,CLEAR],[7,-1,CLEAR],[9,-5,CLEAR],[10,-5,CLEAR],[8,-5,CLEAR],[7,-5,CLEAR],[6,-5,CLEAR],[-2,-5,CLEAR],[-3,-5,CLEAR],
        [-5,-5,CLEAR],[-6,-3,CLEAR],[-9,3,CLEAR],[-9,4,CLEAR],[-10,5,CLEAR],[-8,3,CLEAR],[-7,3,CLEAR],[-6,3,CLEAR],[-4,5,CLEAR],
        [-5,5,CLEAR],[-6,5,CLEAR],[-6,4,CLEAR],[-5,4,CLEAR],[-5,3,CLEAR],[-5,2,CLEAR],[-4,2,CLEAR],[-4,3,CLEAR],[-4,4,CLEAR],
        [-3,3,CLEAR],[-2,2,CLEAR],[-1,2,CLEAR],[-1,3,CLEAR],[-2,4,CLEAR],[-3,5,CLEAR],[3,5,CLEAR],[6,2,CLEAR],[4,4,CLEAR],
        [2,3,CLEAR],[2,2,CLEAR],[1,3,CLEAR],[-2,-4,CLEAR],[-4,-4,CLEAR],[-5,-3,CLEAR],[-2,-3,CLEAR],[-1,-4,CLEAR],[-1,-3,CLEAR],
        [-1,-2,CLEAR],[-2,-2,CLEAR],[2,-3,CLEAR],[1,-2,CLEAR],[3,-3,CLEAR],[4,-3,CLEAR],[4,-2,CLEAR],[5,-3,CLEAR],[6,-4,CLEAR],
        [7,-4,CLEAR],[8,-4,CLEAR],[6,-2,CLEAR],[-4,-5,CLEAR],[-5,-4,CLEAR],[-7,-1,CLEAR],[2,5,CLEAR],[3,4,CLEAR],[2,4,CLEAR],
        [4,5,CLEAR],[5,4,CLEAR],[5,3,CLEAR],[6,3,CLEAR],[5,5,CLEAR],[8,-1,CLEAR],[7,-2,CLEAR],[7,-3,CLEAR],[5,-2,CLEAR],
        [6,-3,CLEAR],[5,-1,CLEAR],[5,-4,CLEAR],[3,-5,CLEAR],[3,-4,CLEAR],[-1,-5,CLEAR],[-3,-1,CLEAR],[-3,-4,CLEAR],[0,-4,CLEAR],
        [0,-1,CLEAR],[1,-1,CLEAR],[1,2,CLEAR],[2,1,CLEAR],[0,0,CLEAR],[-4,-3,CLEAR],[-3,-3,CLEAR],[-3,-2,CLEAR],[-4,-2,CLEAR],
        [-4,-1,CLEAR],[-6,2,CLEAR],[-6,1,CLEAR],[-7,2,CLEAR],[2,-5,CLEAR],[1,-5,CLEAR],[2,-4,CLEAR],[9,-4,CLEAR],[8,-3,CLEAR],
        [5,2,CLEAR],[1,4,CLEAR],[0,4,CLEAR],[0,5,CLEAR],[1,5,CLEAR],[-3,4,CLEAR],[-2,3,CLEAR],[0,2,CLEAR],[0,1,CLEAR],
        [1,1,CLEAR],[2,-2,CLEAR],[3,-2,CLEAR],[3,-1,CLEAR],[2,-1,CLEAR],[-9,5,TOWN],[-8,4,TOWN],[-7,5,FOREST],[-7,4,FOREST],
        [-8,5,FOREST],[4,-5,FOREST],[5,-5,FOREST],[4,-4,FOREST],[-5,-2,TOWN],[-5,-1,HILL],[-6,-1,HILL],[-6,-2,HILL],[-8,2,HILL],
        [-7,1,HILL],[-8,1,HILL],[-2,5,HILL],[-1,4,HILL],[-1,5,HILL],[5,1,HILL],[4,1,HILL],[3,2,HILL],[3,3,HILL],[4,3,HILL],
        [4,2,HILL],[8,-2,HILL],[9,-3,HILL],[0,-2,FOREST],[1,-4,MARSH],[0,-3,MARSH],[1,-3,CLEAR],[-3,2,POND],[-3,1,POND] ];

    Maps.insert(new Map("Half and Half", HALF_AND_HALF, [1, -1], 16, 11));
    Maps.insert(new Map("Knife Fight", KNIFE_FIGHT, [1, -1], 16, 11));
    Maps.insert(new Map("High Ground", HIGH_GROUND, [0, 1], 16, 11));
    Maps.insert(new Map("Urban Combat", URBAN_COMBAT, [0, 2], 16, 11));
    Maps.insert(new Map("Hill 107", HILL_107, [1, -1], 16, 11));
    Maps.insert(new Map("Tiger Heaven", TIGER_HEAVEN, [0, -2], 16, 11));
};

Seed.unitCards = function(){
    function makeUnit(name, sprite, faction, type, cost, speed, defense, soldierAttacks, vehicleAttacks){
        UnitCards.insert(new UnitCard({
            name: name,
            sprite: sprite,
            faction: faction,
            type: type,
            cost: cost,
            speed: speed,
            defense: defense,
            soldierAttacks: soldierAttacks,
            vehicleAttacks: vehicleAttacks
        }));
    }

    var ALLIED_SOLDIER_SPRITE = "green_soldier.png";
    var ALLIED_VEHICLE_SPRITE = "green_tank.png";

    var AXIS_SOLDIER_SPRITE = "gray_soldier.png";
    var AXIS_VEHICLE_SPRITE = "gray_tank.png";

    makeUnit("M1 Garand Rifle", ALLIED_SOLDIER_SPRITE, Faction.ALLIES, UnitType.SOLDIER, 4, 1, [4, 4], [8, 7], [2]);
    makeUnit("Marines M2-2 Flamethrower", ALLIED_SOLDIER_SPRITE, Faction.ALLIES, UnitType.SOLDIER, 5, 1, [4, 4], [10], [7]);
    makeUnit("Vickers Machine-Gun Team", ALLIED_SOLDIER_SPRITE, Faction.ALLIES, UnitType.SOLDIER, 8, 1, [4, 4], [9, 8, 6], [3, 3, 2]);
    makeUnit("Bazooka", ALLIED_SOLDIER_SPRITE, Faction.ALLIES, UnitType.SOLDIER, 4, 1, [4, 4], [4], [9, 4]);
    makeUnit("Cavalrymen", ALLIED_SOLDIER_SPRITE, Faction.ALLIES, UnitType.SOLDIER, 4, 4, [3, 3], [7, 5], [2]);

    makeUnit("3\" Gun M5", ALLIED_VEHICLE_SPRITE, Faction.ALLIES, UnitType.VEHICLE, 12, 1, [3, 3], [3, 3, 3], [14, 12, 10]);
    makeUnit("M4A1 Sherman", ALLIED_VEHICLE_SPRITE, Faction.ALLIES, UnitType.VEHICLE, 21, 4, [5, 4], [9, 9, 7], [13, 11, 9]);
    makeUnit("Guards T-34/85", ALLIED_VEHICLE_SPRITE, Faction.ALLIES, UnitType.VEHICLE, 33, 4, [6, 5], [8, 8, 6], [15, 13, 11]);
    makeUnit("Humber Scout Car", ALLIED_VEHICLE_SPRITE, Faction.ALLIES, UnitType.VEHICLE, 8, 5, [3, 2], [9, 8, 7], [2, 2, 2]);
    makeUnit("7TPDW", ALLIED_VEHICLE_SPRITE, Faction.ALLIES, UnitType.VEHICLE, 8, 3, [2, 2], [9, 8, 7], [2, 2, 2]);


    makeUnit("Mauser Kar 98K", AXIS_SOLDIER_SPRITE, Faction.AXIS, UnitType.SOLDIER, 3, 1, [4, 4], [8, 6], [2]);
    makeUnit("SNLF Captain", AXIS_SOLDIER_SPRITE, Faction.AXIS, UnitType.SOLDIER, 6, 1, [4, 4], [10, 4], [2]);
    makeUnit("Imperial Sniper", AXIS_SOLDIER_SPRITE, Faction.AXIS, UnitType.SOLDIER, 8, 1, [4, 3], [7, 7, 7], [2, 2, 2]);
    makeUnit("Antitank Grenadier", AXIS_SOLDIER_SPRITE, Faction.AXIS, UnitType.SOLDIER, 5, 1, [4, 4], [7, 5], [9]);
    makeUnit("Type 89 Mortar", AXIS_SOLDIER_SPRITE, Faction.AXIS, UnitType.SOLDIER, 9, 1, [3, 3], [3, 7, 7], [1, 4, 4]);

    makeUnit("PAK 40 Antitank Gun", AXIS_VEHICLE_SPRITE, Faction.AXIS, UnitType.VEHICLE, 14, 1, [3, 3], [3, 3, 3], [15, 13, 13]);
    makeUnit("SD KFZ 251", AXIS_VEHICLE_SPRITE, Faction.AXIS, UnitType.VEHICLE, 11, 4, [4, 3], [5, 5, 4], [9, 8, 6]);
    makeUnit("SS-Panzer IV Ausf. F2", AXIS_VEHICLE_SPRITE, Faction.AXIS, UnitType.VEHICLE, 32, 3, [5, 3], [7, 7, 6], [15, 13, 13]);
    makeUnit("SD KFZ 222", AXIS_VEHICLE_SPRITE, Faction.AXIS, UnitType.VEHICLE, 8, 5, [2, 2], [7, 6, 4], [4, 3, 2]);
    makeUnit("Type 2 KA-M1", AXIS_VEHICLE_SPRITE, Faction.AXIS, UnitType.VEHICLE, 8, 3, [2, 2], [7, 7, 7], [7, 6, 5]);
};