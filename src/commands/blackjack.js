const { Command } = require(`discord-akairo`);
const { MessageEmbed, MessageButton, MessageActionRow } = require(`discord.js`);

function createDeck() {
    var suits = ["♠️", "♥️", "♦️", "♣️"];
    var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    var deck = [];

    for (var i = 0; i < values.length; i++) {
        for (var x = 0; x < suits.length; x++) {
            var weight = parseInt(values[i]);
            if (values[i] == "J" || values[i] == "Q" || values[i] == "K")
                weight = 10;
            if (values[i] == "A")
                weight = 11;
            var card = { value: values[i], suit: suits[x], weight: weight };
            deck.push(card);
        }
    }

    return deck;
}

function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

function drawCard(deck) {
    return deck.pop();
}

function showHand(user) {
    var str = ``;
    for (var i = 0; i < user.hand.length; i++) {
        str += `**[\\${user.hand[i].suit}${user.hand[i].value}]**`;
        if (i != user.hand.length - 1) {
            str += ` `;
        }
    }
    return str;
}

function updatePoints(user) {
    user.points = 0;
    user.altPoints = 0;
    for (var i = 0; i < user.hand.length; i++) {
        switch (user.hand[i].value) {
            case "K":
            case "Q":
            case "J":
                user.points += 10;
                user.altPoints += 10;
                break;
            case "A":
                user.points += 1;
                user.altPoints += 11;
                break;
            default:
                user.points += parseInt(user.hand[i].value);
                user.altPoints += parseInt(user.hand[i].value);
        }
    }
}

function showPoints(user) {
    updatePoints(user);
    if (user.points != user.altPoints) {
        return `${user.points} / ${user.altPoints} points`;
    } else if (user.points == user.altPoints) {
        return `${user.points} points`;
    }
}

function distFrom21(user) {
    if (user.altPoints < 21) {
        return 21 - user.altPoints;
    } else {
        return 21 - user.points;
    }
}

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class BlackjackCommand extends Command {
    constructor() {
        super(`blackjack`, {
            aliases: [`blackjack`, `bj`],
            args: [
                {
                    name: `bet`,
                    type: `integer`
                }
            ],
            slash: true,
            slashOptions: [
                {
                    name: `bet`,
                    type: `INTEGER`,
                    description: `Your bet against the dealer`,
                    required: true
                }
            ],
            category: `economy`,
            description: `Play blackjack`,
            channel: `guild`
        });
    }

    exec() {
        return;
    }

    async execSlash(message, args) {
        await message.interaction.deferReply();

        if (args.bet > message.client.currency.getBalance(message.author.id)) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> You don't have enough money to bet that amount`)
                        .setColor(`#FF3838`)
                ]
            });
        } else if (args.bet < 0) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> You can't bet a negative amount of money`)
                        .setColor(`#FF3838`)
                ]
            });
        } else if (isNaN(args.bet)) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Please enter a number value for your bet`)
                        .setColor(`#FF3838`)
                ]
            });
        }

        const deck = shuffle(createDeck());

        const player = {
            hand: [drawCard(deck), drawCard(deck)],
            points: 0,
            altPoints: 0
        };

        const dealer = {
            hand: [drawCard(deck)],
            points: 0,
            altPoints: 0
        };

        const buttonList = [
            new MessageButton()
                .setCustomId(`hit`)
                .setLabel(`Hit`)
                .setStyle(`SUCCESS`),
            new MessageButton()
                .setCustomId(`stay`)
                .setLabel(`Stay`)
                .setStyle(`DANGER`),
            new MessageButton()
                .setCustomId(`double`)
                .setLabel(`Double down`)
                .setStyle(`PRIMARY`)
        ];

        if (args.bet * 2 > message.client.currency.getBalance(message.author.id)) {
            // Can't double down
            buttonList[2].setDisabled(true);
            buttonList[2].setStyle(`SECONDARY`);
        }

        const row = new MessageActionRow().addComponents(buttonList);

        const currentView = await message.interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`🎲 ${message.author.username}'s Blackjack Game`)
                    .setDescription(`Your hand (${showPoints(player)})\n${showHand(player)}\n\nDealer hand (${showPoints(dealer)})\n${showHand(dealer)}`)
                    .setThumbnail(message.interaction.user.avatarURL())
                    .setColor(`#801431`)
            ],
            components: [row],
            fetchReply: true,
        });

        const timeout = 120000;
        let endMessage;
        let playerWon = false;
        let doubleDown = false;

        const filter = (i) =>
            i.customId === buttonList[0].customId ||
            i.customId === buttonList[1].customId ||
            i.customId === buttonList[2].customId;

        const collector = await currentView.createMessageComponentCollector({
            filter,
            time: timeout,
        });

        collector.on("collect", async (i) => {
            await i.deferUpdate();
            switch (i.customId) {
                case `hit`:
                    player.hand.push(drawCard(deck));
                    updatePoints(player);

                    if (player.points > 21) {
                        // Player bust
                        endMessage = `PLAYER BUST`;
                        playerWon = false;
                        collector.stop();
                    } else if (player.points === 21 || player.altPoints === 21) {
                        // Player blackjack
                        endMessage = `PLAYER BLACKJACK`;
                        playerWon = true;
                        collector.stop();
                    } else {
                        await i.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`🎲 ${message.author.username}'s Blackjack Game`)
                                    .setDescription(`Your hand (${showPoints(player)})\n${showHand(player)}\n\nDealer hand (${showPoints(dealer)})\n${showHand(dealer)}`)
                                    .setThumbnail(message.interaction.user.avatarURL())
                                    .setColor(`#801431`)
                            ],
                            components: [row],
                        });
                    }
                    break;
                case `stay`:
                    // Dealer needs to hit until 17
                    while (dealer.points < 17 && dealer.altPoints < 17) {
                        dealer.hand.push(drawCard(deck));
                        updatePoints(dealer);
                    }

                    if (dealer.points > 21) {
                        // Dealer bust
                        endMessage = `DEALER BUST`;
                        playerWon = true;
                        collector.stop();
                    } else if (dealer.points === 21 || dealer.altPoints === 21) {
                        // Dealer blackjack
                        endMessage = `DEALER BLACKJACK`;
                        playerWon = false;
                        collector.stop();
                    } else if (distFrom21(player) > distFrom21(dealer)) {
                        // Player further from 21, lost
                        endMessage = `DEALER CLOSER TO 21`;
                        playerWon = false;
                        collector.stop();
                    } else if (distFrom21(player) < distFrom21(dealer)) {
                        // Player closer to 21, won
                        endMessage = `PLAYER CLOSER TO 21`;
                        playerWon = true;
                        collector.stop();
                    } else if (distFrom21(player) === distFrom21(dealer)) {
                        // Tie
                        endMessage = `TIED`;
                        collector.stop(`tie`);
                    } else {
                        global.logger.debug(`Reached end of else if for stay logic`);
                    }
                    break;
                case `double`:
                    player.hand.push(drawCard(deck));
                    updatePoints(player);
                    doubleDown = true;

                    // Check player first 
                    if (player.points > 21) {
                        // Player bust
                        endMessage = `PLAYER BUST`;
                        playerWon = false;
                        collector.stop();
                    } else if (player.points === 21 || player.altPoints === 21) {
                        // Player blackjack
                        endMessage = `PLAYER BLACKJACK`;
                        playerWon = true;
                        collector.stop();
                    }

                    // Use "stay" logic next
                    // Dealer needs to hit until 17
                    while (dealer.points < 17 && dealer.altPoints < 17) {
                        dealer.hand.push(drawCard(deck));
                        updatePoints(dealer);
                    }

                    if (dealer.points > 21) {
                        // Dealer bust
                        endMessage = `DEALER BUST`;
                        playerWon = true;
                        collector.stop();
                    } else if (dealer.points === 21 || dealer.altPoints === 21) {
                        // Dealer blackjack
                        endMessage = `DEALER BLACKJACK`;
                        playerWon = false;
                        collector.stop();
                    } else if (distFrom21(player) > distFrom21(dealer)) {
                        // Player further from 21, lost
                        endMessage = `DEALER CLOSER TO 21`;
                        playerWon = false;
                        collector.stop();
                    } else if (distFrom21(player) < distFrom21(dealer)) {
                        // Player closer to 21, won
                        endMessage = `PLAYER CLOSER TO 21`;
                        playerWon = true;
                        collector.stop();
                    }

                    break;
                default:
                    break;
            }
            collector.resetTimer();
        });

        collector.on("end", (_, reason) => {
            if (!currentView.deleted && reason !== "messageDelete") {
                const disabledRow = new MessageActionRow().addComponents(
                    buttonList[0].setDisabled(true),
                    buttonList[1].setDisabled(true),
                    buttonList[2].setDisabled(true)
                );

                if (playerWon && reason !== `tie`) {
                    if (doubleDown) {
                        message.client.currency.add(message.author.id, args.bet * 2);
                    } else {
                        message.client.currency.add(message.author.id, args.bet);
                    }
                } else if (reason !== `tie`) {
                    if (doubleDown) {
                        message.client.currency.add(message.author.id, -args.bet * 2);
                    } else {
                        message.client.currency.add(message.author.id, -args.bet);
                    }
                }

                if (reason !== `tie`) {
                    endMessage += `\n\nNew balance: \`$${message.client.currency.getBalance(message.author.id)}\``;
                }

                currentView.edit({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🎲 ${message.author.username}'s Blackjack Game`)
                            .setDescription(`**${endMessage || `FORFEITED GAME`}**\n\nYour hand (${showPoints(player)})\n${showHand(player)}\n\nDealer hand (${showPoints(dealer)})\n${showHand(dealer)}`)
                            .setThumbnail(message.interaction.user.avatarURL())
                            .setColor(`#801431`)
                    ],
                    components: [disabledRow],
                });
            }
        });
    }
}

module.exports = BlackjackCommand;