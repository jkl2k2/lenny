const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const fs = require('fs');
const logger = index.getLogger();

module.exports = {
    name: 'ligma',
    description: 'Manage the ligma list',
    // aliases: ['aliases'],
    usage: '[add/remove/view] [ID/mention]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'admin',
    execute(message, args) {

    }
};