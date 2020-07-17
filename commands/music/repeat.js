const index = require(`../../index.js`);
const Discord = require(`discord.js`);

function sendRepeatOn(message) {
    message.channel.send(new Discord.MessageEmbed()
        .setDescription(`:repeat: **[${index.getQueue(message).lastPlayed.getCleanTitle()}](${index.getQueue(message).lastPlayed.getURL()})** **will** now repeat`)
        .setColor(`#0083FF`));
}

function sendRepeatOff(message) {
    message.channel.send(new Discord.MessageEmbed()
        .setDescription(`:stop_button: **[${index.getQueue(message).lastPlayed.getCleanTitle()}](${index.getQueue(message).lastPlayed.getURL()})** will **no longer** repeat`)
        .setColor(`#0083FF`));
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
        return message.channel.send(new Discord.MessageEmbed()
            .setDescription(`<:cross:729019052571492434> Sorry, \`repeat\` is currently broken for some unknown reason`)
            .setColor(`#FF3838`));

        var queue = index.getQueue(message);
        if (queue == undefined) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: There is nothing currently playing`)
                .setColor(`#0083FF`));
        }

        var last = queue.lastPlayed;

        if (last.getType() == "livestream") {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: Sorry, repeat is force-enabled on livestreams to allow for the bot to reconnect to livestreams when they cut out\n\nIt would only be harmful to disable repeat with a stream playing\n\n**(This unlocks when a normal video is playing)**`)
                .setColor(`#0083FF`));
        }

        if (!args[0]) {
            if (queue.repeat == true) {
                queue.repeat = false;
                sendRepeatOff(message);
            } else if (queue.repeat == false) {
                queue.repeat = true;
                sendRepeatOn(message);
            }
        } else if (args[0] == "on") {
            queue.repeat = true;
            sendRepeatOn(message);
        } else if (args[0] == "off") {
            queue.repeat = false;
            sendRepeatOff(message);
        }
    }
};