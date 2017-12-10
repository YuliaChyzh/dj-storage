//import resourses
var fs = require('fs');
var Promise = require("bluebird");

class DDLCreateImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.create error";
  }
}

module.exports = {
    name: "ddl.create",
    synonims: {
        "ddl.create":"ddl.create",
        "ddl.entity":"ddl.create"
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
            for item in command.settings {
                Entities
                .findOne({name:item.name.toLowerCase()})
                .then((col) => {
                    if (col){
                        reject(new DDLCreateImplError(`Doublicate '${item.name}' collection`))
                        return
                    }

                    fs.writeFileSync(   `./api/models/${item.name}.js`, 
                                `module.exports = ${JSON.stringify(item.model)}`
                            );
                    try {
                        Entities.create({
                            name: item.name,
                            schema: item.model
                        }).then((res) => {
                            try {
                                sails.hooks.orm.reload();
                                state.head = {
                                            data: res,
                                            type: "json"
                                         }
                                sails.once("hook:orm:reloaded", () => {
                                  console.log("create:hook:orm:reloaded")  
                                  resolve(state);
                                })
                            } catch (e) {
                                reject(new DDLCreateImplError(e.toString())) 
                            }                
                        })             
                    } catch (e) {
                        reject(new DDLCreateImplError(e.toString())) 
                    }        
                }    
            }
        })
    },

    help: {
        synopsis: "Create new models",
        name: {
            "default": "ddl.create",
            synonims: ["ddl.entity"]
        },
        input: ["waterline models description"],
        output: "json",
        "default param": "model",
        params: [{
            name: "model",
            synopsis: "Models name. Retuns message about error when model name is doublicate",
            type: ["string"],
            synonims: ["model", "for","entity","collection"],
            "default value": "undefined"
        }],
        example: {
            description: "Create new models if this models don't exist",
            code: "create()"
        }

    }
}
