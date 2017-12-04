
// var Promise = require("bluebird");
var jp = require("jsonpath");
var parseRef = require("dj-utils").reference.parse;
var getProperty = require("dj-utils").getProperty;

var dmSelectImplError = function(message) {
    this.message = message;
    this.name = "";
}
dmSelectImplError.prototype = Object.create(Error.prototype);
dmSelectImplError.prototype.constructor = dmSelectImplError;

var getModelAssociations = (model) => {
        let res = [];
        for(key in model.definition){
            if(model.attributes[key].model) res.push(key)
        }
        return res;
}

var impl = function(params){
	return new Promise(function(resolve,reject){

        var model = params.collection;
        if(params.ref){
            model = params.ref.collection;
        }    
        
        if(!sails.models[model])
            reject(new dmSelectImplError("Entity collection '" + model + "' is not available"))
        if(typeof sails.models[model] != "object")
            reject(new dmSelectImplError("Entity collection '" + model + "' is not available"))
         
        if(params.ref){
            let ctx = sails
                .models[params.ref.collection]
                .find(params.ref.filter)
            
            params.populate.forEach(key => ctx = ctx.populate(key))
            
            ctx.then((founded) => {
                    try{
                        resolve(founded.map((item) => getProperty(item, params.ref.path)))    
                    }catch (e) {
                        reject (new dmSelectImplError(e.toString()))
                    }
                })
        } else {


            sails.models[params.collection].find({})
                .then((founded) =>{
                    try{
                        resolve(jp.query(founded,params.path))    
                    }catch (e) {
                        reject (new dmSelectImplError(e.toString()))
                    }
                })
        }        
    })
}

module.exports =  {
    name: "dml.select",
    synonims: {
        "dml.select": "dml.select"
    },

    "internal aliases":{
        "collection": "collection",
        "type": "collection",
        "entity":"collection",
        "from": "collection",

        "path": "path",
        "where": "path",

        "ref":"ref",
        "populate": "populate"
    },
    
    defaultProperty: {
        "dml.select": "collection"
    },

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            // var model = command.settings.collection;
            // if(!sails.models[model])
            //     reject(new dmSelectImplError("Entity collection '" + model + "' is not available"))
            // if(typeof sails.models[model] != "object")
            //     reject(new dmSelectImplError("Entity collection '" + model + "' is not available"))
            state.locale = (state.locale) ? state.locale : "en";
            command.settings.locale = state.locale;
            command.settings.script = state.instance.script();
            command.settings.path = command.settings.path || "$.*"

            if(command.settings.ref){
                try {
                    command.settings.ref = parseRef(command.settings.ref)
                    command.settings.collection = command.settings.ref.collection
                } catch (e) {
                    reject( new dmSelectImplError(e) )
                }    
            }

            command.settings.populate = (command.settings.populate)
                                            ? (command.settings.populate == "*")
                                                ? getModelAssociations(sails.models[command.settings.collection])
                                                : command.settings.populate.split(",").map(item => item.trim())
                                            : [];    


            impl(command.settings)
                .then(function(result) {
                    state.head = {
                        type: "json",
                        data: result || []
                    }
                    resolve(state);
                })
                .catch(function(e) {
                    reject(e)
                })
        })
    },

    help: {
        synopsis: "Query for choose entity collection",
        name: {
            "default": "dml.select",
        },
        input: ["waterline entity description"],
        output: "json",
        "default param": "collection",
        params: [{
            name: "collection",
            synopsis: "Collection name. Retuns message about error when entity collection is not available",
            type: ["string"],
            synonims: ["collection","type","entity","from","path","where","ref","populate"],
            "default value": "undefined"
        }],
        example: {
            description: "Query for choose entity collection",
            code: "select()"
        }

    }
}