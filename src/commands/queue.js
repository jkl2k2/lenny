const { Command } = require(`discord-akairo`);
const { MessageEmbed, MessageActionRow, MessageButton } = require(`discord.js`);
const pretty = require(`pretty-ms`);

//#region Helper Functions
async function queueResolver(arr, index) {
    if (arr[index]) {
        return `\`${index + 1}.\` **[${arr[index].title}](${arr[index].url})**\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0By: **[${arr[index].video.channel.name}](${arr[index].video.channel.url})**`;
    } else {
        return " ";
    }
}

function queueOverflowResolver(arr) {
    if (arr.length <= 5) {
        let totalTime = 0;
        for (let i = 0; i < arr.length; i++) {
            totalTime += arr[i].video.durationInSec * 1000;
        }
        return `\`(Total playtime: ${pretty(totalTime)})\``;
    } else if (arr.length > 5) {
        let totalTime = 0;
        for (let i = 0; i < arr.length; i++) {
            totalTime += arr[i].video.durationInSec * 1000;
        }
        return `**Total of ${arr.length} songs** \`(Total playtime: ${pretty(totalTime)})\``;
    }
}

async function generateEmbed(page, message, end) {
    const subscription = message.client.subscriptions.get(message.guild.id);

    if (!subscription) {
        return {
            embed: new MessageEmbed()
                .setDescription(`:information_source: The queue is now empty`)
                .setColor(`#36393f`),
            row:
                new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                            .setCustomId(`Home`)
                            .setLabel(`Home`)
                            .setStyle(`SUCCESS`)
                            .setDisabled(true),
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
                    ])
        };
    }

    const queue = subscription.queue;

    const playing = subscription.audioPlayer._state.resource.metadata.video;

    const queueEmbed = new MessageEmbed()
        .setDescription(`**Currently playing:\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0[${playing.title}](${playing.url})**\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0By: **[${playing.channel.name}](${playing.channel.url})**\n\`——————————————————\`\n${await queueResolver(queue, 0 + page * 5)}\n\n${await queueResolver(queue, 1 + page * 5)}\n\n${await queueResolver(queue, 2 + page * 5)}\n\n${await queueResolver(queue, 3 + page * 5)}\n\n${await queueResolver(queue, 4 + page * 5)}\n\n${await queueOverflowResolver(queue)}`)
        .setAuthor(`Current queue - Page ${page + 1}`, message.interaction.guild.iconURL())
        .setColor(`#36393f`);

    let row = new MessageActionRow();

    if (page === 0 && !queue[5] || end) {
        // Only first page exists
        row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setCustomId(`Home`)
                    .setLabel(`Home`)
                    .setStyle(`SUCCESS`)
                    .setDisabled(true),
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
                    .setCustomId(`Home`)
                    .setLabel(`Home`)
                    .setStyle(`SUCCESS`),
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
                    .setCustomId(`Home`)
                    .setLabel(`Home`)
                    .setStyle(`SUCCESS`),
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
                    .setCustomId(`Home`)
                    .setLabel(`Home`)
                    .setStyle(`SUCCESS`)
                    .setDisabled(true),
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

async function sendEmbed(page, message, end) {
    const { embed, row } = await generateEmbed(page, message, end);

    // Send the interaction reply
    await message.interaction.editReply({
        embeds: [
            embed
        ],
        components: [
            row
        ]
    });

    const filter = i => (i.customId === `Next` || i.customId === `Previous`) || i.customId === `Home` && i.user.id === message.interaction.user.id;

    const collector = message.interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1, componentType: `BUTTON` });

    collector.on(`collect`, async i => {
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
        } else if (i.customId === `Previous`) {
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
        } else {
            await sendEmbed(0, message);
        }
    });

    collector.once('end', (collected, reason) => {
        if (reason === `time`) {
            return sendEmbed(page, message, true);
        } else {
            return;
        }
    });
}
//#endregion

//#region Music info message sending
async function sendDetails(track, message, pos) {
    const musicEmbed = new MessageEmbed()
        .setAuthor(`Currently Queued (#${pos})`)
        .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.name}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
        .setThumbnail(track.video.thumbnails[0].url)
        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
        .setColor(`#36393f`)
        .setTimestamp();
    // Send message
    return await message.interaction.editReply({
        embeds: [
            musicEmbed
        ]
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
            slash: true,
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
        await message.interaction.deferReply({
            ephemeral: true
        });

        const subscription = this.client.subscriptions.get(message.guild.id);

        if (!subscription) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: The queue is currently empty`)
                        .setColor(`#36393f`)
                ]
            });
        }

        const queue = subscription.queue;

        if (queue == undefined || queue.length == 0) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: The queue is currently empty`)
                        .setColor(`#36393f`)
                ]
            });
        }

        let page = 0;

        let reqIndex;

        if (args.position && args.position) {
            reqIndex = args.position - 1;
        }

        if (args.position && args.position && queue[reqIndex]) {
            sendDetails(queue[reqIndex], message, args.position);
        } else if (args.position && args.position && !queue[reqIndex]) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: There is not a video at that spot in the queue`)
                        .setColor(`#36393f`)
                ]
            });
        } else {
            await sendEmbed(page, message);
        }
    }
}

module.exports = QueueCommand;