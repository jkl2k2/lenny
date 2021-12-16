const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class ResumeCommand extends Command {
    constructor() {
        super(`resume`, {
            aliases: [`resume`, `unpause`],
            category: `music`,
            description: `Resumes playback`,
            channel: `guild`, // If guild-only
            slash: true,
            slashOptions: [],
        });
    }

    exec(message) {
        return;
    }

    async execSlash(message) {
        const subscription = this.client.subscriptions.get(message.guild.id);

        if (subscription) {
            subscription.audioPlayer.unpause();
            return await message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(`#36393f`)
                        .setDescription(`:arrow_forward: Resumed playback`)
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

module.exports = ResumeCommand;