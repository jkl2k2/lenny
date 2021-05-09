const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class ResumeCommand extends Command {
    constructor() {
        super(`resume`, {
            aliases: [`resume`, `unpause`],
            category: `music`,
            description: `Resumes playback`,
            channel: `guild` // If guild-only
        });
    }

    exec(message) {
        const dispatcher = message.guild.music.dispatcher;

        if (dispatcher != undefined && dispatcher.paused == true) {
            dispatcher.resume();
            message.channel.send(new MessageEmbed()
                .setDescription(`:arrow_forward: ${message.author.username} resumed playback`)
                .setColor(`#36393f`));
        } else {
            message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> ${message.author.username}, the music is already playing`)
                .setColor(`#FF3838`));
        }
    }
}

module.exports = ResumeCommand;