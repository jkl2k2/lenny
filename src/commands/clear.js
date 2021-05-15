const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class ClearCommand extends Command {
    constructor() {
        super(`clear`, {
            aliases: [`clear`, `clearqueue`],
            category: `music`,
            description: `Clears out the queue`,
            channel: `guild`
        });
    }

    exec(message) {
        if (message.guild.music.queue == undefined || message.guild.music.queue.length == 0) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> There is nothing to skip`)
                .setColor(`#FF3838`));
        } else {
            message.guild.music.queue = [];
            return message.channel.send(new MessageEmbed()
                .setDescription(`:arrow_double_up: ${message.author.username} cleared the queue`)
                .setColor(`#36393f`));
        }
    }
}

module.exports = ClearCommand;