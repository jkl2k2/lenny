const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class StopCommand extends Command {
    constructor() {
        super(`stop`, {
            aliases: [`stop`],
            category: `music`,
            description: `Clears out any playing music and leaves`,
            channel: `guild`,
            slash: true,
            slashOptions: []
        });
    }

    exec() {
        return;
    }

    async execSlash(message) {
        const subscription = this.client.subscriptions.get(message.guild.id);

        if (subscription) {
            subscription.voiceConnection.destroy();
            this.client.subscriptions.delete(message.guild.id);
            return await message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:stop_button: Stopped all playback`)
                        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
                        .setColor(`#36393f`)
                ],
            });
        } else {
            return await message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(`#FF3838`)
                        .setDescription(`<:cross:729019052571492434> I'm not in a voice channel`)
                ],
                ephemeral: true,
            });
        }
    }
}
module.exports = StopCommand;