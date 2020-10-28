const index = require(`../../index.js`);
const { MessageEmbed } = require(`discord.js`);
const currency = index.getCurrencyDB();
// const config = require(`config`);
// Any 'require'

module.exports = {
    name: 'bail',
    description: 'Lol broke idiot lmao',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    cooldown: 300,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'currency',
    execute(message, args) {
        const userBal = currency.getBalance(message.author.id);

        if (userBal < 5000) {
            currency.add(message.author.id, 5000 - userBal);
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: You now have $5000`)
                .setColor(`#0083FF`));
        } else {
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: Use this command when you have less than $5000`)
                .setColor(`#0083FF`));
        }
    }
};