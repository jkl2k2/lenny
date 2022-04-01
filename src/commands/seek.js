const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const PlayCommand = require(`./play`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class SeekCommand extends Command {
    constructor() {
        super(`seek`, {
            aliases: [`seek`],
            args: [
                {
                    id: `time`,
                    type: `string`,
                }
            ],
            slash: true,
            slashOptions: [
                {
                    name: 'time',
                    type: 'STRING',
                    description: 'The timestamp (xx:xx) of where you want to seek',
                    required: true
                },
            ],
            category: `music`,
            description: `Seeks to a specified time in the song`,
            channel: `guild`
        });
    }

    exec() {
        return;
    }

    execSlash(message, args) {
        if (!args.time.includes(`:`) || args.time.length <= 2) {
            return message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Please format the timestamp as xx:xx (like a YouTube video)\nEx: \`4:05\`, \`10:30\`, \`:05\``)
                        .setColor(`#FF3838`)
                ],
                ephemeral: true
            });
        } else if (isNaN(args.time.substring(0, args.time.indexOf(`:`))) || isNaN(args.time.substring(args.time.indexOf(`:`) + 1))) {
            return message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> There seems to be non-number characters in your input`)
                        .setColor(`#FF3838`)
                ],
                ephemeral: true
            });
        }

        let totalSeconds = 0;

        // Convert minutes
        totalSeconds += parseInt(args.time.substring(0, args.time.indexOf(`:`))) * 60 || 0;

        // Add seconds
        totalSeconds += parseInt(args.time.substring(args.time.indexOf(`:`) + 1)) || 0;

        const subscription = this.client.subscriptions.get(message.guild.id);

        if (subscription && subscription.audioPlayer._state.status === `playing`) {
            // Shortcut to the metadata
            const meta = subscription.audioPlayer._state.resource.metadata;

            if (!meta.seekable) {
                // The video/song is not able to use seeking
                if (meta.video.type === `youtube`) {
                    return message.interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> Sorry, this particular video does not support seeking.\nThe format that YouTube stores this video in doesn't support it.`)
                                .setColor(`#FF3838`)
                        ],
                        ephemeral: true
                    });
                } else if (meta.video.type === `soundcloud`) {
                    return message.interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> Sorry, SoundCloud does not support seeking`)
                                .setColor(`#FF3838`)
                        ],
                        ephemeral: true
                    });
                } else {
                    // Catch-all message
                    return message.interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> Sorry, this video or song does not support seeking`)
                                .setColor(`#FF3838`)
                        ],
                        ephemeral: true
                    });
                }
            } else if (totalSeconds >= meta.video.durationInSec || totalSeconds < 0) {
                // Seeking too far ahead or somehow put negative numbers
                return message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`<:cross:729019052571492434> Your timestamp is out of the bounds of the video's length`)
                            .setColor(`#FF3838`)
                    ],
                    ephemeral: true
                });
            } else {
                // Same behavior as playnow command but with seek defined
                PlayCommand.prototype.execSlash(message, {
                    song: meta.video.url,
                }, {
                    next: true,
                    force: true,
                    client: this.client,
                    guildId: message.guild.id,
                    seek: totalSeconds
                });
            }
        } else {
            // Subscription doesn't exist or not actively playing a song
            return message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Nothing is playing right now`)
                        .setColor(`#FF3838`)
                ],
                ephemeral: true
            });
        }
    }
}

module.exports = SeekCommand;