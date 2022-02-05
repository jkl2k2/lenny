const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const moment = require(`moment`);

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
        let totalMusicTimeMs = 0;

        this.client.guilds.cache.each(guild => {
            // Ensure serverStats exist
            const serverStats = this.client.stats.ensure(guild.id, this.client.stats.default);
            totalMusicTimeMs += serverStats[`musicTime`];
        });

        console.log(totalMusicTimeMs, moment.duration(totalMusicTimeMs, `milliseconds`).asHours());
    }
}

module.exports = TestCommand;