
// var Promise = require("bluebird");



var dmDeleteImplError = function(message) {
    this.message = message;
    this.name = "Command 'delete_entity' implementation error";
}
dmDeleteImplError.prototype = Object.create(Error.prototype);
dmDeleteImplError.prototype.constructor = dmDeleteImplError;



var impl = function(data, params){
	return new Promise(function(resolve,reject){
        var collection = sails.models[params.collection]
        resolve(sails.models[params.collection].destroy({id:params.id}))
	})
}

module.exports =  {
    name: "dml.delete",
    synonims: {
        "dml.delete": "dml.delete"
    },

    "internal aliases":{
        "collection": "collection",
        "object": "collection",
        "entity":"collection",
        "from": "collection"
    },
    
    defaultProperty: {},

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            var model = command.settings.collection;
            if(!sails.models[model])
                reject(new dmDeleteImplError("Entity collection '" + model + "' is not available"))
            if(typeof sails.models[model] != "object")
                reject(new dmDeleteImplError("Entity collection '" + model + "' is not available"))
            if(!command.settings.id)
                reject(new dmDeleteImplError("Entity id is not defined"))
                
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
        synopsis: "Delete entity collection",
        name: {
            "default": "dml.delete",
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
            description: "Delete entity collection",
            code: "delete()"
        }

    }
}