const index = require(`../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();
const client = index.getClient();
const Queues = index.getQueues();

module.exports = {
    name: 'testing',
    description: 'Testing',
    aliases: ['t'],
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    execute(message, args) {
        // message.channel.send(client.voiceConnections.get(message.guild.id).channel.id);
        if (Queues.get(message.guild.id)) {
            var str = "";
            for (var i = 0; i < Queues.get(message.guild.id).length; i++) {
                str += Queues.get(message.guild.id)[i].getTitle();
                str += "\n";
            }
            message.channel.send(str);
        } else {
            message.channel.send("Server's queue empty");
        }
    }
};