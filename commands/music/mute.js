const Discord = require(`discord.js`);

module.exports = {
    name: 'mute',
    description: 'Toggles muting of playback',
    // aliases: ['aliases'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        var dispatcher = message.guild.music.dispatcher;
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
            message.guild.music.oldVolume = dispatcher.volume;

            dispatcher.setVolume(0);

            message.guild.music.volume = 0;

            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:mute: Playback has been muted`)
                .setColor(`#36393f`));

        }
    }
};