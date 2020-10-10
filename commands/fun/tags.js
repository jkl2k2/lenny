const index = require(`../../index`);
const { MessageEmbed } = require(`discord.js`);
const Tags = index.getTags();

module.exports = {
    name: 'tags',
    description: 'Show all available tags',
    aliases: ['showtags', 'listtags', 'taglist'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'fun',
    async execute(message, args) {
        // Fetch all tags
        const tagList = await Tags.findAll({ attributes: ['name', 'guild_id'] });

        // Map tags
        const tagString = tagList.filter(tag => tag.guild_id == message.guild.id).map(t => t.name).join(', ') || 'There are no tags in this server';

        return message.channel.send(new MessageEmbed()
            .setAuthor(`Tags in ${message.guild.name}`, message.guild.iconURL())
            .setDescription(tagString));
    }
};