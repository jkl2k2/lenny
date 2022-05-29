const { Command } = require(`discord-akairo`);
const { MessageEmbed, MessageButton, MessageActionRow } = require(`discord.js`);

const updateEmbed = async (i, row, bet) => {
    const paylineDivisor = 20;
    const numPaylines = Math.floor(bet / paylineDivisor);
    switch (numPaylines) {
        case 0:
            return await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🎰 ${i.user.username}'s Slots Game`)
                        .setDescription(`
                    Current bet: \`$${bet}\`

                    :grapes: | :grapes: | :grapes:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes: 
                    `)
                        .setThumbnail(i.user.avatarURL())
                        .setColor(`#801431`)
                ],
                components: [row],
                fetchReply: true,
            });
        case 1:
            return await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🎰 ${i.user.username}'s Slots Game`)
                        .setDescription(`
                    Current bet: \`$${bet}\`

                    :grapes: | :grapes: | :grapes:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes: 
                    `)
                        .setThumbnail(i.user.avatarURL())
                        .setColor(`#801431`)
                ],
                components: [row],
                fetchReply: true,
            });
        case 2:
            return await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🎰 ${i.user.username}'s Slots Game`)
                        .setDescription(`
                    Current bet: \`$${bet}\`

                    :grapes: | :grapes: | :grapes:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:

                    \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:arrow_up:
                    `)
                        .setThumbnail(i.user.avatarURL())
                        .setColor(`#801431`)
                ],
                components: [row],
                fetchReply: true,
            });
        case 3:
            return await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🎰 ${i.user.username}'s Slots Game`)
                        .setDescription(`
                    Current bet: \`$${bet}\`

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:

                    \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:arrow_up:
                    `)
                        .setThumbnail(i.user.avatarURL())
                        .setColor(`#801431`)
                ],
                components: [row],
                fetchReply: true,
            });
        case 4:
            return await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🎰 ${i.user.username}'s Slots Game`)
                        .setDescription(`
                    Current bet: \`$${bet}\`

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:

                    :arrow_up:\xa0\xa0\xa0\xa0:arrow_up:
                    `)
                        .setThumbnail(i.user.avatarURL())
                        .setColor(`#801431`)
                ],
                components: [row],
                fetchReply: true,
            });
        case 5:
            return await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🎰 ${i.user.username}'s Slots Game`)
                        .setDescription(`
                    Current bet: \`$${bet}\`

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :arrow_up:\xa0\xa0\xa0\xa0:arrow_up:
                    `)
                        .setThumbnail(i.user.avatarURL())
                        .setColor(`#801431`)
                ],
                components: [row],
                fetchReply: true,
            });
        default:
            return await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🎰 ${i.user.username}'s Slots Game`)
                        .setDescription(`
                    Current bet: \`$${bet}\`

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :grapes: | :grapes: | :grapes:\xa0\xa0\xa0\xa0:arrow_left:

                    :arrow_up:\xa0\xa0\xa0\xa0:arrow_up:\xa0\xa0\xa0\xa0:arrow_up:
                    `)
                        .setThumbnail(i.user.avatarURL())
                        .setColor(`#801431`)
                ],
                components: [row],
                fetchReply: true,
            });
    }
};

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class SlotsCommand extends Command {
    constructor() {
        super(`slots`, {
            aliases: [`slots`],
            category: `economy`,
            args: [
                {
                    name: `bet`,
                    type: `integer`
                }
            ],
            // slash: true,
            // slashOptions: [
            //     {
            //         name: `bet`,
            //         type: `INTEGER`,
            //         description: `The amount you want to start the bet with`,
            //         required: true
            //     }
            // ],
            description: `Play a slot machine`,
            channel: `guild`
        });
    }

    exec() {
        return;
    }

    async execSlash(message, args) {
        return;

        await message.interaction.deferReply();

        if (args.bet > message.client.currency.getBalance(message.author.id)) {
            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> You don't have enough money to bet that amount`)
                        .setColor(`#FF3838`)
                ]
            });
        } else if (args.bet < 0) {
            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> You can't bet a negative amount of money`)
                        .setColor(`#FF3838`)
                ]
            });
        } else if (isNaN(args.bet)) {
            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Please enter a number value for your bet`)
                        .setColor(`#FF3838`)
                ]
            });
        }

        const buttonList = [
            new MessageButton()
                .setCustomId(`spin`)
                .setLabel(`SPIN`)
                .setStyle(`PRIMARY`),
            new MessageButton()
                .setCustomId(`+10`)
                .setLabel(`+10`)
                .setStyle(`SUCCESS`),
            new MessageButton()
                .setCustomId(`+5`)
                .setLabel(`+5`)
                .setStyle(`SUCCESS`),
            new MessageButton()
                .setCustomId(`-5`)
                .setLabel(`-5`)
                .setStyle(`DANGER`),
            new MessageButton()
                .setCustomId(`-10`)
                .setLabel(`-10`)
                .setStyle(`DANGER`),
        ];

        if (args.bet + 10 > message.client.currency.getBalance(message.author.id)) {
            // Can't +10
            buttonList[1].setDisabled(true);
            buttonList[1].setStyle(`SECONDARY`);
        }
        if (args.bet + 5 > message.client.currency.getBalance(message.author.id)) {
            // Can't +5
            buttonList[2].setDisabled(true);
            buttonList[2].setStyle(`SECONDARY`);
        }
        if (args.bet - 5 <= 0) {
            // Can't -5
            buttonList[3].setDisabled(true);
            buttonList[3].setStyle(`SECONDARY`);
        }
        if (args.bet - 10 <= 0) {
            // Can't -10
            buttonList[4].setDisabled(true);
            buttonList[4].setStyle(`SECONDARY`);
        }

        const row = new MessageActionRow().addComponents(buttonList);

        const currentView = await updateEmbed(message.interaction, row, args.bet);

        const timeout = 120000;

        const filter = (i) =>
            i.user.id === message.author.id &&
            i.customId === buttonList[0].customId ||
            i.customId === buttonList[1].customId ||
            i.customId === buttonList[2].customId ||
            i.customId === buttonList[3].customId ||
            i.customId === buttonList[4].customId;

        const collector = await currentView.createMessageComponentCollector({
            filter,
            time: timeout,
        });

        collector.on("collect", async (i) => {
            await i.deferUpdate();
            switch (i.customId) {
                case `spin`:
                    // Spin logic
                    break;
                case `+10`:
                    // Add 10 to bet
                    args.bet += 10;
                    break;
                case `+5`:
                    // Add 5 to bet
                    args.bet += 5;
                    break;
                case `-5`:
                    // Remove 5 from bet
                    args.bet -= 5;
                    break;
                case `-10`:
                    // Remove 10 from bet
                    args.bet -= 10;
                    break;
                default:
                    // Catch
                    break;
            }
            if (args.bet + 10 > message.client.currency.getBalance(message.author.id)) {
                // Can't +10
                buttonList[1].setDisabled(true);
                buttonList[1].setStyle(`SECONDARY`);
            } else {
                buttonList[1].setDisabled(false);
                buttonList[1].setStyle(`SUCCESS`);
            }
            if (args.bet + 5 > message.client.currency.getBalance(message.author.id)) {
                // Can't +5
                buttonList[2].setDisabled(true);
                buttonList[2].setStyle(`SECONDARY`);
            } else {
                buttonList[2].setDisabled(false);
                buttonList[2].setStyle(`SUCCESS`);
            }
            if (args.bet - 5 <= 0) {
                // Can't -5
                buttonList[3].setDisabled(true);
                buttonList[3].setStyle(`SECONDARY`);
            } else {
                buttonList[3].setDisabled(false);
                buttonList[3].setStyle(`DANGER`);
            }
            if (args.bet - 10 <= 0) {
                // Can't -10
                buttonList[4].setDisabled(true);
                buttonList[4].setStyle(`SECONDARY`);
            } else {
                buttonList[4].setDisabled(false);
                buttonList[4].setStyle(`DANGER`);
            }
            updateEmbed(i, new MessageActionRow().addComponents(buttonList), args.bet);
            collector.resetTimer();
        });
    }
}

module.exports = SlotsCommand;