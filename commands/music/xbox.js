module.exports = {
    name: 'xbox',
    description: 'XBOX LIVE',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        let dispatcher = message.guild.music.dispatcher;
        if (dispatcher != undefined) {
            dispatcher.setBitrate(4);
            message.channel.send("ur mom", {
                files: [
                    "./assets/xbox.jpg"
                ]
            });
        } else {
            message.channel.send(`Dispatcher is undefined, can't set bitrate`);
        }

    }
};