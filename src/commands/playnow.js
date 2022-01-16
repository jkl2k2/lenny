const { Command } = require(`discord-akairo`);
const PlayCommand = require(`./play`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class PlayNowCommand extends Command {
    constructor() {
        super(`playnow`, {
            aliases: [`playnow`],
            args: [
                {
                    id: `song`,
                    match: `content`
                }
            ],
            slash: true,
            slashOptions: [
                {
                    name: 'song',
                    type: 'STRING',
                    description: 'Plays a song or playlist from either YouTube, Spotify (albums as well), or SoundCloud',
                    required: true,
                }
            ],
            category: `music`,
            description: `Skips the current song and plays your song instead`,
            channel: `guild`

        });

    }

    exec() {
        return;
    }

    execSlash(message, args) {
        PlayCommand.prototype.execSlash(message, args, {
            next: true,
            force: true,
            client: this.client,
            guildId: message.guild.id
        });
    }
}

module.exports = PlayNowCommand;