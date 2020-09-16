const Discord = require(`discord.js`);

module.exports = {
    name: 'unmuteall',
    description: 'Unmutes everyone in a voice chat',
    aliases: ['ua', 'u'],
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
    type: 'admin',
    execute(message, args) {
        const channel = message.member.voice.channel;
        for (const member of channel.members) {
            member[1].voice.setMute(false);
        }
        return message.channel.send(new Discord.MessageEmbed()
            .setDescription(`:loud_sound: Unmuted all participants`)
            .setColor(`#36393f`));
    }
};