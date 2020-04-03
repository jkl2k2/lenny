const index = require(`../index.js`);
const thesaurize = require(`thesaurize`);

module.exports = {
    name: 'thesaurize',
    description: 'Puts your input through a thesaurus to create sentences worthy of intellectuals',
    // aliases: ['aliases'],
    args: true,
    usage: '[words]',
    // cooldown: 5,
    // guildOnly: true,
    execute(message, args) {
        message.channel.send(thesaurize(args.join(" ")));
    }
};