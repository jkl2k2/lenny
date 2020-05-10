const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const Queues = index.getQueues();

// Fisher-Yates Shuffle
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

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
        var queue = index.getQueue(message);

        if (queue.list.length > 0) {
            var shuffled = shuffle(queue.list);

            message.channel.send(new Discord.RichEmbed()
                .setDescription(`:twisted_rightwards_arrows: ${message.author.username} shuffled ${queue.list.length} songs in queue`)
                .setColor(`#0083FF`));
        } else {
            message.channel.send(new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Cannot shuffle an empty queue`)
                .setColor(`#FF0000`));
        }
    }
};