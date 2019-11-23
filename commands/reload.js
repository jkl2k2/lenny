const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);

module.exports = {
    name: 'reload',
    description: 'Reloads a command, mostly for testing commands while changing code. Don\'t use if you don\'t know what you\'re doing.',
    guildOnly: true,
    execute(message, args) {
        if(message.author.id != ownerID) {
            message.channel.send("Sorry, this command can only be used by the bot owner");
            return;
        }
        if (!args.length) return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

        delete require.cache[require.resolve(`./${commandName}.js`)];

        try {
            const newCommand = require(`./${commandName}.js`);
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.log(error);
            message.channel.send(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
        }

        message.channel.send(`Command \`${commandName}\` was reloaded!`);

    },
};