const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();

module.exports = {
    name: 'flip',
    description: 'A simple coin flip: Heads to win double your bet, tails to lose your bet.',
    aliases: ['coin', 'coinflip', 'flipcoin'],
    args: true,
    usage: '[amount to bet]',
    cooldown: 5,
    // guildOnly: true,
    enabled: true,
    type: 'currency',
    execute(message, args) {
        if (message.channel.id == "471193210102743042") return;

        var rand = Math.floor(Math.random() * 2) + 1;

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

        if (rand == 1) {
            // Loss

            // Deduct loss from account
            currency.add(message.author.id, -parseInt(args[0]));

            // Add to casino profits
            currency.add("0", parseInt(args[0]));

            // Loss message
            message.channel.send(new Discord.RichEmbed()
                .setDescription(`:game_die: You flipped: \`Tails\`\n\nSorry, ${message.author.username}! You **lost** your bet of **$${args[0]}**.\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                .setColor(`#801431`));
        } else {
            // Win

            // Add winnings to account
            currency.add(message.author.id, parseInt(args[0]));

            // Deduct from casino profits
            currency.add("0", -parseInt(args[0]));

            // Win message
            message.channel.send(new Discord.RichEmbed()
                .setDescription(`:game_die: You flipped: \`Heads\`\n\nCongrats, ${message.author.username}! You **won** your bet of **$${args[0]}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                .setColor(`#801431`));
        }
    }
};