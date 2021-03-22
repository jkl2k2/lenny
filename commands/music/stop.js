const Discord = require(`discord.js`);

module.exports = {
    name: 'stop',
    description: 'Completely stops playback and leaves',
    // aliases: [''],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {

        const client = message.client;

        let dispatcher = message.guild.music.dispatcher;

        if (dispatcher == undefined || dispatcher.speaking == false) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> There is nothing to skip`)
                .setColor(`#FF3838`));
        }

        // Empty queue
        message.guild.music.queue = [];

        // End dispatcher
        if (message.guild.music.dispatcher != undefined) {
            message.guild.music.dispatcher.end();
        }

        // Empty dispatcher
        // message.guild.music.dispatcher = undefined;

        // Disconnect from VC
        client.voice.connections.get(message.guild.id).disconnect();

        // Reset playing
        message.guild.music.playing = false;

        message.channel.send(new Discord.MessageEmbed()
            .setDescription(`:stop_button: ${message.author.username} stopped all playback`)
            .setColor(`#36393f`));

    }
};