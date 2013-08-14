Army = _Army;
function _Army(game, faction){
    this.MAX_POINTS = 100;

    this.points = 0;
    this.gameId = game._id;
    this.faction = faction;
    this.units = [];
}
_Army.prototype.add = function(unit){
    if(unit.cost > this.MAX_POINTS - this.points) return false;
    this.units.push(unit);
    this.points += unit.cost;
    return true;
};

Unit = _Unit;
function _Unit(options){
    // TODO: special abilities
    // special = special || {};

    // Basic fields
    var required = ["name", "nationality", "type", "cost", "speed"];
    for(var i = 0; i < required.length; i++){
        var field = required[i];
        if(!options[field]) throw "unit creation: options hash missing required field: " + field;
        this[field] = options[field];
    }

    // Combat fields
    var combat = ["defense", "soldierAttacks", "vehicleAttacks"];
    var def = options.defense;
    if(def instanceof Array && def.length === 2){
        this.defense = {
            front: def[0],
            rear: def[1]
        }
    } else throw "unit creation: options hash missing required field: defense (format: [front, rear] )";

    this.attack = {};
    var sAtk = options["soldierAttacks"];
    if(sAtk instanceof Array){
        this.attack.soldier = {
            short: sAtk[0] || null,
            medium: sAtk[1] || null,
            long: sAtk[2] || null
        }
    } else throw "unit creation: options hash missing required field: soldierAttacks (format: [short, med, long] )";
    var vAtk = options["vehicleAttacks"];
    if(vAtk instanceof Array){
        this.attack.vehicle = {
            short: vAtk[0] || null,
            medium: vAtk[1] || null,
            long: vAtk[2] || null
        }
    } else throw "unit creation: options hash missing required field: vehicleAttacks (format: [short, med, long] )";
}

Faction = {};
(function(){
    var faction = {
        ALLIES: { value: 0, name: "Allies" },
        AXIS: { value: 1, name: "Axis" }
    };

    Faction = Object.freeze(setupEnumMapping(faction, ["value", "name"]));
})();

UnitType = {};
(function(){
    var unitType = {
        SOLDIER: { value: 0, name: "Soldier" },
        VEHICLE: { value: 1, name: "Vehicle" }
    };

    UnitType = Object.freeze(setupEnumMapping(unitType, ["value", "name"]));
})();