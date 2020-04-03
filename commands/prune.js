const index = require(`../index.js`);

module.exports = {
    name: 'prune',
    description: 'Prunes the specified number of messages from a channel',
    // aliases: ['aliases'],
    args: true,
    usage: '[# to delete]',
    cooldown: 5,
    guildOnly: true,
    async execute(message, args) {
        await message.channel.fetchMessages({ limit: (parseInt(args[0])) + 1 }).then(messages => {
            message.channel.bulkDelete(messages);
        });
    }
};