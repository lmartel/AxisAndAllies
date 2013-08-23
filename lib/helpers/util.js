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

hasOwnValue = function(obj, val){
    for(var prop in obj){
        if(obj.hasOwnProperty(prop) && obj[prop] === val) return true;
    }
    return false;
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