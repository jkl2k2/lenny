const index = require(`../../index.js`);
const Discord = require(`discord.js`);

function sendRepeatOn(message) {
    let repeatOnEmbed = new Discord.RichEmbed()
        .setDescription(`:repeat: **[${index.getPlayingVideo().getCleanTitle()}](${index.getPlayingVideo().getURL()})** **will** now repeat`)
        .setColor(`#0083FF`);
    message.channel.send(repeatOnEmbed);
}

function sendRepeatOff(message) {
    let repeatOffEmbed = new Discord.RichEmbed()
        .setDescription(`:stop_button: **[${index.getPlayingVideo().getCleanTitle()}](${index.getPlayingVideo().getURL()})** will **no longer** repeat`)
        .setColor(`#0083FF`);
    message.channel.send(repeatOffEmbed);
}

module.exports = {
    name: 'repeat',
    description: 'Set repeating of current song',
    // aliases: ['aliases'],
    usage: '[on/off]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        if (!args[0]) {
            if (index.getRepeat() == true) {
                index.setRepeat(false);
                sendRepeatOff(message);
            } else if (index.getRepeat() == false) {
                index.setRepeat(true);
                sendRepeatOn(message);
            }
        } else if (args[0] == "on") {
            index.setRepeat(true);
            sendRepeatOn(message);
        } else if (args[0] == "off") {
            index.setRepeat(false);
            sendRepeatOff(message);
        }
    }
};