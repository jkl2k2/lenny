const index = require(`../index.js`);
const Discord = require(`discord.js`)
const config = require('config');
const api = config.get(`Bot.api`);
const { YouTube } = require('better-youtube-api');
const youtube = new YouTube(api);

module.exports = {
    name: 'findvideo',
    description: 'Searches YouTube with the provided search terms, then returns the best match',
    aliases: ['find'],
    usage: '[search term(s)]',
    // cooldown: 5,
    guildOnly: true,
    async execute(message, args) {
        var manualVideoSearch = await youtube.searchVideos(args.join()).catch(function (error) {
            console.error(`${error}\nTimestamp of error: ${timestamp('MM-DD-YYYY hh:mm:ss')}`);
        });
        if (manualVideoSearch[0] != undefined && args.length >= 1) {
            message.channel.send(`**Best match:**\n${manualVideoSearch[0].url}`);
        } else if (args.length == 0) {
            let noArgsSearchEmbed = new Discord.RichEmbed()
                .setTitle(`:no_entry: **${message.author.username}, you need to provide search terms**`)
                .setColor(`#FF0000`)
            message.channel.send(noArgsSearchEmbed);
        } else {
            let searchFailEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`:no_entry: **Sorry, ${message.author.username}, I couldn't find any videos with those search terms**`, `Please try again with different search terms`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.username}`)
                .setColor(`#FF0000`)
            message.channel.send(searchFailEmbed);
        }
    }
}