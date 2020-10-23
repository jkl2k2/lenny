const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const currency = index.getCurrencyDB();

module.exports = {
    name: 'leaderboard',
    description: 'Shows the top 10 users sorted by current balance for the server',
    aliases: ['board'],
    // args: true,
    // usage: '[command]',
    cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'currency',
    execute(message, args) {
        const client = message.client;
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle(`:medal: Top 10 richest users`)
            .setDescription(`\u200b`)
            .addField(`:desktop: ${message.guild.name}'s Leaderboard`, currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.has(user.user_id) && message.guild.member(client.users.cache.get(user.user_id)))
                .first(10)
                .map((user, position) => `\`${position + 1}.\` **${(client.users.cache.get(user.user_id).username)}**\nBalance: \`$${user.balance}\`\n`)
                .join('\n'),
                true)
            .addField('\u200b', '\u200b', true)
            .addField(`:earth_americas: Global Leaderboard`, currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.has(user.user_id))
                .first(10)
                .map((user, position) => `\`${position + 1}.\` **${(client.users.cache.get(user.user_id).username)}**\nBalance: \`$${user.balance}\`\n`)
                .join('\n'),
                true)
            .setColor(`#1b9e56`));
    }
};