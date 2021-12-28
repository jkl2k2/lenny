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
        const guild = message.guild;

        const channels = guild.channels.cache.filter(channel => channel.type == `GUILD_TEXT`);

        channels.first().send({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`Lenny Bot v5 Beta`, message.client.user.avatarURL())
                    .setDescription(`Hey there! Keep in mind that this bot is under active development. It will sometimes not work as expected and will randomly crash or restart for updates.\n\nAlso, for the sake of transparency, know that commands and error messages are logged for debugging purposes. Nothing else is logged.\n\nDefault prefix is \`!\`, but can be changed.\n\nMy spaghetti code is open-source on [GitHub](https://github.com/jkl2k2/lenny).\n\nContact jkl2k2#6035 if there are any issues.`)
            ]
        }).catch(e => console.log(e));
    }
}

module.exports = TestCommand;