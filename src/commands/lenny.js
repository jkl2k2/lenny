const { Command } = require(`discord-akairo`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class LennyCommand extends Command {
    constructor() {
        super(`lenny`, {
            aliases: [`lenny`],
            category: `fun`,
            description: `( ͡° ͜ʖ ͡°)`,
            channel: `guild`
        });
    }

    exec(message) {
        return message.channel.send(`( ͡° ͜ʖ ͡°)`);
    }
}

module.exports = LennyCommand;