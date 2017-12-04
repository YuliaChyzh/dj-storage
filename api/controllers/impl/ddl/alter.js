var fs = require('fs');
var Promise = require("bluebird");

class DDLAlterImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.alter error";
  }
}

module.exports = {
    name: "ddl.alter",
    synonims: {
        "ddl.alter":"ddl.alter",
        "ddl.modify":"ddl.alter"
    },

    "internal aliases":{
        "model":"model",
        "for":"model",
        "entity":"model",
        "collection":"model"
    },

    defaultProperty: {
        "ddl.create":"model",
        "ddl.entity":"model"
    },

   

    execute: function(command, state) {
        return new Promise((resolve, reject) => {
            Entities
                .findOne({name:command.settings.name.toLowerCase()})
                .then((col) => {
                    if (!col){
                        reject(new DDLAlterImplError(`Collection '${command.settings.name}' not found`))
                        return
                    }

                    fs.writeFileSync(   `./api/models/${command.settings.name}.js`, 
                                `module.exports = ${JSON.stringify(command.settings.model)}`
                            );
                    try {
                        Entities.create({
                            name: command.settings.name,
                            schema: command.settings.model
                        }).then((res) => {
                            try {
                                sails.hooks.orm.reload()
                                state.head = {
                                    data: res,
                                    type: "json"
                                 }
                                sails.once("hook:orm:reloaded", () => {
                                    console.log("alter:hook:orm:reloaded")  
                                  resolve(state);
                                })        
                            } catch (e) {
                                reject(new DDLAlterImplError(e.toString())) 
                            }                
                        })             
                    } catch (e) {
                        reject(new DDLAlterImplError(e.toString())) 
                    }        
                })         
        })
    },

    help: {
        synopsis: "Modify selected model",
        name: {
            "default": "ddl.alter",
            synonims: ["ddl.modify"]
        },
        input: ["waterline query for model modify"],
        output: "json",
        "default param": "model",
        params: [{
            name: "model",
            synopsis: "Collection name. Retuns message about error when model isn't exist",
            type: ["string"],
            synonims: ["model", "for","entity","collection"],
            "default value": "undefined"
        }],
        example: {
            description: "Modify all selected models",
            code: "alter()"
        }

    }
}
