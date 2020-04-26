const index = require(`../../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'skip',
	description: 'Skips the current song',
	aliases: ['s', 'stop'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		// index.callEndDispatcher(message.channel, message.author.username, "skip");

		/*
		var objectToWrite = {
			list: []
		};
		fs.readFile('./commands/ligma.json',
			// callback function that is called when reading file is done
			function (err, data) {
				// json data
				var jsonData = data;

				// parse json
				var jsonParsed = JSON.parse(jsonData);

				objectToWrite.list = jsonParsed.list;

				if (objectToWrite.list.indexOf(message.author.id) != -1) {
					let ligmaEmbed = new Discord.RichEmbed()

						.addField(`:warning: LIGMA DETECTED :warning:`, `Sorry, ${message.author.username}, but you cannot use the skip command because you have ligma`)
						.setColor(`#FF0000`);
					message.channel.send(ligmaEmbed);

					return;
				} else {
					executeSkip(message);
				}

				// console.log(objectToWrite.list);

				// access elements
				// console.log(jsonParsed.list);
			});
			*/

		var dispatcher = index.getDispatcher(message);

		if (dispatcher == undefined || dispatcher.speaking == false) {
			return message.channel.send(new Discord.RichEmbed()
				.setDescription(`:information_source: There is nothing to skip`)
				.setColor(`#0083FF`));
		}

		index.endDispatcher(message);

		return message.channel.send(new Discord.RichEmbed()
			.setDescription(`:fast_forward: ${message.author.username} skipped the current song`)
			.setColor(`#0083FF`));
	}
};