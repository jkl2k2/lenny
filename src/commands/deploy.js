const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

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
                description: 'Plays a song',
                options: [
                    {
                        name: 'song',
                        type: 'STRING',
                        description: 'The URL of the song to play',
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
        ]);

        await message.reply('Deployed!');
    }
}

module.exports = DeployCommand;