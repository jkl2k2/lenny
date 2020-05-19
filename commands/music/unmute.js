const index = require(`../../index.js`);
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
        var dispatcher = index.getDispatcher(message);
        var oldVolume = index.getQueue(message).volume;

        if (dispatcher == undefined || dispatcher.speaking == false) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`:information_source: Cannot mute playback when nothing is playing`)
                .setColor(`#0083FF`));
        }

        if (dispatcher.volume == 0) {
            dispatcher.setVolume(oldVolume);

            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`:loud_sound: Playback unmuted and set to \`${oldVolume * 100}%\``)
                .setColor(`#0083FF`));

        } else {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`:information_source: The playback is already unmuted`)
                .setColor(`#0083FF`));

        }
    }
};