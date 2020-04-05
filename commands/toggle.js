const index = require(`../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);
const jahyID = config.get(`Users.jahyID`);

module.exports = {
    name: 'toggle',
    description: 'Toggles a command',
    // aliases: ['aliases'],
    args: true,
    usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    execute(message, args) {
        if (message.author.id != ownerID && message.author.id != jahyID) {
            return message.channel.send(`Insufficient permissions`);
        }
        /*
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
        */

        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send("Command not found");

        command.enabled = !command.enabled;

        if (command.enabled) {
            return message.channel.send(`\`!${commandName}\` is now enabled`);
        } else if (!command.enabled) {
            return message.channel.send(`\`!${commandName}\` is now disabled`);
        }
    }
};