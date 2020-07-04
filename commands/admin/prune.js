const index = require(`../../index.js`);

module.exports = {
    name: 'prune',
    description: 'Prunes the specified number of messages from a channel',
    // aliases: ['aliases'],
    args: true,
    usage: '[# to delete]',
    cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: ['MANAGE_MESSAGES'],
    },
    type: 'admin',
    async execute(message, args) {
        if (isNaN(args[0])) {
            return message.channel.send("Please specify a number (1 - 99)");
        } else if (args[0] > 99) {
            return message.channel.send("Prune target too high (max is 99)");
        } else if (args[0] < 1) {
            return message.channel.send("Prune target too low (minimum is 1)");
        }

        await message.channel.fetchMessages({ limit: (parseInt(args[0])) + 1 }).then(messages => {
            message.channel.bulkDelete(messages);
        });
    }
};