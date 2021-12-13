const { Command } = require(`discord-akairo`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class InviteCommand extends Command {
    constructor() {
        super(`invite`, {
            aliases: [`invite`],
            category: `general`,
            description: `Provides an invite link for the bot`,
            channel: `guild`
        });
    }

    exec(message) {
        return message.channel.send(`Invite link:\nhttps://discord.com/api/oauth2/authorize?client_id=743287404214878258&permissions=2184449088&scope=bot%20applications.commands`);
    }
}

module.exports = InviteCommand;