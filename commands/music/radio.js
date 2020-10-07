const index = require(`../../index.js`);
const { MessageEmbed } = require(`discord.js`);
// const iheart = require(`iheart`);
const musicConstructor = require(`../../modules/musicConstructor`);
const player = require(`../../modules/musicPlayer`);
const logger = index.getLogger();

module.exports = {
    name: 'radio',
    description: 'Use iHeartRadio to search for a station or a genre',
    aliases: ['iheart', 'iheartradio'],
    args: true,
    usage: '[search terms]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'music',
    async execute(message, args) {
        const client = message.client;

        // Search using provided arguments
        const matches = await iheart.search(args.join());

        // If no results
        if (!matches.stations[0]) return message.channel.send(new MessageEmbed()
            .setDescription(`<:cross:729019052571492434> Sorry, iHeartRadio could not find anything with that input`)
            .setColor(`#FF3838`));

        // Construct a new RadioStation
        const newRadio = musicConstructor.constructRadio(matches.stations[0], message.member);

        // Easy access to music data
        let music = message.guild.music;

        // Define the music-related variables
        const queue = music.queue;

        // Add new video to queue
        queue.push(newRadio);

        if (music.playing) {
            message.channel.send(new MessageEmbed()
                .setAuthor(`Queued (#${newRadio.getPosition()})`, await newRadio.getChannelThumbnail())
                .setDescription(`**[${newRadio.getTitle()}](${newRadio.getURL()})**\n[${newRadio.getChannelName()}](${newRadio.getChannelURL()})\n\nLength: \`${await newRadio.getLength()}\``)
                .setThumbnail(newRadio.getThumbnail())
                .setTimestamp()
                .setFooter(`Requested by ${newRadio.getRequesterName()}`, newRadio.getRequesterAvatar())
                .setColor(`#36393f`));
        }

        if (!message.member.voice.channel) return logger.warn(`User not in voice channel after radio processing`);

        if (client.voice.connections.get(message.member.voice.channel)) {
            // if already in vc
            // let connection = client.voice.connections.get(message.member.voice.channel);
            if (!music.playing /* && !connection.voice.speaking */) {
                return player.play(message);
            }
        }

        if (message.member.voice.channel) {
            message.member.voice.channel.join()
                .then(connection => {
                    if (!music.playing /* && !connection.voice.speaking */) {
                        return player.play(message);
                    } else {
                        logger.debug(`Connection speaking`);
                    }
                })
                .catch(`${logger.error}`);
        } else {
            logger.error("Failed to join voice channel");
        }
    }
};