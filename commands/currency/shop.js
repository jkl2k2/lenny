const index = require(`../../index.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();

module.exports = {
    name: 'shop',
    description: 'Template command for easier coding, does nothing',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    type: 'currency',
    async execute(message, args) {
        return;
        const items = await CurrencyShop.findAll();
        return message.channel.send(items.map(item => `${item.name}: ${item.cost}💰`).join('\n'), { code: true });
    }
};