const Discord = require(`discord.js`);

module.exports = {
    name: 'unmute',
    description: 'Unmutes audio playback',
    // aliases: ['aliases'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        let dispatcher = message.guild.music.dispatcher;
        let oldVolume = message.guild.music.oldVolume;

        if (dispatcher == undefined || dispatcher.speaking == false) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: Cannot mute playback when nothing is playing`)
                .setColor(`#36393f`));
        }

        if (dispatcher.volume == 0) {
            dispatcher.setVolume(oldVolume);

            message.guild.music.volume = oldVolume;

            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:loud_sound: Playback unmuted and set to \`${oldVolume * 100}%\``)
                .setColor(`#36393f`));
        } else {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: The playback is already unmuted`)
                .setColor(`#36393f`));
        }
    }
};