const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
const fs = require('fs');

module.exports = {
	name: 'test',
	description: 'Description',
	// aliases: ['aliases'],
	usage: '[command]',
	// cooldown: 5,
    async execute(message, args) {
        /*
        index.queue = ["hi", "bye", "test!"];
        message.channel.send(index.queue);

        index.dispatcher = "asdf";
        message.channel.send(index.dispatcher);
        */

        message.channel.send("Index.js queue is:");
        index.callQueueRead(index.constructVideo("title", "url", "type", "requester"));

        // index.sendDetails(undefined, message.channel);

        // index.endDispatcher(message.channel, "author", "skip");
    }
}