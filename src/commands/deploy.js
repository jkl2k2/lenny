const { Command } = require(`discord-akairo`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class DeployCommand extends Command {
    constructor() {
        super(`deploy`, {
            aliases: [`deploy`],
            category: `admin`,
            description: `This command is no longer necessary.`,
            channel: `guild`,
            // userPermissions: [`MANAGE_GUILD`]
        });
    }

    exec(message) {
        return message.channel.send(`Using \`!deploy\` is no longer necessary, as slash commands are now automatically registered and updated.`);
    }
}

module.exports = DeployCommand;
