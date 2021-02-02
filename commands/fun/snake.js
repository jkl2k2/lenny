const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const CSE_ID = config.get(`Bot.CSE_ID`);
const api = config.get(`Bot.api`);
const GoogleImages = require(`google-images`);
const images = new GoogleImages(CSE_ID, api);

module.exports = {
    name: 'snake',
    description: 'snakes',
    aliases: ['snek'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    type: 'fun',
    async execute(message, args) {
        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        }

        var queryChoice = getRandomInt(6);
        var pictureChoice = getRandomInt(10);

        switch (queryChoice) {
            default:
                images.search('pet snake')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#2da84e`)
                            .setDescription(`🐍🐍🐍`));
                    });
                break;
            case 1:
                images.search('cute snake images')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#2da84e`)
                            .setDescription(`🐍🐍🐍`));
                    });
                break;
            case 2:
                images.search('cute pet snake')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#2da84e`)
                            .setDescription(`🐍🐍🐍`));
                    });
                break;
            case 3:
                images.search('small cute snake')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#2da84e`)
                            .setDescription(`🐍🐍🐍`));
                    });
                break;
            case 4:
                images.search('HD cute snake image')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#2da84e`)
                            .setDescription(`🐍🐍🐍`));
                    });
                break;
            case 5:
                images.search('very cute pet snake image')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#2da84e`)
                            .setDescription(`🐍🐍🐍`));
                    });
        }
    }
};