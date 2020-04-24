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
    type: 'admin',
    execute(message, args) {
        if (message.author.id != ownerID) {
            message.channel.send("Sorry, this command can only be used by the bot owner");
            return;
        }

        let noArgs = new Discord.RichEmbed()

            .setDescription(`<:error:643341473772863508> No command passed in arguments`)
            .setColor(`#FF0000`);

        let notFound = new Discord.RichEmbed()

            .setDescription(`<:error:643341473772863508> Command not found`)
            .setColor(`#FF0000`);

        if (!args.length) return message.channel.send(noArgs);
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(notFound);

        delete require.cache[require.resolve(`../${command.type}/${commandName}.js`)];

        try {
            const newCommand = require(`../${command.type}/${commandName}.js`);
            message.client.commands.set(newCommand.name, newCommand);

            message.channel.send(new Discord.RichEmbed()
                .setDescription(`:arrows_counterclockwise: Successfully recached command "${commandName}"`)
                .setColor(`#0083FF`));
        } catch (error) {
            logger.error(error);
            let commandReloadError = new Discord.RichEmbed()

                .setDescription(`Error while recaching command\n\n${error.message}`)
                .setColor(`#FF0000`);
            message.channel.send(commandReloadError);
        }
    },
};