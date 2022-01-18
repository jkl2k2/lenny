const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class TestCommand extends Command {
    constructor() {
        super(`test`, {
            aliases: [`test`],
            category: `owner`,
            description: `For testing code`,
            channel: `guild`
        });
    }

    exec(message) {
        const serverStats = message.client.stats.ensure(message.guild.id, message.client.stats.default);

        console.log(`music for ${Math.floor(serverStats[`musicTime`] / 1000 / 60 / 60)} hours`);
    }
}

module.exports = TestCommand;