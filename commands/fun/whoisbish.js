// const index = require(`../../index.js`);
const Discord = require(`discord.js`);
// const config = require(`config`);
// Any 'require'

module.exports = {
    name: 'whoisbish',
    description: 'Who is the biggest bish',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'fun',
    execute(message, args) {
        message.channel.send(new Discord.MessageEmbed()
            .setDescription(`:rotating_light: ${message.guild.members.cache.random(1)} is a bish!`)
            .setColor(`#36393f`));
    }
};