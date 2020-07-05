const index = require(`../../index.js`);
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);
const Discord = require(`discord.js`);
const logger = index.getLogger();

module.exports = {
    name: 'reload',
    description: 'Reloads a command, mostly for testing commands while changing code. Don\'t use if you don\'t know what you\'re doing.',
    // guildOnly: true,
    enabled: true,
    restrictions: {
        id: [ownerID]
    },
    type: 'admin',
    execute(message, args) {

        let noArgs = new Discord.RichEmbed()

            .setDescription(`<:cross:729019052571492434> No command passed in arguments`)
            .setColor(`#FF3838`);

        let notFound = new Discord.RichEmbed()

            .setDescription(`<:cross:729019052571492434> \`${args[0]}\` is not a valid command`)
            .setColor(`#FF3838`);

        if (!args.length) return message.channel.send(noArgs);
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(notFound);

        delete require.cache[require.resolve(`../${command.type}/${command.name}.js`)];

        try {
            const newCommand = require(`../${command.type}/${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);

            message.channel.send(new Discord.RichEmbed()
                .setDescription(`<:check:728881238970073090> Successfully recached command \`${command.name}\``)
                .setColor(`#2EC14E`));
        } catch (error) {
            logger.error(error);
            let commandReloadError = new Discord.RichEmbed()

                .setDescription(`Error while recaching command\n\n${error.message}`)
                .setColor(`#FF3838`);
            message.channel.send(commandReloadError);
        }
    },
};