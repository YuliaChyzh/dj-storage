
// var Promise = require("bluebird");



var dmUpdateImplError = function(message) {
    this.message = message;
    this.name = "Command 'update_entity' implementation error";
}
dmUpdateImplError.prototype = Object.create(Error.prototype);
dmUpdateImplError.prototype.constructor = dmUpdateImplError;



var impl = function(data, params){
	return new Promise(function(resolve,reject){
        var collection = sails.models[params.collection]
        resolve(sails.models[params.collection].update({id:params.id},data))
	})
}

module.exports =  {
    name: "dml.update",
    synonims: {
        "dml.update": "dml.update"
    },

    "internal aliases":{
        "collection": "collection",
        "object": "collection",
        "entity":"collection"
    },
    
    defaultProperty: {},

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            var model = command.settings.collection;
            if(!sails.models[model])
                reject(new dmUpdateImplError("Entity collection '" + model + "' is not available"))
            if(typeof sails.models[model] != "object")
                reject(new dmUpdateImplError("Entity collection '" + model + "' is not available"))
            if(!command.settings.id)
                reject(new dmUpdateImplError("Entity id is not defined"))
                
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
        synopsis: "Update entity collection",
        name: {
            "default": "dml.update",
        },
        input: ["waterline entity description"],
        output: "json",
        "default param": "collection",
        params: [{
            name: "collection",
            synopsis: "Collection name. Retuns message about error when entity collection is not available",
            type: ["string"],
            synonims: ["collection","object","entity"],
            "default value": "undefined"
        }],
        example: {
            description: "Update entity collection",
            code: "update()"
        }

    }
}