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

/**
 * Get the unit card given either a Unit id, Unit, or UnitCard id
 * @returns {UnitCard}
 */
getCard = function(arg){
    if(!arg) throw "wtf happened"
    var id = arg.cardId;
    if(id) return UnitCards.findOne(id);
    return UnitCards.findOne(arg) || UnitCards.findOne(Units.findOne(arg).cardId);
};

oppositeDirection = function(dir){
    var span = H$.DIRECTION.END - H$.DIRECTION.START;
    return H$.DIRECTION[(dir.value + (span/2)) % span];
};