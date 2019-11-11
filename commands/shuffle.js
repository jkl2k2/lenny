const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
const Discord = require(`discord.js`);

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
	execute(message, args) {
		// index.shuffleQueue(message);

		var queue = index.getQueue();

        if (queue.length > 0) {
			var shuffled = shuffle(queue);
			index.setQueue(shuffled);

            let shuffleCompleteEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`:white_check_mark: Shuffled queue`, `Shuffled ${queue.length} songs in queue`)
                .setColor(`#44C408`)
            message.channel.send(shuffleCompleteEmbed);
        } else {
            let shuffleFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> Shuffle failed`, `Cannot shuffle an empty queue`)
                .setColor(`#FF0000`)
            message.channel.send(shuffleFailEmbed);
        }
	}
}