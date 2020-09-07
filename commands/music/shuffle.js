const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const Queues = index.getQueues();

// Fisher-Yates Shuffle
function shuffle(array) {
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

module.exports = {
    name: 'shuffle',
    description: 'Shuffles the music queue',
    // aliases: ['aliases'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        let queue = index.getQueue(message);

        if (queue.list.length > 0) {
            shuffle(queue.list);

            message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:twisted_rightwards_arrows: ${message.author.username} shuffled ${queue.list.length} songs in queue`)
                .setColor(`#0083FF`));
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Cannot shuffle an empty queue`)
                .setColor(`#FF3838`));
        }
    }
};