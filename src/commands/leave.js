const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class LeaveCommand extends Command {
    constructor() {
        super(`leave`, {
            aliases: [`leave`, `l`],
            category: `music`,
            description: `Makes the bot leave your voice channel`,
            channel: `guild`
        });
    }

    async exec(message) {

        if (this.client.voice.connections.get(message.guild.id) != undefined) {
            let channelName = this.client.voice.connections.get(message.guild.id).channel.name;
            let disconnecting = await message.channel.send(new MessageEmbed()
                .setDescription(`:arrows_counterclockwise: Disconnecting from \`${channelName}\``)
                .setColor(`#36393f`));

            // Empty queue
            message.guild.music.queue = [];

            // End dispatcher
            if (message.guild.music.dispatcher != undefined) {
                message.guild.music.dispatcher.end();
            }

            // Empty dispatcher
            message.guild.music.dispatcher = undefined;

            // Disconnect from VC
            this.client.voice.connections.get(message.guild.id).disconnect();

            // Reset playing
            message.guild.music.playing = false;

            // Reset volume to 100%
            message.guild.music.volume = 1;

            disconnecting.edit(new MessageEmbed()
                .setDescription(`:arrow_left: Disconnected from \`${channelName}\``)
                .setColor(`#36393f`));
        } else {
            message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> I'm not in a voice channel`)
                .setColor(`#FF3838`));
        }
    }
}

module.exports = LeaveCommand;