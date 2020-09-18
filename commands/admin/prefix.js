const Discord = require(`discord.js`);

module.exports = {
    name: 'prefix',
    description: 'Sets the server\'s prefix',
    // aliases: ['aliases'],
    args: true,
    usage: '[prefix]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [`MANAGE_GUILD`],
    },
    type: 'admin',
    execute(message, args) {
        const client = message.client;

        client.settings.ensure(message.guild.id, client.settings.default);

        client.settings.set(message.guild.id, args.join(), `prefix`);

        message.channel.send(new Discord.MessageEmbed()
            .setDescription(`<:check:728881238970073090> Prefix for \`${message.guild.name}\` successfully set to \`${args.join(" ")}\``)
            .setColor(`#2EC14E`)
            .setFooter(`Changed by ${message.author.username}`, message.author.avatarURL())
            .setTimestamp());
    }
}; 