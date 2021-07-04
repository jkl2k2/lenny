const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class SkipCommand extends Command {
    constructor() {
        super(`skip`, {
            aliases: [`skip`, `s`],
            category: `music`,
            description: `Skips the currently playing song`,
            channel: `guild`
        });
    }

    exec(message) {
        return;
    }
    async execSlash(message) {
        const subscription = this.client.subscriptions.get(message.guild.id);

        if (subscription) {
            subscription.audioPlayer.stop();
            return await message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(`#36393f`)
                        .setDescription(`:fast_forward: Skipped **[${subscription.audioPlayer._state.resource.metadata.title}](${subscription.audioPlayer._state.resource.metadata.url})**`)
                        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
                ]
            });
        }
    }
}

module.exports = SkipCommand;