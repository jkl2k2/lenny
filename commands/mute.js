const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
    name: 'mute',
    description: 'Toggles muting of playback',
    // aliases: ['aliases'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    execute(message, args) {
        var dispatcher = index.getDispatcher();
        var oldVolume = 1;

        if (dispatcher == undefined || dispatcher.speaking == false) {
            let notPlaying = new Discord.RichEmbed()
                .setDescription(`:information_source: Cannot mute playback when nothing is playing`)
                .setColor(`#0083FF`);
            message.channel.send(notPlaying);

            return;
        }

        if (dispatcher.volume == 0) {
            index.setDispatcherVolume(oldVolume);

            let unmuted = new Discord.RichEmbed()
                .setDescription(`:loud_sound: Volume unmuted and set to ${oldVolume * 100}%`)
                .setColor(`#0083FF`);
            message.channel.send(unmuted);

        } else {
            index.setDispatcherVolume(0);

            let muted = new Discord.RichEmbed()
                .setDescription(`:mute: Volume has been muted`)
                .setColor(`#0083FF`);
            message.channel.send(muted);

        }
    }
};