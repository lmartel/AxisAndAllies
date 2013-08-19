Army = _Army;
function _Army(game, faction){
    this.MAX_POINTS = 100;

    this.ready = false;
    this.points = 0;
    this.gameId = game._id;
    this.faction = faction;
    this.units = [];
}
_Army.prototype.add = function(unit, count){
    var cost = unit.cost * count;
    if(cost > this.MAX_POINTS - this.points) return false;
    for(var i = 0; i < count; i++) this.units.push(unit);
    this.points += cost;
    return true;
};

/**
 * Remove units from the army by name, up to a maximum of {count}
 * Count param is optional--if omitted, removes all units with the given name.
 * Returns the number of units successfully removed.
 */
_Army.prototype.remove = function(name, count){
    if(count <= 0) return 0;
    var removed = 0;
    var _self = this;
    this.units = this.units.filter(function(unit){
        var keep = (count && removed === count) || unit.name !== name;
        if(!keep){
            removed++;
            _self.points -= unit.cost;
        }
        return keep;
    });
    return removed;
};

_Army.prototype.finalize = function(){
    this.ready = true;
};

UnitCard = _UnitCard;
function _UnitCard(options){
    // TODO: special abilities
    // special = special || {};

    // Basic fields
    var required = ["name", "faction", "type", "cost", "speed"];
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

    this.attacks = {};
    var sAtk = options["soldierAttacks"];
    if(sAtk instanceof Array){
        this.attacks.soldier = {
            short: sAtk[0] || null,
            medium: sAtk[1] || null,
            long: sAtk[2] || null
        }
    } else throw "unit creation: options hash missing required field: soldierAttacks (format: [short, med, long] )";
    var vAtk = options["vehicleAttacks"];
    if(vAtk instanceof Array){
        this.attacks.vehicle = {
            short: vAtk[0] || null,
            medium: vAtk[1] || null,
            long: vAtk[2] || null
        }
    } else throw "unit creation: options hash missing required field: vehicleAttacks (format: [short, med, long] )";
}

Faction = null;
(function(){
    var faction = {
        ALLIES: "Allies",
        AXIS: "Axis"
    };

    Faction = Object.freeze(faction);
})();

UnitType = null;
(function(){
    var unitType = {
        SOLDIER: "Soldier",
        VEHICLE: "Vehicle"
    };

    UnitType = Object.freeze(unitType);
})();