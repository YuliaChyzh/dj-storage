var fs = require('fs');
var Promise = require("bluebird");
var del = require("del");

class DDLDropImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.drop error";
  }
}

module.exports = {
    name: "ddl.drop",
    synonims: {
        "ddl.drop":"ddl.drop",
        "ddl.destroy":"ddl.drop"
    },

    "internal aliases":{
        "model":"model",
        "for":"model",
        "entity":"model",
        "collection":"model"
    },

    defaultProperty: {
        "ddl.drop":"model",
        "ddl.destroy":"model"
    },


    execute: function(command, state) {
        return new Promise((resolve, reject) => {
            for item in command.settings {
                Entities
                .findOne({name:item.model.toLowerCase()})
                .then((col) => {
                    if (!col){
                        reject(new DDLDropImplError(`Collection '${item.model}' not found`))
                        return
                    }

                    del(`./api/models/${item.model}.js`)
                    .then (() => {
                        try {
                            Entities.destroy({name: item.model})
                            .then((res) => {
                                try {
                                    sails.hooks.orm.reload();
                                    state.head = {
                                                data: res,
                                                type: "json"
                                             }
                                    sails.once("hook:orm:reloaded", () => {
                                      console.log("drop:hook:orm:reloaded")  
                                      resolve(state);
                                    })
                                } catch (e) {
                                    reject(new DDLDropImplError(e.toString())) 
                                }                
                            })             
                        } catch (e) {
                            reject(new DDLDropImplError(e.toString())) 
                        }    
                    })
                    .catch (e =>  reject (new DDLDropError(e.toString())))
                })         
            }
        })
    },

    help: {
        synopsis: "Delete selected models",
        name: {
            "default": "ddl.drop",
            synonims: ["ddl.destroy"]
        },
        input: ["waterline models description"],
        output: "json",
        "default param": "model",
        params: [{
            name: "model",
            synopsis: "Models name. Retuns message about error when model name isn't found",
            type: ["string"],
            synonims: ["model", "for","entity","collection"],
            "default value": "undefined"
        }],
        example: {
            description: "Delete selected models",
            code: "drop()"
        }

    }
}
