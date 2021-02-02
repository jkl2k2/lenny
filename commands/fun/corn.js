const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const CSE_ID = config.get(`Bot.CSE_ID`);
const api = config.get(`Bot.api`);
const GoogleImages = require(`google-images`);
const images = new GoogleImages(CSE_ID, api);

module.exports = {
    name: 'corn',
    description: 'corn',
    // aliases: ['aliases'],
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
                images.search('corn')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#FCF403`)
                            .setDescription(`OwO what's this?`));
                    });
                break;
            case 1:
                images.search('buttery corn')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#FCF403`)
                            .setDescription(`OwO what's this?`));
                    });
                break;
            case 2:
                images.search('steamy corn')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#FCF403`)
                            .setDescription(`OwO what's this?`));
                    });
                break;
            case 3:
                images.search('delicious corn')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#FCF403`)
                            .setDescription(`OwO what's this?`));
                    });
                break;
            case 4:
                images.search('HD corn')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#FCF403`)
                            .setDescription(`OwO what's this?`));
                    });
                break;
            case 5:
                images.search('fresh and steamy corn')
                    .then(images => {
                        message.channel.send(new Discord.MessageEmbed()
                            .setImage(images[pictureChoice].url)
                            .setColor(`#FCF403`)
                            .setDescription(`OwO what's this?`));
                    });
        }
    }
};