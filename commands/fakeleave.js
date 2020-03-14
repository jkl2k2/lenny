const index = require(`../index.js`);
// Any 'require'

module.exports = {
    name: 'fakeleave',
    description: 'Fakes join with command caller',
    // aliases: ['aliases'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    async execute(message, args) {
        var client = index.getClient();

        client.emit('guildMemberRemove', message.member || await message.guild.fetchMember(message.author));
    }
}