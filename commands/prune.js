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
        if (this.enabled == false) {
            message.channel.send(`Command disabled`);
            return;
        }
        if (isNaN(args[0])) {
            message.channel.send("Please specify a number (1 - 99)");
            return;
        } else if (args[0] > 99) {
            message.channel.send("Prune target too high (max is 99)");
            return;
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