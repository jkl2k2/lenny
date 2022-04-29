const { Listener } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class MessageReactionAddListener extends Listener {
    constructor() {
        super(`messageReactionAdd`, {
            emitter: `client`,
            event: `messageReactionAdd`
        });
    }

    async exec(reaction) {
        // Stop if old Lenny is present in server
        if (reaction.message.guild.members.cache.has(`771566996131282954`)) {
            return;
        }

        // ready check attachments function
        function extension(reaction, attachment) {
            const imageLink = attachment.split('.');
            const typeOfImage = imageLink[imageLink.length - 1];
            const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
            if (!image) return '';
            return attachment;
        }

        function getDescription(message) {
            if (message.cleanContent.length < 1 && message.embeds.length > 0) {
                // If starred message is an embed
                let constructed = ``;
                let embed = message.embeds[0];

                if (embed.author) constructed += `**${embed.author.name}**`;
                if (embed.title) constructed += `\n\n**${embed.title}**`;
                if (embed.description) constructed += `\n${embed.description}`;

                return constructed;
            } else if (message.cleanContent.length < 1 && message.attachments.first()) {
                // If attachment detected
                return `[${message.attachments.first().name}](${message.attachments.first().url})`;
            } else {
                // If only text
                return message.cleanContent;
            }
        }

        function checkImage(embed) {
            if (embed.image && embed.image.url) {
                return embed.image.url;
            } else {
                return "";
            }
        }

        // if uncached message
        if (reaction.message.partial) await reaction.message.fetch();

        // cache reaction (fetches potentially defunct resources)
        if (reaction.partial) await reaction.fetch();

        // easy access of message
        const message = reaction.message;

        // if not star, return
        if (reaction.emoji.name != `⭐`) return;

        // look for "starboard"
        const starChannel = message.client.guilds.cache.get(message.guild.id).channels.cache.find(channel => channel.name == `starboard`);

        // if no starboard found
        if (!starChannel) return message.channel.send(new MessageEmbed()
            .setDescription(`<:cross:729019052571492434> Unable to find a valid \`#starboard\` channel`)
            .setColor(`#FF3838`));

        // fetch last 100 embeds in starChannel
        const fetch = await starChannel.messages.fetch({ limit: 100 });

        // check if previous embed with same message
        const stars = fetch.filter((m) => m.embeds.length != 0).find((m) => m.embeds[0].footer && m.embeds[0].footer.text.includes(message.id));

        if (stars) {
            // if message already starred

            // check star amount
            const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);

            // store previous embed
            const foundStar = stars.embeds[0];

            // construct new embed to edit old one with
            const embed = new MessageEmbed()
                .setColor(foundStar.color)
                .setDescription(foundStar.description)
                .addField(`Channel`, message.channel.toString(), true)
                .addField(`Source`, `[Jump](${message.url})`, true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setTimestamp()
                .setFooter(`⭐ ${parseInt(star[1]) + 1} | ${message.id}`)
                .setImage(checkImage(foundStar));

            // fetch previous embed's ID
            const starMsg = await starChannel.messages.fetch(stars.id);

            // edit old embed with new one
            await starMsg.edit({
                embeds: [
                    embed
                ]
            });
        } else {
            // check for attachment
            var image = message.attachments.size > 0 ? await extension(reaction, message.attachments.first().url) : '';

            // if embed exists
            if (image == '' && message.embeds.length > 0 && message.embeds[0].image) {
                // if embed has full image
                image = message.embeds[0].image.url;
            } else if (image == '' && message.embeds.length > 0 && message.embeds[0].thumbnail) {
                // if embed has thumbnail
                image = message.embeds[0].thumbnail.url;
            } else if (message.author.id == `569277281046888488`) {
                image = `https://media1.tenor.com/images/be572fb0d07b6291065afb591eb1f714/tenor.gif`;
            }

            const embed = new MessageEmbed()
                .setColor(15844367)
                .setDescription(getDescription(message))
                .addField(`Channel`, message.channel.toString(), true)
                .addField(`Source`, `[Jump](${message.url})`, true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setTimestamp()
                .setFooter(`⭐ ${reaction.count} | ${message.id}`)
                .setImage(image);
            await starChannel.send({
                embeds: [
                    embed
                ]
            });
        }
    }
}

//! Remember to change export
module.exports = MessageReactionAddListener;