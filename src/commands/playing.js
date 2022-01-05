const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const pretty = require(`pretty-ms`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class PlayingCommand extends Command {
    constructor() {
        super(`playing`, {
            aliases: [`playing`],
            category: `music`,
            description: `Shows the currently playing song`,
            channel: `guild`,
            slash: true,
            slashOptions: [],
        });
    }

    exec() {
        return;
    }

    async execSlash(message) {
        const subscription = this.client.subscriptions.get(message.guild.id);

        if (subscription && subscription.audioPlayer._state.status === `playing`) {
            // Shorthand for the guild's current song
            const playing = subscription.audioPlayer._state.resource.metadata.video;

            if (playing.live) {
                // is a livestream
                return await message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`➡️ Currently playing`)
                            .setDescription(`**[${playing.title}](${playing.url})**\n[${playing.channel.name}](${playing.channel.url})\n\n\`YouTube Livestream\``)
                            .setThumbnail(playing.thumbnails[0].url)
                            .setFooter(`Requested by ${subscription.audioPlayer._state.resource.metadata.requester.username}`, subscription.audioPlayer._state.resource.metadata.requester.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp(subscription.audioPlayer._state.resource.metadata.timestamp)
                    ],
                    ephemeral: true
                });
            } else {
                // Get the formatted total duration of the song
                const formattedTotal = subscription.audioPlayer._state.resource.metadata.getDuration();

                // Calculate the total duration of the song, used to compare to the running time
                const total = playing.durationInSec;

                const formattedPlaying = pretty(subscription.audioPlayer._state.playbackDuration, { colonNotation: true, secondsDecimalDigits: 0 });

                // Calculate what percent of the song is complete
                const frac = (subscription.audioPlayer._state.playbackDuration / 1000) / total;

                // Prepare string for formatting
                let progressBar = ``;

                // Generate progress bar
                if (frac >= 0.9) {
                    progressBar = (`\`<——————————⚪> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.8) {
                    progressBar = (`\`<—————————⚪—> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.7) {
                    progressBar = (`\`<————————⚪——> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.7) {
                    progressBar = (`\`<———————⚪———> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.6) {
                    progressBar = (`\`<——————⚪————> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.5) {
                    progressBar = (`\`<—————⚪—————> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.4) {
                    progressBar = (`\`<————⚪——————> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.3) {
                    progressBar = (`\`<———⚪———————> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.2) {
                    progressBar = (`\`<——⚪————————> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0.1) {
                    progressBar = (`\`<—⚪—————————> (${formattedPlaying}/${formattedTotal})\``);
                } else if (frac >= 0) {
                    progressBar = (`\`<⚪——————————> (${formattedPlaying}/${formattedTotal})\``);
                } else {
                    global.logger.warn(chalk.black.bgYellow(`Failed to generate progress bar`));
                }

                return await message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`➡️ Currently playing`)
                            .setDescription(`**[${playing.title}](${playing.url})**\n[${playing.channel.name}](${playing.channel.url})\n\n\`${progressBar}\``)
                            .setThumbnail(playing.thumbnails[0].url)
                            .setFooter(`Requested by ${subscription.audioPlayer._state.resource.metadata.requester.username}`, subscription.audioPlayer._state.resource.metadata.requester.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp(subscription.audioPlayer._state.resource.metadata.timestamp)
                    ],
                    ephemeral: true
                });
            }
        } else {
            return await message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(`#FF3838`)
                        .setDescription(`<:cross:729019052571492434> There's nothing playing`)
                ],
                ephemeral: true
            });
        }
    }
}

module.exports = PlayingCommand;