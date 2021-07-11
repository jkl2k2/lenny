const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const api = process.env.API1;
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class FindVideoCommand extends Command {
    constructor() {
        super(`findvideo`, {
            aliases: [`findvideo`, `find`, `yt`],
            args: [
                {
                    id: `searchInput`,
                    match: `content`
                }
            ],
            category: `music`,
            description: `Searches YouTube with the provided search terms, then returns the first result`,
        });
    }

    exec(message, args) {
        youtube.searchVideos(args.searchInput, 1)
            .then(videos => {
                if (videos[0] != undefined && args.searchInput.length >= 1) {
                    message.channel.send(`**Best match:**\n${videos[0].url}`);
                } else if (args.length == 0) {
                    message.channel.send(new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> **${message.author.username}, you need to provide search terms**`)
                        .setColor(`#FF3838`));
                } else {
                    message.channel.send(new MessageEmbed()
                        .addField(`<:cross:729019052571492434> **Sorry, ${message.author.username}, I couldn't find any videos with those search terms**`, `Please try again with different search terms`)
                        .setColor(`#FF3838`));
                }
            });
    }
}

module.exports = FindVideoCommand;