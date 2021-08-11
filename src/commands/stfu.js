const { Command } = require(`discord-akairo`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class StfuCommand extends Command {
    constructor() {
        super(`stfu`, {
            aliases: [`stfu`],
            category: `fun`,
            description: `stfu`,
            channel: `guild`,
            slashOptions: []
        });
    }

    exec() {
        return;
    }

    execSlash(message) {
        return message.interaction.reply(`https://youtu.be/0tvlIcQ5VT0`);
    }
}

module.exports = StfuCommand;