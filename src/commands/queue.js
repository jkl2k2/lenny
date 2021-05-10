const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

//#region Helper Functions
async function queueResolver(arr, index) {
    if (arr[index]) {
        return `\`${index + 1}.\` **[${arr[index].getTitle()}](${arr[index].getURL()})**\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0By: **${arr[index].getChannelName()}**\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0Length: \`${await arr[index].getLength()}\``;
    } else {
        return " ";
    }
}

function queueOverflowResolver(arr) {
    if (arr.length <= 5) {
        return " ";
    } else if (arr.length > 5) {
        return `**Total of ${arr.length} songs**`;
    }
}

async function sendEmbed(page, message, sent) {
    let queue = message.guild.music.queue;

    if (!sent) {
        let queueEmbed = new MessageEmbed()
            .setDescription(`${await queueResolver(queue, 0 + page * 5)}\n\n${await queueResolver(queue, 1 + page * 5)}\n\n${await queueResolver(queue, 2 + page * 5)}\n\n${await queueResolver(queue, 3 + page * 5)}\n\n${await queueResolver(queue, 4 + page * 5)}\n\n${await queueOverflowResolver(queue)}`)
            .setAuthor(`Current queue - Page ${page + 1}`, message.guild.iconURL())
            .setColor(`#36393f`);
        return await message.channel.send(queueEmbed);
    } else {
        let queueEmbed = new MessageEmbed()
            .setDescription(`${await queueResolver(queue, 0 + page * 5)}\n\n${await queueResolver(queue, 1 + page * 5)}\n\n${await queueResolver(queue, 2 + page * 5)}\n\n${await queueResolver(queue, 3 + page * 5)}\n\n${await queueResolver(queue, 4 + page * 5)}\n\n${await queueOverflowResolver(queue)}`)
            .setAuthor(`Current queue - Page ${page + 1}`, message.guild.iconURL())
            .setColor(`#36393f`);
        return await sent.edit(queueEmbed);
    }
}

async function reactionHandler(sent, message, page) {
    var queue = message.guild.music.queue;

    const filter = (reaction, user) => {
        return ['◀️', '🔘', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    if (page == 0 && !queue[5]) {

        // Only first page exists

    } else if (!queue[(page + 1) * 5]) {

        // Last page
        sent.react('◀️')
            .catch(() => console.error('One of the emojis failed to react.'));

    } else if (page == 0) {

        // First page
        sent.react('▶️');

    } else if (page > 0) {

        // Any page between first and last
        sent.react('◀️')
            .then(() => sent.react('▶️'))
            .catch(() => console.error('One of the emojis failed to react.'));

    }

    sent.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(async collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '◀️') {
                // Previous page
                let newSent = await sendEmbed(page - 1, message, sent);
                newSent.reactions.removeAll();
                reactionHandler(newSent, message, page - 1);
            } else if (reaction.emoji.name === "🔘") {
                // Home page (first page)
                let newSent = await sendEmbed(0, message, sent);
                newSent.reactions.removeAll();
                reactionHandler(newSent, message, 0);
            } else if (reaction.emoji.name === "▶️") {
                // Next page
                let newSent = await sendEmbed(page + 1, message, sent);
                newSent.reactions.removeAll();
                reactionHandler(newSent, message, page + 1);
            }
        })
        .catch(async collected => {
            // message.reply('Reaction timeout');
            /*
            let noControlQueue = new MessageEmbed()

                // .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
                .setDescription(`${await queueResolver(queue, 0 + page * 5)}\n\n${await queueResolver(queue, 1 + page * 5)}\n\n${await queueResolver(queue, 2 + page * 5)}\n\n${await queueResolver(queue, 3 + page * 5)}\n\n${await queueResolver(queue, 4 + page * 5)}\n\n${queueOverflowResolver(queue)}`)
                .setAuthor(`Current queue - Page ${page + 1}`, message.guild.iconURL())
                .setColor(`#36393f`);
            */
            // .setFooter(`Controls cleared due to inactivity`);
            // sent.edit(noControlQueue);
            sent.reactions.removeAll();
        });
}
//#endregion

//#region Music info message sending
async function sendDetails(input, c) {
    if (input.getType() == "livestream") {
        // Construct embed
        let musicEmbed = new MessageEmbed()
            .setAuthor(`In queue - Video #${input.getPosition()}`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\n\`YouTube Livestream\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#36393f`);
        // Send message
        c.send(musicEmbed);
        // Set last embed
        input.getRequester().guild.music.lastEmbed = musicEmbed;
    } else {
        // Construct embed
        let musicEmbed = new MessageEmbed()
            .setAuthor(`In queue - Video #${input.getPosition()}`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\nLength: \`${await input.getLength()}\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#36393f`);
        // Send message
        c.send(musicEmbed);
        // Set last embed
        input.getRequester().guild.music.lastEmbed = musicEmbed;
    }
}
//#endregion

class QueueCommand extends Command {
    constructor() {
        super(`queue`, {
            aliases: [`queue`, `q`],
            args: [
                {
                    id: `position`,
                    type: `integer`,
                }
            ],
            category: `music`,
            description: `Shows all queue songs`,
            channel: `guild`
        });
    }

    async exec(message, args) {
        const queue = message.guild.music.queue;

        if (queue == undefined || queue.length == 0) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: The queue is currently empty`)
                .setColor(`#36393f`));
        }

        let page = 0;

        let reqIndex;

        if (args.position) {
            reqIndex = args.position - 1;
        }

        if (queue == undefined || queue.length == 0) {
            message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: The queue is currently empty`)
                .setColor(`#36393f`));
        } else {
            if (args.position && queue[reqIndex]) {
                sendDetails(queue[reqIndex], message.channel, args.position);
            } else if (args.position && !queue[reqIndex]) {
                message.channel.send(new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> There is not a video at that spot in the queue`)
                    .setColor(`#FF3838`));
            } else if (!args.position) {
                var sent = await sendEmbed(page, message);
                reactionHandler(sent, message, page);
            }
        }
    }
}

module.exports = QueueCommand;