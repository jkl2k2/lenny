const index = require(`../index.js`);
const Discord = require(`discord.js`);
const fs = require('fs');
const logger = index.getLogger();

function check(arr, index) {
    if(arr[index]) {
        return `${index + 1}. ID: ${arr[index]}`;
    } else {
        return " ";
    }
}

module.exports = {
    name: 'ligma',
    description: 'Manage the ligma list',
    // aliases: ['aliases'],
    usage: '[add/remove/view] [ID/mention]',
    // cooldown: 5,
    guildOnly: true,
    execute(message, args) {

        var objectToWrite = {
            list: []
        };

        if (args[0] == "add" || args[0] == "view") {
            // read file sample.json file
            fs.readFile('./commands/ligma.json',
                // callback function that is called when reading file is done
                function (err, data) {
                    // json data
                    var jsonData = data;

                    // parse json
                    var jsonParsed = JSON.parse(jsonData);

                    objectToWrite.list = jsonParsed.list

                    if (args[0] == "view") {
                        message.channel.send(`${check(objectToWrite.list, 0)}\n${check(objectToWrite.list, 1)}\n ${check(objectToWrite.list, 2)}\n${check(objectToWrite.list, 3)}\n${check(objectToWrite.list, 4)}`);
                        
                        return;
                    }

                    if (objectToWrite.list.indexOf(args[1]) == -1) {
                        objectToWrite.list.push(args[1]);

                        let addedEmbed = new Discord.RichEmbed()
                             
                            .addField(`:white_check_mark: Added to ligma list`, `Added '${args[1]}' to the ligma list`)
                            .setColor(`#44C408`)
                        message.channel.send(addedEmbed);
                    } else {
                        let addFailEmbed = new Discord.RichEmbed()
                             
                            .addField(`<:error:643341473772863508> Failed to add`, `'${args[1]}' is already in the list`)
                            .setColor(`#FF0000`)
                        message.channel.send(addFailEmbed);
                    }

                    // console.log(objectToWrite.list);

                    // access elements
                    // console.log(jsonParsed.list);
                });

            setTimeout(function () {
                fs.writeFile("./commands/ligma.json", JSON.stringify(objectToWrite, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    };
                    logger.info("File has been created");
                });
            }, 500);
        } else if (args[0] == "remove") {
            // read file sample.json file
            fs.readFile('./commands/ligma.json',
                // callback function that is called when reading file is done
                function (err, data) {
                    // json data
                    var jsonData = data;

                    // parse json
                    var jsonParsed = JSON.parse(jsonData);

                    objectToWrite.list = jsonParsed.list

                    if (objectToWrite.list.indexOf(args[1]) != -1) {
                        objectToWrite.list.splice(objectToWrite.list.indexOf(args[1]), 1);

                        let removeEmbed = new Discord.RichEmbed()
                             
                            .addField(`:white_check_mark: Removed from ligma list`, `Removed '${args[1]}' from ligma list`)
                            .setColor(`#44C408`)
                        message.channel.send(removeEmbed);
                    } else {
                        let removeFailEmbed = new Discord.RichEmbed()
                             
                            .addField(`<:error:643341473772863508> Failed to remove`, `'${args[1]}' is not in the list`)
                            .setColor(`#FF0000`)
                        message.channel.send(removeFailEmbed);
                    }

                    // console.log(objectToWrite.list);

                    // access elements
                    // console.log(jsonParsed.list);
                });

            setTimeout(function () {
                fs.writeFile("./commands/ligma.json", JSON.stringify(objectToWrite, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    };
                    logger.info("File has been created");
                });
            }, 500);
        }
    }
}