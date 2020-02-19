const config = require('config');
const index = require(`../index.js`);
const prefix = config.get(`Bot.prefix`);
const Discord = require(`discord.js`);

module.exports = {
    name: 'help',
    description: 'List all bot commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    guildsOnly: false,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;
        var client = index.getClient;

        if (!args.length) {
            var generalHelp = new Discord.RichEmbed();

            // data.push('Here\'s a list of all my commands:');
            // data.push(commands.map(command => command.name).join(', '));
            generalHelp.addField(`**Playback control**`, `play\nplaynext\nsearch\nskip\nskipall\njoin\nleave\npause\nresume\nvolume`, true);
            generalHelp.addField(`**Queue control**`, `queue\nremove\nmove\nshuffle`, true);
            generalHelp.addField(`**Music information**`, `playing\nnext\nfindvideo`, true);
            generalHelp.addField(`**Fun commands**`, `say\nlenny`, true);
            generalHelp.addField(`**System commands**`, `ping`, true)

            // data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
            generalHelp.setAuthor(`Use ${prefix}help [command name] to get info on a specific command`, `https://cdn.discordapp.com/app-icons/641137495886528513/35676b341ed8ba268e5fff9dcc5c570e.png?size=256`);

            /*
            return message.author.send(generalHelp)
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
            */

            return message.channel.send(generalHelp);

            /*
            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
            */
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        var commandHelp = new Discord.RichEmbed();
        commandHelp ;

        // data.push(`**Name:** ${command.name}`);
        commandHelp.setAuthor(config.get(`Bot.prefix`) + command.name, `https://cdn.discordapp.com/app-icons/641137495886528513/35676b341ed8ba268e5fff9dcc5c570e.png?size=256`);

        // if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.aliases) commandHelp.addField(`**Aliases**`, command.aliases.join(', '));

        // if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.description) commandHelp.addField(`**Description**`, command.description);

        // if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
        if (command.usage) commandHelp.addField(`**Usage**`, `${prefix}${command.name} ${command.usage}`);

        if (command.guildOnly) commandHelp.addField(`**Servers only**`, `Only usable in servers, not DMs`);

        if (!command.guildOnly) commandHelp.addField(`**Servers or DMs**`, `Usable in both servers and bot's DMs`);

        // data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
        commandHelp.addField(`**Cooldown**`, `${command.cooldown || 3} second(s)`);

        // message.channel.send(data, { split: true });
        message.channel.send(commandHelp);
    },
};