const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class ShuffleCommand extends Command {
    constructor() {
        super(`shuffle`, {
            aliases: [`shuffle`],
            category: `music`,
            description: `Shuffle the queue`,
            channel: `guild` // If guild-only
        });
    }

    shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    exec(message) {
        let queue = message.guild.music.queue;

        if (queue.length > 0) {
            this.shuffle(queue);

            message.channel.send(new MessageEmbed()
                .setDescription(`:twisted_rightwards_arrows: ${message.author.username} shuffled ${queue.length} songs in queue`)
                .setColor(`#36393f`));
        } else {
            message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Cannot shuffle an empty queue`)
                .setColor(`#FF3838`));
        }
    }
}

module.exports = ShuffleCommand;