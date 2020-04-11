const index = require(`../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();

module.exports = {
    name: 'testing',
    description: 'Testing',
    aliases: ['t'],
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    execute(message, args) {
        currency.add(0, 10);
        message.channel.send(currency.getBalance(0));
    }
};