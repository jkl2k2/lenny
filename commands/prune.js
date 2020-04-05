const index = require(`../index.js`);

module.exports = {
    name: 'prune',
    description: 'Prunes the specified number of messages from a channel',
    // aliases: ['aliases'],
    args: true,
    usage: '[# to delete]',
    cooldown: 5,
    guildOnly: true,
    enabled: true,
    async execute(message, args) {
        if (isNaN(args[0])) {
            return message.channel.send("Please specify a number (1 - 99)");
        } else if (args[0] > 99) {
            return message.channel.send("Prune target too high (max is 99)");
        } else if (args[0] < 1) {
            return message.channel.send("Prune target too low (minimum is 1)");
        }
        switch (message.member.roles.some(role => role.name === `The Owners :D` || `Trusted`)) {
            case true:
                await message.channel.fetchMessages({ limit: (parseInt(args[0])) + 1 }).then(messages => {
                    message.channel.bulkDelete(messages);
                });
                break;
            default:
                message.channel.send("Sorry, only admins can use this command");
        }
    }
};