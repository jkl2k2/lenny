const index = require(`../index.js`);
const { Users, CurrencyShop } = require('../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();

module.exports = {
    name: 'inventory',
    description: 'Template command for easier coding, does nothing',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const user = await Users.findOne({ where: { user_id: target.id } });
        const items = await user.getItems();

        if (!items.length) return message.channel.send(`${target.tag} has nothing!`);
        return message.channel.send(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);

    }
};