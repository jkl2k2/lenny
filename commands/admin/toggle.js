const index = require(`../../index.js`);
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
    restrictions: {
        id: [ownerID, jahyID]
    },
    type: 'admin',
    execute(message, args) {

        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send("Command not found");

        command.enabled = !command.enabled;

        if (command.enabled) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`:white_check_mark: \`!${commandName}\` is now enabled`)
                .setColor(`#00FF44`));
        } else if (!command.enabled) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`:no_entry: \`!${commandName}\` is now disabled`)
                .setColor(`#FF0000`));
        }
    }
};