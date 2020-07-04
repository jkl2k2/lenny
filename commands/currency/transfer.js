const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();

module.exports = {
    name: 'transfer',
    description: 'Lets you give money from your balance to any user that you tag',
    aliases: ['give'],
    args: true,
    usage: '[@ target user] [amount]',
    altUsage: '[amount] [@ target user]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'currency',
    execute(message, args) {
        const currentAmount = currency.getBalance(message.author.id);
        const transferAmount = args.find(arg => !/<@!?\d+>/g.test(arg));
        const transferTarget = message.mentions.users.first();

        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:cross:728885860623319120> Sorry ${message.author.username}, that's an invalid amount.`)
            .setColor(`#FF0000`));
        if (transferAmount > currentAmount) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:cross:728885860623319120> Sorry ${message.author.username}, you only have **$${currentAmount}**.`)
            .setColor(`#FF0000`));
        if (transferAmount <= 0) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:cross:728885860623319120> Please enter an amount greater than zero, ${message.author.username}.`)
            .setColor(`#FF0000`));

        var originalBalance = currency.getBalance(message.author.id);

        currency.add(message.author.id, -transferAmount);
        currency.add(transferTarget.id, transferAmount);

        return message.channel.send(new Discord.RichEmbed()
            .setDescription(`:money_with_wings: Successfully transferred $${transferAmount} to ${transferTarget.tag}.\n\nYour previous balance: **$${originalBalance}**\nYour new balance: **$${currency.getBalance(message.author.id)}**`)
            .setColor(`#2EC14E`));
    }
};