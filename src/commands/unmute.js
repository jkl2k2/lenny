const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class UnmuteCommand extends Command {
    constructor() {
        super(`unmute`, {
            aliases: [`unmute`],
            category: `music`,
            description: `Unmutes playback`,
            channel: `guild` // If guild-only
        });
    }

    exec(message) {
        const dispatcher = message.guild.music.dispatcher;
        const oldVolume = message.guild.music.oldVolume;

        if (dispatcher == undefined || dispatcher.speaking == false) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: Cannot mute playback when nothing is playing`)
                .setColor(`#36393f`));
        }

        if (dispatcher.volume == 0) {
            dispatcher.setVolume(oldVolume);

            message.guild.music.volume = oldVolume;

            return message.channel.send(new MessageEmbed()
                .setDescription(`:loud_sound: Playback unmuted and set to \`${oldVolume * 100}%\``)
                .setColor(`#36393f`));
        } else {
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: The playback is already unmuted`)
                .setColor(`#36393f`));
        }
    }
}

module.exports = UnmuteCommand;