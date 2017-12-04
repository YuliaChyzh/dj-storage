
// var Promise = require("bluebird");



var dmCreateImplError = function(message) {
    this.message = message;
    this.name = "Command 'create_entity' implementation error";
}
dmCreateImplError.prototype = Object.create(Error.prototype);
dmCreateImplError.prototype.constructor = dmCreateImplError;



var impl = function(data, params){
	return new Promise(function(resolve,reject){
        var collection = sails.models[params.collection]
        resolve(sails.models[params.collection].create(data))
	})
}

module.exports =  {
    name: "dml.insert",
    synonims: {
        "dml.insert": "dml.insert"
    },

    "internal aliases":{
        "collection": "collection",
        "object": "collection",
        "entity":"collection",
        "into":"collection"
    },
    
    defaultProperty: {},

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            var model = command.settings.collection;
            if(!sails.models[model])
                reject(new dmCreateImplError("Entity collection '" + model + "' is not available"))
            if(typeof sails.models[model] != "object")
                reject(new dmCreateImplError("Entity collection '" + model + "' is not available"))
            state.locale = (state.locale) ? state.locale : "en";
            command.settings.locale = state.locale;
            command.settings.script = state.instance.script();
            // context is default data if data params not found
            command.settings.data = command.settings.data || state.head.data;
            
            impl(command.settings.data, command.settings)
                .then(function(result) {
                    state.head = {
                        type: "json",
                        data: result
                    }
                    resolve(state);
                })
                .catch(function(e) {
                    reject(e)
                })
        })
    },

    help: {
        synopsis: "Create new entity collection",
        name: {
            "default": "dml.insert",
            synonims: ["dml.insert"]
        },
        input: ["waterline entity description"],
        output: "json",
        "default param": "collection",
        params: [{
            name: "collection",
            synopsis: "Collection name. Retuns message about error when entity collection is not available",
            type: ["string"],
            synonims: ["collection","object","entity","into"],
            "default value": "undefined"
        }],
        example: {
            description: "Create new entity collection",
            code: "insert()"
        }

    }
}