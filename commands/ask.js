const index = require(`../index.js`);
// Any 'require'

module.exports = {
    name: 'ask',
    description: 'Ask a question and get a response',
    // aliases: ['aliases'],
    args: true,
    usage: '[question]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    execute(message, args) {
        var responses = ["Yes", "No", "Sure why not", "Of course not", "Lmao no", "Yeah", "Sure?", "Mhmm sure", "Uh... yeah whatever lets you sleep at night", "Uh... no", "Yeah, no", "Bruh no of course not", "Nah", "If you say so", "In your dreams, kid", "Yep", "I don't think so", "Why would you even ask that, of course not", "Of course"];

        const index = Math.floor(Math.random() * (responses.length - 1) + 1);

        message.channel.send(responses[index]);
    }
};