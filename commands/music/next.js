const Discord = require(`discord.js`);
const fetch = require(`node-fetch`);
const hex = require(`rgb-hex`);
const colorThief = require(`colorthief`);

async function sendDetails(input, c) {
    if (input.getType() == "livestream") {
        await fetch(input.getThumbnail())
            .then(r => r.buffer())
            .then(buf => `data:image/jpg;base64,` + buf.toString('base64'))
            .then(formatted => colorThief.getColor(formatted))
            .then(async rgb => {
                // Construct embed
                let musicEmbed = new Discord.MessageEmbed()
                    .setAuthor(`Now playing`, await input.getChannelThumbnail())
                    .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\n\`YouTube Livestream\``)
                    .setThumbnail(input.getThumbnail())
                    .setTimestamp()
                    .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
                    .setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`);
                // Send message
                c.send(musicEmbed);
                // Set last embed
                input.getRequester().guild.music.lastEmbed = musicEmbed;
            });
    } else if (input.getType() == "twitch") {
        let channel = await twitchClient.helix.users.getUserByName(input.getTitle());
        let musicEmbed = new Discord.MessageEmbed()
            .setAuthor(`Now playing`, channel.profilePictureUrl)
            .setDescription(`**[${channel.displayName}](www.twitch.tv/${channel.displayName})**\n\n\`Twitch Livestream\``)
            .setThumbnail(channel.profilePictureUrl)
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar());
        c.send(musicEmbed);
        lastDeatils = musicEmbed;
    } else {
        fetch(input.getThumbnail())
            .then(r => r.buffer())
            .then(buf => `data:image/jpg;base64,` + buf.toString('base64'))
            .then(formatted => colorThief.getColor(formatted))
            .then(async rgb => {
                // Construct embed
                let musicEmbed = new Discord.MessageEmbed()
                    .setAuthor(`Now playing`, await input.getChannelThumbnail())
                    .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\nLength: \`${await input.getLength()}\``)
                    .setThumbnail(input.getThumbnail())
                    .setTimestamp()
                    .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
                    .setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`);
                // Send message
                c.send(musicEmbed);
                // Set last embed
                input.getRequester().guild.music.lastEmbed = musicEmbed;
            });
    }
}

module.exports = {
    name: 'next',
    description: 'Displays info on which song is up next in queue',
    aliases: ['n'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        var queue = message.guild.music.queue;

        if (queue == undefined) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: There is no video coming up in the queue`)
                .setColor(`#0083FF`));
        }

        if (queue[0] != undefined) {
            sendDetails(queue[0], message.channel);
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: There is no video coming up in the queue`)
                .setColor(`#0083FF`));
        }
    }
};