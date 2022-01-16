const { Command } = require(`discord-akairo`);
const PlayCommand = require(`./play`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class PlayNextCommand extends Command {
    constructor() {
        super(`playnext`, {
            aliases: [`playnext`],
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
            description: `Queues a song at the beginning of the queue`,
            channel: `guild`

        });

    }

    exec() {
        return;
    }

    execSlash(message, args) {
        PlayCommand.prototype.execSlash(message, args, {
            next: true,
            force: false,
            client: this.client,
            guildId: message.guild.id
        });
    }
}

module.exports = PlayNextCommand;