const index = require(`../../index.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();

module.exports = {
    name: 'buy',
    description: 'Template command for easier coding, does nothing',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    type: 'currency',
    async execute(message, args) {
        const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: args } } });
        if (!item) return message.channel.send(`That item doesn't exist.`);
        if (item.cost > currency.getBalance(message.author.id)) {
            return message.channel.send(`You currently have ${currency.getBalance(message.author.id)}, but the ${item.name} costs ${item.cost}!`);
        }

        const user = await Users.findOne({ where: { user_id: message.author.id } });
        currency.add(message.author.id, -item.cost);
        await user.addItem(item);

        message.channel.send(`You've bought: ${item.name}.`);
    }
};