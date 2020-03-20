const index = require(`../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);
const jahyID = config.get(`Users.jahyID`);

module.exports = {
    name: 'toggle',
    description: 'Toggles owo command',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    execute(message, args) {
        if (message.author.id != ownerID && message.author.id != jahyID) {
            return;
        }
        if (index.getOwoToggle() === true) {
            index.setOwoToggle(false);
            message.channel.send(new Discord.RichEmbed()
                .setDescription(`:information_source: !owo is now disabled`)
                .setColor(`#0083FF`));
        } else {
            index.setOwoToggle(true);
            message.channel.send(new Discord.RichEmbed()
                .setDescription(`:information_source: !owo is now enabled`)
                .setColor(`#0083FF`));
        }
    }
};