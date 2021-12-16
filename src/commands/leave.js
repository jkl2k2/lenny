const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class LeaveCommand extends Command {
    constructor() {
        super(`leave`, {
            aliases: [`leave`, `l`],
            category: `music`,
            description: `Makes the bot leave your voice channel`,
            channel: `guild`,
            slash: true,
            slashOptions: [],
        });
    }

    async exec(message) {
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
                        .setDescription(`:eject: Left voice channel`)
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

module.exports = LeaveCommand;