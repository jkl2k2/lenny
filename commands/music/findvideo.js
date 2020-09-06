const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require('config');
const api = config.get(`Bot.api`);
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(api);

module.exports = {
    name: 'findvideo',
    description: 'Searches YouTube with the provided search terms, then returns the best match',
    args: true,
    aliases: ['find', 'yt'],
    usage: '[search term(s)]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    async execute(message, args) {
        youtube.searchVideos(args.join(), 1)
            .then(videos => {
                if (videos[0] != undefined && args.length >= 1) {
                    message.channel.send(`**Best match:**\n${videos[0].url}`);
                } else if (args.length == 0) {
                    let noArgsSearchEmbed = new Discord.MessageEmbed()
                        .setTitle(`<:cross:729019052571492434> **${message.author.username}, you need to provide search terms**`)
                        .setColor(`#FF3838`);
                    message.channel.send(noArgsSearchEmbed);
                } else {
                    message.channel.send(new Discord.MessageEmbed()
                        .addField(`<:cross:729019052571492434> **Sorry, ${message.author.username}, I couldn't find any videos with those search terms**`, `Please try again with different search terms`)
                        .setColor(`#FF3838`));
                }
            });
    }
};