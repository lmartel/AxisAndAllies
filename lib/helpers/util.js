/**
 * Set up reverse mapping of (property -> enum instance) for lookup
 */
setupEnumMapping = function (target, propNames){
    for(var instance in target){
        if(!target.hasOwnProperty(instance)) continue;
        for(var i = 0; i < propNames.length; i++){
            var propName = propNames[i];
            target[target[instance][propName]] = target[instance];
        }
    }
    return target;
};

safeDOMEmpty = function(selector){
    var container = $(selector);
    var contents = container.find("*");
    for(var i = 0; i < contents.length; i++){
        Spark.finalize(contents[i]);
    }
    container.empty();
    return container;
};

formToHash = function(selector){
    var values = {};
    $.each($(selector).find("input").serializeArray(), function(i, field) {
        values[field.name] = field.value;
    });
    return values;
};

getKeyFromValue = function(obj, val){
    for(var prop in obj){
        if(obj.hasOwnProperty(prop) && obj[prop] === val) return prop;
    }
    return undefined;
};

hasOwnValue = function(obj, val){
    return getKeyFromValue(obj, val) !== undefined;
};

renderTemplate = function(template, context){
    return function(){
        return template(context);
    }
};

titleize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

injectPrototype = function(obj, klass){
    if(obj) obj.__proto__ = klass.prototype;
    return obj;
};

arrayEquals = function(xs, ys){
    return JSON.stringify(xs) === JSON.stringify(ys);
};

oppositeDirection = function(dir){
    var span = H$.DIRECTION.END - H$.DIRECTION.START;
    return H$.DIRECTION[(dir.value + (span/2)) % span];
};

/**
 * Get the unit card given either a Unit id, Unit, or UnitCard id.
 * If no param is passed, pulls the card out of the session.
 * @returns {UnitCard}
 */
getCard = _getCard;
function _getCard(arg){
    var id;
    if(arg){
        id = arg.cardId;
        if(id) return UnitCards.findOne(id);

        var argWasCardId = UnitCards.findOne(arg);
        if(argWasCardId) return argWasCardId;

        var argWasUnitId = Units.findOne(arg);
        if(argWasUnitId) return UnitCards.findOne(argWasUnitId.cardId);
    }
    id = Session.get("card");
    if(!id) return undefined;
    return injectPrototype(UnitCards.findOne(id), UnitCard);
}

maxAttackRange = function(attacker, defender){
    var attacks = getCard(attacker).attacks[getCard(defender).type];
    if(attacks.long) return 8;
    if(attacks.medium) return 4;
    if(attacks.short) return 1;
    return null;
};

getAttacks = function(attacker, defender){
    var attacks = getCard(attacker).attacks[getCard(defender).type];
    return attacks.long || attacks.medium || attacks.short || 0;
};

hasStatus = function(unit, status){
    var stat = unit.status;
    if(status) return stat === status;
    return status !== null;
};

countHits = function(attacks, defender){
    var successes = attacks.reduce(function(count, attack){
        if(attack >= 4) count++;
        return count;
    }, 0);
    
    var def = getCard(defender).defense.front; // TODO: facing
    if(hasStatus(defender)){
        def--;
    }

    if(successes < def){
        return 0;
    } else if (successes === def){
        return 1;
    } else if (successes < 2 * def){
        return 2;
    } else {
        return 3;
    }
};

rollCover = function(gameId, unit){
    var loc = unit.location;
    var layout = Maps.findOne(Games.findOne(gameId).mapId);
    var bg;
    for(var i = 0; i < layout.length; i++){
        var hex = layout[i];
        if(hex[0] === loc[0] && hex[1] === loc[1]){
            bg = hex[2];
            break;
        }
    }

    var type = getCard(unit).type;
    var terrain = Terrain[bg];
    var canRoll;
    switch(terrain){
        case Terrain.HOLES:
        case Terrain.MARSH:
            canRoll = (type === UnitType.SOLDIER);
            break;
        case Terrain.FOREST:
        case Terrain.HILL:
        case Terrain.TOWN:
            canRoll = true;
            break;
        default:
            canRoll = false;
            break;
    }
    if(canRoll){
        var roll = Math.floor((Math.random() * 6) + 1);
        if(type === UnitType.SOLDIER){
            return roll >= 4;
        } else {
            return roll >= 5;
        }
    }
    return false;
};

isDisrupted = function(unit){
    return unit.status === UnitStatus.DISRUPTED || unit.status === UnitStatus.DISRUPTED_AND_DAMAGED;
};

isDamaged = function(unit){
    return unit.status === UnitStatus.DAMAGED || unit.status === UnitStatus.DISRUPTED_AND_DAMAGED;
};

getHighlightArgsForStatus = function(status, isActive){
    var color;
    var opacity = 0.1;
    switch(status){
        case UnitStatus.DISRUPTED:
            color = "yellow";
            break;
        case UnitStatus.DAMAGED:
            color = "darkred";
            break;
        case UnitStatus.DISRUPTED_AND_DAMAGED:
            color = "red";
            break;
        case UnitStatus.DESTROYED:
            color = "black";
            opacity = 0.6;
            break;
    }
    if(isActive){
        opacity = 0.5;
    }
    return [color, opacity, isActive];
};

forEachUnitInGame = function(gameId, callback){
    Armies.find({gameId: gameId}).forEach(function(army){
        forEachUnitInArmy(army, callback);
    });
};

forEachUnitInArmy = function(army, callback){
    Units.find({_id: {$in: army.unitIds} }).forEach(callback);
};