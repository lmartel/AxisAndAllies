Seed = {};
Seed.maps = function(){
    var CLEAR = "grass.jpg";
    var MARSH = "marsh.jpg";
    var TOWN = "town.jpg";
    var FOREST = "forest.jpg";
    var HILL = "hill.jpg";
    var POND = "pond.jpg";
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
    Maps.insert(new Map("Half and Half", HALF_AND_HALF));
};

Seed.unitCards = function(){
    function makeUnit(name, faction, type, cost, speed, defense, soldierAttacks, vehicleAttacks){
        UnitCards.insert(new UnitCard({
            name: name,
            faction: faction,
            type: type,
            cost: cost,
            speed: speed,
            defense: defense,
            soldierAttacks: soldierAttacks,
            vehicleAttacks: vehicleAttacks
        }));
    }

    makeUnit("M1 Garand Rifle", Faction.ALLIES, UnitType.SOLDIER, 4, 1, [4, 4], [8, 7], [2]);
    makeUnit("M4A1 Sherman", Faction.ALLIES, UnitType.VEHICLE, 21, 4, [5, 4], [9, 9, 7], [13, 11, 9]);

    makeUnit("Mauser Kar 98K", Faction.AXIS, UnitType.SOLDIER, 3, 1, [4, 4], [8, 6], [2]);
    makeUnit("Panzer IV Ausf. G", Faction.AXIS, UnitType.VEHICLE, 30, 3, [5, 3], [7, 7, 6], [15, 13, 11]);
};