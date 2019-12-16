const index = require(`../index.js`);
const fs = require('fs');

module.exports = {
    name: 'test',
    description: 'Description',
    // aliases: ['aliases'],
    usage: '[command]',
    // cooldown: 5,
    async execute(message, args) {
        message.channel.send("Test message!");
    }
}