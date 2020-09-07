module.exports = {
    name: 'unxbox',
    description: 'NOT XBOX LIVE',
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
            dispatcher.setBitrate(384);
            message.channel.send("ur dad", {
                files: [
                    "./assets/unxbox.png"
                ]
            });
        } else {
            message.channel.send(`Dispatcher is undefined, can't set bitrate`);
        }

    }
};