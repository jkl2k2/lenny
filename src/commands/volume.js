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
        return;
    }

    execSlash(message, args) {
        // Get subscription from message's guild
        const subscription = this.client.subscriptions.get(message.guild.id);

        if (subscription) {
            subscription.audioPlayer._state.setVolume(args.newVolume / 100);
            return message.interaction.reply(`Changed volume to ${args.newVolume / 100}%`);
        }
    }
}

module.exports = VolumeCommand;