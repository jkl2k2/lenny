const { Command } = require(`discord-akairo`);
const { MessageEmbed, MessageActionRow, MessageButton } = require(`discord.js`);

//#region Helper Functions
async function queueResolver(arr, index) {
    if (arr[index]) {
        return `\`${index + 1}.\` **[${arr[index].title}](${arr[index].url})**\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0By: **${arr[index].video.channel.title}**`;
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

async function generateEmbed(page, message) {
    const subscription = message.client.subscriptions.get(message.guild.id);

    const queue = subscription.queue;

    const queueEmbed = new MessageEmbed()
        .setDescription(`${await queueResolver(queue, 0 + page * 5)}\n\n${await queueResolver(queue, 1 + page * 5)}\n\n${await queueResolver(queue, 2 + page * 5)}\n\n${await queueResolver(queue, 3 + page * 5)}\n\n${await queueResolver(queue, 4 + page * 5)}\n\n${await queueOverflowResolver(queue)}`)
        .setAuthor(`Current queue - Page ${page + 1}`, message.interaction.guild.iconURL())
        .setColor(`#36393f`);

    let row = new MessageActionRow();

    if (page === 0 && !queue[5]) {
        // Only first page exists
        row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setCustomId(`Previous`)
                    .setLabel(`Previous`)
                    .setStyle(`SECONDARY`)
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId(`Next`)
                    .setLabel(`Next`)
                    .setStyle(`SECONDARY`)
                    .setDisabled(true)
            ]);
    } else if (!queue[(page + 1) * 5]) {
        // Last page
        row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setCustomId(`Previous`)
                    .setLabel(`Previous`)
                    .setStyle(`SECONDARY`),
                new MessageButton()
                    .setCustomId(`Next`)
                    .setLabel(`Next`)
                    .setStyle(`SECONDARY`)
                    .setDisabled(true)
            ]);
    } else if (page > 0) {
        // Any page between first and last
        row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setCustomId(`Previous`)
                    .setLabel(`Previous`)
                    .setStyle(`SECONDARY`),
                new MessageButton()
                    .setCustomId(`Next`)
                    .setLabel(`Next`)
                    .setStyle(`SECONDARY`)
            ]);
    } else {
        // First page, with next page available
        row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setCustomId(`Previous`)
                    .setLabel(`Previous`)
                    .setStyle(`SECONDARY`)
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId(`Next`)
                    .setLabel(`Next`)
                    .setStyle(`SECONDARY`)
            ]);
    }

    return {
        embed: queueEmbed,
        row: row
    };
}

async function sendEmbed(page, message) {
    const { embed, row } = await generateEmbed(page, message);

    // Send the interaction reply
    await message.interaction.editReply({
        embeds: [
            embed
        ],
        components: [
            row
        ],
    });

    const filter = i => (i.customId === `Next` || i.customId === `Previous`) && i.user.id === message.interaction.user.id;

    const collector = message.interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1, componentType: `BUTTON` });

    collector.on(`collect`, async i => {
        // console.log(`Collected ${i.customId}`);
        await i.deferUpdate();
        if (i.customId === `Next`) {
            /*
            await i.editReply({
                embeds: [
                    (await generateEmbed(page + 1, message)).embed
                ],
                components: [
                    (await generateEmbed(page + 1, message)).row
                ],
            });
            */
            await sendEmbed(page + 1, message);
        } else {
            /*
            await i.editReply({
                embeds: [
                    (await generateEmbed(page - 1, message)).embed
                ],
                components: [
                    (await generateEmbed(page - 1, message)).row
                ],
            });
            */
            await sendEmbed(page - 1, message);
        }
    });

    collector.once('end', collected => {
        return;
    });
}
//#endregion

//#region Music info message sending
async function sendDetails(track, message, pos) {
    const musicEmbed = new MessageEmbed()
        .setAuthor(`Currently Queued (#${pos})`)
        .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.title}](${track.video.channel.url})`)
        .setThumbnail(track.video.maxRes.url)
        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
        .setColor(`#36393f`)
        .setTimestamp();
    // Send message
    return await message.interaction.editReply({
        embeds: [
            musicEmbed
        ],
    });
}
//#endregion

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
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
            slashOptions: [
                {
                    name: 'position',
                    type: 'INTEGER',
                    description: 'Position of the song in queue to view',
                    required: false,
                },
            ],
            category: `music`,
            description: `Shows all queue songs`,
            channel: `guild`
        });
    }

    exec(message, args) {
        return;
    }

    async execSlash(message, args) {
        await message.interaction.defer();

        const subscription = this.client.subscriptions.get(message.guild.id);

        if (!subscription) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: The queue is currently empty`)
                        .setColor(`#36393f`)
                ],
            });
        }

        const queue = subscription.queue;

        if (queue == undefined || queue.length == 0) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: The queue is currently empty`)
                        .setColor(`#36393f`)
                ],
            });
        }

        let page = 0;

        let reqIndex;

        if (args.position && args.position.value) {
            reqIndex = args.position.value - 1;
        }

        if (args.position && args.position.value && queue[reqIndex]) {
            sendDetails(queue[reqIndex], message, args.position.value);
        } else if (args.position.value && !queue[reqIndex]) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: There is not a video at that spot in the queue`)
                        .setColor(`#36393f`)
                ],
                ephemeral: true
            });
        } else if (!args.position.value) {
            await sendEmbed(page, message);
        }
    }
}

module.exports = QueueCommand;