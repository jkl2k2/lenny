const index = require(`../index.js`);
const fs = require('fs');
const Discord = require(`discord.js`);

function executeSkip(message) {
	var dispatcher = index.getDispatcher();

	if (dispatcher == undefined || dispatcher.speaking == false) {
		let skipFailEmbed = new Discord.RichEmbed()
			.setTitle(` `)
			.setDescription(`<:error:643341473772863508> There is nothing to skip`)
			.setColor(`#FF0000`)
		message.channel.send(skipFailEmbed);

		return;
	}

	index.endDispatcher();

	let endDispatcherEmbed = new Discord.RichEmbed()
		.setTitle(` `)
		.setDescription(`:fast_forward: ${message.author.username} skipped the current song`)
		.setColor(`#0083FF`)
	message.channel.send(endDispatcherEmbed);

}

module.exports = {
	name: 'skip',
	description: 'Skips the current song',
	aliases: ['s'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		// index.callEndDispatcher(message.channel, message.author.username, "skip");

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

				objectToWrite.list = jsonParsed.list

				if (objectToWrite.list.indexOf(message.author.id) != -1) {
					let ligmaEmbed = new Discord.RichEmbed()
						.setTitle(` `)
						.addField(`:warning: LIGMA DETECTED :warning:`, `Sorry, ${message.author.username}, but you cannot use the skip command because you have ligma`)
						.setColor(`#FF0000`)
					message.channel.send(ligmaEmbed);

					return;
				} else {
					executeSkip(message);
				}

				// console.log(objectToWrite.list);

				// access elements
				// console.log(jsonParsed.list);
			});
	}
}