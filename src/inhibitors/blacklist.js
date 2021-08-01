const { Inhibitor } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super(`blacklist`, {
            reason: `User blacklisted on server`,
            type: `post`
        });
    }

    async exec(message) {
        const blacklist = message.client.blacklist.ensure(message.guild.id, message.client.blacklist.default);

        if ((blacklist[message.author.id]) && !message.author.bot) {
            const sent = await message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:no_entry: ${message.author.username}, you are blacklisted on this server.`)
                        .setColor(`#FF3838`)
                ]
            });

            message.delete();

            setTimeout(() => {
                return sent.delete();
            }, 2500);

            return true;
        }
    }
}

module.exports = BlacklistInhibitor;