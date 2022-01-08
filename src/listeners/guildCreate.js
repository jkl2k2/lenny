const { Listener } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class GuildCreateListener extends Listener {
    constructor() {
        super(`guildCreate`, {
            emitter: `client`,
            event: `guildCreate`
        });
    }

    exec(guild) {
        const channels = guild.channels.cache.filter(channel => channel.type == `GUILD_TEXT`);

        channels.first().send({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`Lenny Bot v5 Beta`, this.client.user.avatarURL())
                    .setDescription(`Hey there! Keep in mind that this bot is under active development. It will sometimes not work as expected and will randomly crash or restart for updates.\n\nAlso, for the sake of transparency, know that commands and error messages are logged for debugging purposes. Nothing else is logged.\n\nDefault prefix is \`!\`, but can be changed.\n\nMy spaghetti code is open-source on [GitHub](https://github.com/jkl2k2/lenny).\n\nContact jkl2k2#6035 if there are any issues.`)
            ]
        }).catch(err => global.logger.error(err.message));
    }
}

module.exports = GuildCreateListener;