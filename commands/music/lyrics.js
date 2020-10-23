const { MessageEmbed } = require(`discord.js`);
const genius = require(`genius-lyrics-api`);
const config = require(`config`);
const geniusAPI = config.get(`Bot.GENIUS_API`);

module.exports = {
    name: 'lyrics',
    description: 'Find the lyrics to a certain song',
    // aliases: ['aliases'],
    args: true,
    usage: '[song title]',
    altUsage: '"[song title]" by [song artist]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'music',
    async execute(message, args) {
        let title;
        let artist;

        const argsFull = args.join(` `);

        if (argsFull.indexOf(`"`) != -1 && argsFull.indexOf(`"`, argsFull.indexOf(`"`) + 1) != -1 && argsFull.indexOf(`by`) != -1) {
            title = argsFull.substring(argsFull.indexOf(`"`) + 1, argsFull.indexOf(`"`, argsFull.indexOf(`"`) + 1));

            artist = argsFull.substring(argsFull.indexOf(`by `) + 3);
        } else if (argsFull.indexOf(`by`) != -1) {
            title = argsFull.substring(0, argsFull.indexOf(`by`));

            artist = argsFull.substring(argsFull.indexOf(`by `) + 3);
        } else {
            title = argsFull;
        }

        console.log(`Title: ${title}\nArtist: ${artist}`);

        const options = {
            apiKey: geniusAPI,
            title: title,
            artist: artist || ``,
            optimizeQuery: false
        };

        genius.searchSong(options).then(songs => {
            if (songs == null) return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> No results found`)
                .setColor(`#FF3838`));

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