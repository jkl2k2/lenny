const index = require(`../index.js`);
const joke = require(`give-me-a-joke`);

module.exports = {
    name: 'joke',
    description: 'Tells random terrible jokes',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    execute(message, args) {
        joke.getRandomDadJoke(function (joke) {
            message.channel.send(joke);
        });
    }
};