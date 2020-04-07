const index = require(`../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();

module.exports = {
    name: 'balance',
    description: 'Displays your current balance',
    aliases: ['bal'],
    // args: true,
    usage: '[(optional) tag a user]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        return message.channel.send(new Discord.RichEmbed()
            .setDescription(`:moneybag: ${target.username}, you have **$${currency.getBalance(target.id)}**`)
            .setColor(`#1b9e56`));
        // return message.channel.send(`${target.tag} has $${currency.getBalance(target.id)}`);
    }
};