const { MessageEmbed } = require(`discord.js`);
const genius = require(`genius-lyrics-api`);
const config = require(`config`);
const geniusAPI = config.get(`Bot.GENIUS_API`);

module.exports = {
    name: 'lyrics',
    description: 'Find the lyrics to a certain song',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'music',
    async execute(message, args) {
        if (!args[0] && !message.guild) return console.log(`Not in guild and no args`);

        let title;

        if (!args[0] && message.guild.music.lastPlayed) {
            title = message.guild.music.lastPlayed.getTitle();
        } else {
            title = args.join(` `);
        }

        const options = {
            apiKey: geniusAPI,
            title: title,
            artist: ``,
            optimizeQuery: false
        };

        genius.searchSong(options).then(songs => {
            if (songs == null) return message.channel.send(new MessageEmbed()
                .setDescription(`No results found`));

            let result = songs[0];

            genius.getLyrics(options).then(async lyrics => {
                try {
                    await message.channel.send(new MessageEmbed()
                        .setTitle(result.title)
                        .setURL(result.url)
                        .setThumbnail(result.albumArt)
                        .setDescription(lyrics)
                        .setColor(`#2EC14E`));
                } catch (error) {
                    if (error.code == 50035) {
                        message.channel.send(result.url);

                        message.channel.send(new MessageEmbed()
                            .setDescription(`<:cross:729019052571492434> Sorry, the lyrics were too long to fit in Discord's message limits. Use this link instead.`)
                            .setColor(`#FF3838`));
                    }
                }
            });
        });
    }
};