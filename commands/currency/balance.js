const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();
const client = index.getClient();
const logger = index.getLogger();

module.exports = {
    name: 'balance',
    description: 'Displays your current balance',
    aliases: ['bal', 'wallet'],
    // args: true,
    usage: '[(optional) tag a user]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    type: 'currency',
    execute(message, args) {
        const target = message.mentions.users.first() || message.author;

        if (message.guild) {
            var rank;

            var list = currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.has(user.user_id) && message.guild.member(client.users.cache.get(user.user_id)))
                .array();

            for (var i = 0; i < list.length; i++) {
                var id = list[i].user_id;
                if (message.author.id == id) {
                    rank = i + 1;
                }
            }

            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:moneybag: ${target} has \`$${currency.getBalance(target.id)}\`\n\n:information_source: Ranked \`#${rank}\` in \`${message.guild.name}\``)
                .setColor(`#2EC14E`));
        } else {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:moneybag: ${target} has \`$${currency.getBalance(target.id)}\``)
                .setColor(`#2EC14E`));
        }
    }
};