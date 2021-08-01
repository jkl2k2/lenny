const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class DeployCommand extends Command {
    constructor() {
        super(`deploy`, {
            aliases: [`deploy`],
            category: `owner`,
            description: `Deploys slash commands`,
            channel: `guild`
        });
    }

    async exec(message) {
        await message.guild.commands.set([
            {
                name: 'play',
                description: 'Plays a song from YouTube',
                options: [
                    {
                        name: 'song',
                        type: 'STRING',
                        description: 'Video/playlist URL or video search terms',
                        required: true,
                    },
                ],
            },
            {
                name: 'skip',
                description: 'Skip to the next song in the queue',
            },
            {
                name: 'queue',
                description: 'See the music queue',
                options: [
                    {
                        name: 'position',
                        type: 'INTEGER',
                        description: 'Position of the song in queue to view',
                        required: false,
                    },
                ],
            },
            {
                name: 'shuffle',
                description: 'Shuffle the music queue',
            },
            {
                name: 'pause',
                description: 'Pauses the song that is currently playing',
            },
            {
                name: 'resume',
                description: 'Resume playback of the current song',
            },
            {
                name: 'leave',
                description: 'Leave the voice channel',
            },
            {
                name: 'clear',
                description: 'Clears the music queue',
            },
            {
                name: 'playing',
                description: 'Shows the currently playing song',
            },
            {
                name: 'blacklist',
                description: 'Blacklist a user from using the bot',
                options: [
                    {
                        name: `action`,
                        type: `STRING`,
                        description: `Action to take on the blacklist. Options: "add", "remove", "view"`,
                        required: true,
                    },
                    {
                        name: `user`,
                        type: `USER`,
                        description: `Target user`,
                        required: false,
                    }
                ],
            }
        ]);

        await message.reply('Deployed!');
    }
}

module.exports = DeployCommand;