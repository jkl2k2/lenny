const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require('config');
const api = config.get(`Bot.api2`);
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(api);

module.exports = {
    name: 'findvideo',
    description: 'Searches YouTube with the provided search terms, then returns the best match',
    args: true,
    aliases: ['find'],
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
                    let noArgsSearchEmbed = new Discord.RichEmbed()
                        .setTitle(`<:cross:728885860623319120> **${message.author.username}, you need to provide search terms**`)
                        .setColor(`#FF0000`);
                    message.channel.send(noArgsSearchEmbed);
                } else {
                    message.channel.send(new Discord.RichEmbed()
                        .addField(`<:cross:728885860623319120> **Sorry, ${message.author.username}, I couldn't find any videos with those search terms**`, `Please try again with different search terms`)
                        .setColor(`#FF0000`));
                }
            });
    }
};