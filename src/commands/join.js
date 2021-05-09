const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class JoinCommand extends Command {
    constructor() {
        super(`join`, {
            aliases: [`join`, `j`],
            category: `music`,
            description: `Makes the bot join your voice channel`,
            channel: `guild`
        });
    }

    async exec(message) {
        if (message.member.voice.channel) {
            let sent = await message.channel.send(new MessageEmbed()
                .setDescription(`:arrows_counterclockwise: Connecting to \`${message.member.voice.channel.name}\``)
                .setColor(`#36393f`));
            message.member.voice.channel.join()
                .then(connection => {
                    sent.edit(new MessageEmbed()
                        .setDescription(`:arrow_right: Connected to \`${connection.channel.name}\``)
                        .setColor(`#36393f`));
                });
        } else {
            message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> You are not in a voice channel`)
                .setColor(`#FF3838`));
        }
    }
}

module.exports = JoinCommand;