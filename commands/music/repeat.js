const Discord = require(`discord.js`);

function sendRepeatOn(message) {
    message.channel.send(new Discord.MessageEmbed()
        .setDescription(`:repeat: **[${message.guild.music.lastPlayed.getTitle()}](${message.guild.music.lastPlayed.getURL()})** **will** now repeat`)
        .setColor(`#36393f`));
}

function sendRepeatOff(message) {
    message.channel.send(new Discord.MessageEmbed()
        .setDescription(`:stop_button: **[${message.guild.music.lastPlayed.getTitle()}](${message.guild.music.lastPlayed.getURL()})** will **no longer** repeat`)
        .setColor(`#36393f`));
}

module.exports = {
    name: 'repeat',
    description: 'Set repeating of current song',
    aliases: ['loop'],
    usage: '[on/off]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        /*
        return message.channel.send(new Discord.MessageEmbed()
            .setDescription(`<:cross:729019052571492434> Sorry, \`repeat\` is currently broken for some unknown reason`)
            .setColor(`#FF3838`));
        */

        var queue = message.guild.music.queue;
        if (queue == undefined) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: There is nothing currently playing`)
                .setColor(`#36393f`));
        }

        var last = message.guild.music.lastPlayed;

        if (last.getType() == "livestream") {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: Sorry, repeat is force-enabled on livestreams to allow for the bot to reconnect to livestreams when they cut out\n\nIt would only be harmful to disable repeat with a stream playing\n\n**(This unlocks when a normal video is playing)**`)
                .setColor(`#36393f`));
        }

        if (!args[0]) {
            if (message.guild.music.repeat == true) {
                message.guild.music.repeat = false;
                sendRepeatOff(message);
            } else if (message.guild.music.repeat == false) {
                message.guild.music.repeat = true;
                sendRepeatOn(message);
            }
        } else if (args[0] == "on") {
            message.guild.music.repeat = true;
            sendRepeatOn(message);
        } else if (args[0] == "off") {
            message.guild.music.repeat = false;
            sendRepeatOff(message);
        }
    }
};