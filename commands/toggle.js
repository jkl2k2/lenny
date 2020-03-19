const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
    name: 'toggle',
    description: 'Toggles owo command',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    execute(message, args) {
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