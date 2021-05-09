const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class VolumeCommand extends Command {
    constructor() {
        super(`volume`, {
            aliases: [`volume`, `v`],
            args: [
                {
                    id: `newVolume`,
                    type: `integer`,
                    default: null
                }
            ],
            category: `music`,
            description: `Changes the playback volume`,
            channel: `guild` // If guild-only
        });
    }

    decideWording(input) {
        if (input == true) {
            return " raised volume to";
        } else if (input == false) {
            return " lowered volume to";
        } else {
            return ", the volume is already at";
        }
    }

    compareVolume(volume, dispatcher) {
        if (volume / 100 > dispatcher.volume) {
            return true;
        } else if (volume / 100 < dispatcher.volume) {
            return false;
        } else if (volume / 100 == dispatcher.volume) {
            return "equal";
        } else {
            return "catch";
        }
    }

    exec(message, args) {
        if (args.newVolume == null) {
            if (message.guild.music.dispatcher == undefined) {
                return message.channel.send(new MessageEmbed()
                    .setDescription(`:loud_sound: Current volume: 100%`)
                    .setColor(`#36393f`));
            }
            return message.channel.send(new MessageEmbed()
                .setDescription(`:loud_sound: Current volume: \`${(message.guild.music.volume) * 100}%\``)
                .setColor(`#36393f`));
        }

        volume = args[0];
        let dispatcher = message.guild.music.dispatcher;
        if (!message.guild.music.playing) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: Nothing is currently playing`)
                .setColor(`#36393f`));
        }
        raisedVolume = this.compareVolume(volume, dispatcher);

        let newVolume = volume / 100;
        if ((volume >= 0 && volume <= 500) || message.author.id == `245002786343878657` || message.author.id == `125109015632936960`) {
            dispatcher.setVolume(newVolume);
            message.guild.music.volume = newVolume;
            return message.channel.send(new MessageEmbed()
                .setDescription(`:loud_sound: ${message.author.username}${this.decideWording(raisedVolume)} \`${volume}%\``)
                .setColor(`#36393f`));
        } else {
            return message.channel.send(new MessageEmbed()
                .addField(`<:cross:729019052571492434> Failed to change volume`, `You can't set the volume to that number (max is 500%)`)
                .setColor(`#FF3838`));
        }
    }
}

module.exports = VolumeCommand;