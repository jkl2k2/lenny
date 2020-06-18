const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const { loggers } = require('winston');
const currency = index.getCurrencyDB();

var sent;

function createDeck() {
    var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
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
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function drawCard(deck) {
    return deck.pop();
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

function showHand(user) {
    var str = ``;
    for (var i = 0; i < user.hand.length; i++) {
        str += `**[${user.hand[i].value}]**`;
        if (i != user.hand.length - 1) {
            str += ` `;
        }
    }
    return str;
}

function showPoints(user) {
    if (user.points != user.altPoints) {
        return `${user.points} / ${user.altPoints} points`;
    } else if (user.points == user.altPoints) {
        return `${user.points} points`;
    }
}

async function awaitResponse(message, player, house, deck, bet, originalBalance, resend) {

    updatePoints(player);
    updatePoints(house);
    if (resend) {
        sent = await message.channel.send(new Discord.RichEmbed()
            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${house.hand[0].value} + ? points)\n**[${house.hand[0].value}] [?]**\n\nHit, stay, or double?\n**Dealer will hit until at least 17**`)
            .setColor(`#801431`)
            .setThumbnail(message.author.avatarURL));
    }

    if (player.altPoints == 21) {

        // Player hits natural blackjack

        currency.add(message.author.id, bet);
        currency.add("0", -bet);

        sent.delete();

        message.channel.send(new Discord.RichEmbed()
            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU HIT A NATURAL BLACKJACK**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
            .setColor(`#801431`)
            .setThumbnail(message.author.avatarURL));

    } else if (player.points > 21) {

        // Player naturally busts, but returns bet
        // Should hopefully no longer happen?

        sent.delete();

        message.channel.send(new Discord.RichEmbed()
            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\n${message.author.username}, I returned your bet of **$${bet}**\n\n**Got two aces, but my medicore programming only has aces count as 11, so in the meantime I've returned your money**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
            .setColor(`#801431`)
            .setThumbnail(message.author.avatarURL));

    } else if (house.altPoints == 21) {

        // House hits natural blackjack
        // Confirmed working

        currency.add(message.author.id, -bet);
        currency.add("0", bet);

        sent.delete();

        message.channel.send(new Discord.RichEmbed()
            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE HIT NATURAL BLACKJACK**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
            .setColor(`#801431`)
            .setThumbnail(message.author.avatarURL));

    } else {

        const filter = m => m.author.id == message.author.id && (m.content == "hit" || m.content == "stay" || m.content == "double" || m.content == "cancel" || m.content.includes("!blackjack") || m.content.includes("!bj"));

        const collector = message.channel.createMessageCollector(filter, { time: 600000, max: 1 });

        collector.on('collect', m => {

            // console.log("Collection passed filter");

            if (m.content.toLowerCase() == "cancel") {
                return message.channel.send(new Discord.RichEmbed()
                    .setDescription(`Canceled the game`));
            }

            if (m.content.toLowerCase().includes("!blackjack") || m.content.toLowerCase().includes("!bj")) {
                // Player accidentally starts another blackjack game

                /*
                return message.channel.send(new Discord.RichEmbed()
                    .setDescription(`<:error:643341473772863508> **You already had a game of blackjack going, ${message.author.username}, but since you started another one I canceled the original game**`)
                    .setColor(`#FF0000`));
                */
                return;
            }

            if (m.content.toLowerCase() == "double") {

                // Check if able to double bet
                if (originalBalance < bet * 2) {
                    sent.delete();
                    message.channel.send(new Discord.RichEmbed()
                        .setDescription(`<:error:643341473772863508> Sorry, ${message.author.username}, but your balance is too low to double down`)
                        .setColor(`#FF0000`));
                    return awaitResponse(message, player, house, deck, bet, originalBalance, true);
                }

                // Double bet
                bet *= 2;

                // Simulate last hit
                player.hand.push(drawCard(deck));
                updatePoints(player);
                updatePoints(house);
                if (player.points > 21) {
                    sent.delete();
                    // Player bust

                    currency.add(message.author.id, -bet);
                    currency.add("0", bet);

                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU WENT OVER 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));

                } else if (player.points == 21 || player.altPoints == 21) {
                    sent.delete();
                    // Player hits blackjack

                    currency.add(message.author.id, bet);
                    currency.add("0", -bet);

                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU HIT BLACKJACK**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));

                }

                // Begin behavior similar to "stay"
                while (house.points < 17 && house.altPoints < 17) {
                    house.hand.push(drawCard(deck));
                    updatePoints(house);
                }
                if (house.points > 21) {
                    sent.delete();
                    // House bust
                    // Confirmed working

                    currency.add(message.author.id, bet);
                    currency.add("0", -bet);

                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE BUST**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));

                } else if (house.points == 21 || house.altPoints == 21) {
                    sent.delete();
                    // House blackjack
                    // Confirmed working

                    currency.add(message.author.id, -bet);
                    currency.add("0", bet);

                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE HIT BLACKJACK**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));
                } else if (player.points == house.points || player.altPoints == house.altPoints) {
                    sent.delete();
                    // Tie
                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nYou tied, ${message.author.username}. Returned your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**GAME TIED**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));

                } else if (player.points < house.points) {
                    sent.delete();
                    // House seemingly closer to 21

                    if ((player.altPoints < 21 && player.altPoints > house.points) && (house.altPoints < 21 && player.altPoints > house.altPoints)) {

                        // Player alt score causes win
                        // Confirmed working?

                        currency.add(message.author.id, bet);
                        currency.add("0", -bet);

                        return message.channel.send(new Discord.RichEmbed()
                            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU'RE CLOSER TO 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                            .setColor(`#801431`)
                            .setThumbnail(message.author.avatarURL));

                    } else {

                        // House truly closer to 21
                        // Confirmed working?

                        currency.add(message.author.id, -bet);
                        currency.add("0", bet);

                        return message.channel.send(new Discord.RichEmbed()
                            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE CLOSER TO 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                            .setColor(`#801431`)
                            .setThumbnail(message.author.avatarURL));

                    }

                } else if (player.points > house.points) {
                    sent.delete();
                    // Player seemingly closer to 21

                    if ((house.altPoints < 21 && house.altPoints > player.points) && (player.altPoints < 21 && house.altPoints > player.altPoints)) {

                        // House alt score causes win

                        currency.add(message.author.id, -bet);
                        currency.add("0", bet);

                        return message.channel.send(new Discord.RichEmbed()
                            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE CLOSER TO 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                            .setColor(`#801431`)
                            .setThumbnail(message.author.avatarURL));

                    } else {

                        // Player truly closer to 21
                        // Confirmed working?

                        currency.add(message.author.id, bet);
                        currency.add("0", -bet);

                        return message.channel.send(new Discord.RichEmbed()
                            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU'RE CLOSER TO 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                            .setColor(`#801431`)
                            .setThumbnail(message.author.avatarURL));

                    }

                } else {

                    // Catch

                    currency.add(message.author.id, bet);
                    currency.add("0", -bet);

                    return message.channel.send(`Hey ${message.author.username}, this is a catch-all statement that you should never see. But, since apparently you ARE seeing this and cat is utterly incompetent at programming and somehow managed to screw up checking points for a simple blackjack game, I'll just pretend you won your bet of **$${bet}**.\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\nHELLO THIS IS CAT FROM 1:47 AM. I HAVE BEEN HUNTING THE CAUSE OF THIS FOR THE PAST 45 MINUTES AND I CAN'T FIND IT PLEASE @ ME WHEN THIS HAPPENS SO I CAN ANALYZE YOUR GAME'S RESULTS THANKS.`);
                }
            }

            if (m.content.toLowerCase() == "hit") {
                sent.delete();
                player.hand.push(drawCard(deck));
                updatePoints(player);
                updatePoints(house);
                if (player.points > 21) {

                    // Player bust

                    currency.add(message.author.id, -bet);
                    currency.add("0", bet);

                    message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU WENT OVER 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));

                } else if (player.points == 21 || player.altPoints == 21) {

                    // Player hits blackjack

                    currency.add(message.author.id, bet);
                    currency.add("0", -bet);

                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU HIT BLACKJACK**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));

                } else {
                    return awaitResponse(message, player, house, deck, bet, originalBalance, true);
                }
            }

            if (m.content.toLowerCase() == "stay") {
                // sent.delete();
                updatePoints(house);
                while (house.points < 17 && house.altPoints < 17) {
                    house.hand.push(drawCard(deck));
                    updatePoints(house);
                }
                if (house.points > 21) {
                    sent.delete();
                    // House bust
                    // Confirmed working

                    currency.add(message.author.id, bet);
                    currency.add("0", -bet);

                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE BUST**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));

                } else if (house.points == 21 || house.altPoints == 21) {
                    sent.delete();
                    // House blackjack
                    // Confirmed working

                    currency.add(message.author.id, -bet);
                    currency.add("0", bet);

                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE HIT BLACKJACK**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));
                } else if (player.points == house.points || player.altPoints == house.altPoints) {
                    sent.delete();
                    // Tie
                    return message.channel.send(new Discord.RichEmbed()
                        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nYou tied, ${message.author.username}. Returned your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**GAME TIED**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL));

                } else if (player.points < house.points) {
                    sent.delete();
                    // House seemingly closer to 21

                    if ((player.altPoints < 21 && player.altPoints > house.points) && (house.altPoints < 21 && player.altPoints > house.altPoints)) {

                        // Player alt score causes win
                        // Confirmed working?

                        currency.add(message.author.id, bet);
                        currency.add("0", -bet);

                        return message.channel.send(new Discord.RichEmbed()
                            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU'RE CLOSER TO 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                            .setColor(`#801431`)
                            .setThumbnail(message.author.avatarURL));

                    } else {

                        // House truly closer to 21
                        // Confirmed working?

                        currency.add(message.author.id, -bet);
                        currency.add("0", bet);

                        return message.channel.send(new Discord.RichEmbed()
                            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE CLOSER TO 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                            .setColor(`#801431`)
                            .setThumbnail(message.author.avatarURL));

                    }

                } else if (player.points > house.points) {
                    sent.delete();
                    // Player seemingly closer to 21

                    if ((house.altPoints < 21 && house.altPoints > player.points) && (player.altPoints < 21 && house.altPoints > player.altPoints)) {

                        // House alt score causes win

                        currency.add(message.author.id, -bet);
                        currency.add("0", bet);

                        return message.channel.send(new Discord.RichEmbed()
                            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE CLOSER TO 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                            .setColor(`#801431`)
                            .setThumbnail(message.author.avatarURL));

                    } else {

                        // Player truly closer to 21
                        // Confirmed working?

                        currency.add(message.author.id, bet);
                        currency.add("0", -bet);

                        return message.channel.send(new Discord.RichEmbed()
                            .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU'RE CLOSER TO 21**\n\n__Your hand__ (${showPoints(player)})\n${showHand(player)}\n\n__House hand__ (${showPoints(house)})\n${showHand(house)}`)
                            .setColor(`#801431`)
                            .setThumbnail(message.author.avatarURL));

                    }

                } else {

                    // Catch

                    currency.add(message.author.id, bet);
                    currency.add("0", -bet);

                    return message.channel.send(`Hey ${message.author.username}, this is a catch-all statement that you should never see. But, since apparently you ARE seeing this and cat is utterly incompetent at programming and somehow managed to screw up checking points for a simple blackjack game, I'll just pretend you won your bet of **$${bet}**.\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\nHELLO THIS IS CAT FROM 1:47 AM. I HAVE BEEN HUNTING THE CAUSE OF THIS FOR THE PAST 45 MINUTES AND I CAN'T FIND IT PLEASE @ ME WHEN THIS HAPPENS SO I CAN ANALYZE YOUR GAME'S RESULTS THANKS.`);
                }
            }
        });
        collector.on('end', collected => {
            /*
            var m = collected[0];
            console.log(`Collector ended`);
            if ((m.content != "hit" && m.content != "stay" && m.content != "double" && m.content != "cancel" && !m.content.includes("!blackjack") && !m.content.includes("!bj"))) {
                console.log("Restarting collector");
                return awaitResponse(message, player, house, deck, bet, originalBalance);
            }
            */
            if (collected.size == 0) {
                return awaitResponse(message, player, house, deck, bet, originalBalance, false);
            }
        });
    }
}

module.exports = {
    name: 'blackjack',
    description: 'Play blackjack! Interact by typing "hit" or "stay" when prompted.',
    aliases: ['bj'],
    args: true,
    usage: '[amount to bet]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    type: 'currency',
    execute(message, args) {
        if (message.channel.id == "471193210102743042") return;

        var originalBalance = currency.getBalance(message.author.id);

        if (args[0] == "coosin" || args[0] == "collin" || args[0] == "cucino") {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Sorry, we do not accept trash as a currency for betting.`)
                .setColor(`#FF0000`));
        }

        if (isNaN(args[0])) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Please input a number to bet`)
                .setColor(`#FF0000`));
        }

        if (parseInt(args[0]) == 0) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Please bet more than $0`)
                .setColor(`#FF0000`));
        }

        if (parseInt((args[0]) < 1 && parseInt(args[0]) > 0) || (Math.floor(args[0]) != args[0])) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Please input a whole number, not a decimal`)
                .setColor(`#FF0000`));
        }

        if (parseInt(args[0]) < 0) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Please input a positive number`)
                .setColor(`#FF0000`));
        }

        if (originalBalance < args[0]) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription("<:error:643341473772863508> Sorry, you do not have enough money to bet that amount")
                .setColor(`#FF0000`));
        }

        var deck = shuffle(createDeck());

        var playerHand = [drawCard(deck), drawCard(deck)];
        var houseHand = [drawCard(deck), drawCard(deck)];

        var player = { hand: playerHand, points: (playerHand[0].value + playerHand[1].value), altPoints: 0 };
        var house = { hand: houseHand, points: (houseHand[0].value + houseHand[1].value), altPoints: 0 };

        awaitResponse(message, player, house, deck, parseInt(args[0]), originalBalance, true);
    }
};