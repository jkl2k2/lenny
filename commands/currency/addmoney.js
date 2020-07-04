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
    restrictions: {
        id: [ownerID, jahyID]
    },
    type: 'currency',
    execute(message, args) {

        const currentAmount = 1000000000000000;
        const transferAmount = args.find(arg => !/<@!?\d+>/g.test(arg));
        const transferTarget = message.mentions.users.first();

        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:cross:729019052571492434> Sorry ${message.author.username}, that's an invalid amount.`)
            .setColor(`#FF3838`));
        if (transferAmount > currentAmount) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:cross:729019052571492434> Sorry ${message.author.username}, you only have **$${currentAmount}**.`)
            .setColor(`#FF3838`));
        /*
        if (transferAmount <= 0) return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:cross:729019052571492434> Please enter an amount greater than zero, ${message.author.username}.`)
            .setColor(`#FF3838`));
        */

        currency.add(transferTarget.id, transferAmount);

        return message.channel.send(new Discord.RichEmbed()
            .setDescription(`:money_with_wings: Successfully transferred $${transferAmount} to ${transferTarget.tag}.`)
            .setColor(`#2EC14E`));
    }
};