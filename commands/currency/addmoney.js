const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);
const jahyID = config.get(`Users.jahyID`);

module.exports = {
    name: 'addmoney',
    description: 'Admin command to force add money to a user',
    // aliases: ['aliases'],
    args: true,
    usage: '[@ target user] [amount]',
    altUsage: '[amount] [@ target user]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'currency',
    execute(message, args) {
        if (message.author.id != ownerID && message.author.id != jahyID) {
            return;
        }

        const currentAmount = 1000000000000000;
        const transferAmount = args.find(arg => !/<@!?\d+>/g.test(arg));
        const transferTarget = message.mentions.users.first();

        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Sorry ${message.author.username}, that's an invalid amount.`)
            .setColor(`#FF0000`));
        if (transferAmount > currentAmount) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Sorry ${message.author.username}, you only have **$${currentAmount}**.`)
            .setColor(`#FF0000`));
        /*
        if (transferAmount <= 0) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Please enter an amount greater than zero, ${message.author.username}.`)
            .setColor(`#FF0000`));
        */

        currency.add(transferTarget.id, transferAmount);

        return message.channel.send(new Discord.RichEmbed()
            .setDescription(`:money_with_wings: Successfully transferred $${transferAmount} to ${transferTarget.tag}.`)
            .setColor(`#1b9e56`));
    }
};