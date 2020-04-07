const index = require(`../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();

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
    for (var i = 0; i < user.hand.length; i++) {
        switch (user.hand[i].value) {
            case "K":
            case "Q":
            case "J":
                user.points += 10;
                break;
            case "A":
                user.points += 1;
                break;
            default:
                user.points += parseInt(user.hand[i].value);
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

async function awaitResponse(message, player, house, deck, bet, originalBalance) {

    updatePoints(player);
    var sent = await message.channel.send(new Discord.RichEmbed()
        .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\n__Your hand__ (${player.points} points)\n${showHand(player)}\n\n__House hand__ (${house.hand[0].value} + ? points)\n**[${house.hand[0].value}] [?]**\n\nHit or stay?\n**Dealer will hit until at least 17 if you stay**`)
        .setColor(`#801431`));

    const filter = m => m.author.id == message.author.id && m.content == "hit" || m.content == "stay" || m.content == "cancel";

    const collector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

    collector.on('collect', m => {
        if (m.content.toLowerCase() == "cancel") {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`Canceled the game`));
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
                    .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU WENT OVER 21**\n\n__Your hand__ (${player.points} points)\n${showHand(player)}\n\n__House hand__ (${house.points} points)\n**[${house.hand[0].value}] [${house.hand[1].value}]**`)
                    .setColor(`#801431`));

            } else if (player.points == 21) {

                // Player hits blackjack

                currency.add(message.author.id, bet);
                currency.add("0", -bet);

                message.channel.send(new Discord.RichEmbed()
                    .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU HIT BLACKJACK**\n\n__Your hand__ (${player.points} points)\n${showHand(player)}\n\n__House hand__ (${house.points} points)\n**[${house.hand[0].value}] [${house.hand[1].value}]**`)
                    .setColor(`#801431`));

            } else {
                return awaitResponse(message, player, house, deck, bet, originalBalance);
            }
        }

        if (m.content.toLowerCase() == "stay") {
            sent.delete();
            updatePoints(house);
            while (house.points < 17) {
                house.hand.push(drawCard(deck));
                updatePoints(house);
            }
            if (house.points > 21) {

                // House bust

                currency.add(message.author.id, bet);
                currency.add("0", -bet);

                message.channel.send(new Discord.RichEmbed()
                    .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE BUST**\n\n__Your hand__ (${player.points} points)\n${showHand(player)}\n\n__House hand__ (${house.points} points)\n${showHand(house)}`)
                    .setColor(`#801431`));

            } else if (house.points == 21) {

                // House blackjack

                currency.add(message.author.id, -bet);
                currency.add("0", bet);

                message.channel.send(new Discord.RichEmbed()
                    .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE CLOSER TO 21**\n\n__Your hand__ (${player.points} points)\n${showHand(player)}\n\n__House hand__ (${house.points} points)\n${showHand(house)}`)
                    .setColor(`#801431`));

            } else if (player.points < house.points) {

                // House closer to 21

                currency.add(message.author.id, -bet);
                currency.add("0", bet);

                message.channel.send(new Discord.RichEmbed()
                    .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nSorry, ${message.author.username}. You **lost** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**HOUSE CLOSER TO 21**\n\n__Your hand__ (${player.points} points)\n${showHand(player)}\n\n__House hand__ (${house.points} points)\n${showHand(house)}`)
                    .setColor(`#801431`));

            } else if (player.points > house.points) {

                // Player closer to 21

                currency.add(message.author.id, bet);
                currency.add("0", -bet);

                message.channel.send(new Discord.RichEmbed()
                    .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**YOU'RE CLOSER TO 21**\n\n__Your hand__ (${player.points} points)\n${showHand(player)}\n\n__House hand__ (${house.points} points)\n${showHand(house)}`)
                    .setColor(`#801431`));

            } else if (player.points == house.points) {

                // Tie
                message.channel.send(new Discord.RichEmbed()
                    .setDescription(`:game_die: **${message.author.username}'s Blackjack Game**\n\nYou tied, ${message.author.username}. Returned your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**\n\n**GAME TIED**\n\n__Your hand__ (${player.points} points)\n${showHand(player)}\n\n__House hand__ (${house.points} points)\n${showHand(house)}`)
                    .setColor(`#801431`));

            } else {
                message.channel.send(`Catch. (You shouldn't see this ever)`);
            }
        }
    });
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
    execute(message, args) {
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

        var player = { hand: playerHand, points: (playerHand[0].value + playerHand[1].value) };
        var house = { hand: houseHand, points: (houseHand[0].value + houseHand[1].value) };

        awaitResponse(message, player, house, deck, parseInt(args[0]), originalBalance);
    }
};