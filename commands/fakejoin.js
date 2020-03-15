const index = require(`../index.js`);
// Any 'require'

module.exports = {
    name: 'fakejoin',
    description: 'Fakes join with command caller',
    // aliases: ['aliases'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    async execute(message, args) {
        var client = index.getClient();

        client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
    }
};