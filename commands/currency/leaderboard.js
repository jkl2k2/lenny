const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();
const client = index.getClient();

module.exports = {
    name: 'leaderboard',
    description: 'Shows the top 10 users sorted by current balance for the server',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'currency',
    execute(message, args) {
        return message.channel.send(new Discord.RichEmbed()
            .setDescription(`:medal: **Top 10 users by currency**\n\n` + currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.has(user.user_id) && message.guild.member(client.users.get(user.user_id)))
                .first(10)
                .map((user, position) => `\`${position + 1}.\` **${(client.users.get(user.user_id).username)}**\nBalance: \`$${user.balance}\`\n`)
                .join('\n'),
                { code: true })
            .setColor(`#1b9e56`));
        /*
        return message.channel.send(
            currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.has(user.user_id))
                .first(10)
                .map((user, position) => `(${position + 1}) ${(client.users.get(user.user_id).tag)}: $${user.balance}`)
                .join('\n'),
            { code: true }
        );
        */
    }
};