const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class PauseCommand extends Command {
    constructor() {
        super(`pause`, {
            aliases: [`pause`],
            category: `music`,
            description: `Pauses playback`,
            channel: `guild`
        });
    }

    exec(message) {
        return;
    }

    async execSlash(message) {
        const subscription = this.client.subscriptions.get(message.guild.id);

        if (subscription) {
            subscription.audioPlayer.pause();
            return await message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(`#36393f`)
                        .setDescription(`:pause_button: Paused playback`)
                        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
                ]
            });
        } else {
            return await message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(`#FF3838`)
                        .setDescription(`<:cross:729019052571492434> There's nothing playing`)
                ],
                ephemeral: true
            });
        }
    }
}

module.exports = PauseCommand;