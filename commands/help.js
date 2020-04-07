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
    enabled: true,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;
        var client = index.getClient();

        if (!args.length) {
            var generalHelp = new Discord.RichEmbed();

            // data.push('Here\'s a list of all my commands:');
            // data.push(commands.map(command => command.name).join(', '));
            generalHelp.addField(`**Playback control**`, `play\nplaynext\nplaynow\nsearch\nskip\nskipall\njoin\nleave\npause\nresume`, true);
            generalHelp.addField(`**Volume control**`, `volume\nmute\nunmute`, true);
            generalHelp.addField(`**Queue control**`, `queue\nremove\nmove\nshuffle`, true);
            generalHelp.addField(`**Music information**`, `playing\nnext\nfindvideo\nsearchf/search`, true);
            generalHelp.addField(`**Fun commands**`, `say\nlenny\nthesaurize\njoke`, true);
            generalHelp.addField(`**Admin commands**`, `prune\ntoggle`, true);
            generalHelp.addField(`**System commands**`, `ping`, true);
            generalHelp.addField(`**Currency commands**`, `balance\ntransfer`, true);
            generalHelp.addField(`**Game commands**`, `flip\nblackjack`, true);

            // data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
            generalHelp.setAuthor(`Use ${prefix}help [command name] to get info on a specific command`, client.user.avatarURL);

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
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Sorry, \`${prefix}${name}\` is not a valid command`)
                .setColor(`#FF0000`));
        }

        var commandHelp = new Discord.RichEmbed();

        if (name != command.name) {
            commandHelp.setDescription(`*(Redirected from ${prefix}${name})*`);
        }

        // data.push(`**Name:** ${command.name}`);
        commandHelp.setAuthor(config.get(`Bot.prefix`) + command.name, client.user.avatarURL);

        // if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.aliases) commandHelp.addField(`**Aliases**`, command.aliases.join(', '));

        // if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.description) commandHelp.addField(`**Description**`, command.description);

        // if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
        if (command.usage) {
            if (command.altUsage) {
                commandHelp.addField(`**Usage**`, `\`${prefix}${command.name} ${command.usage}\`\n*Or alternatively*\n\`${prefix}${command.name} ${command.altUsage}\``);
            } else {
                commandHelp.addField(`**Usage**`, `\`${prefix}${command.name} ${command.usage}\``);
            }
        }

        if (command.guildOnly) commandHelp.addField(`**Servers only**`, `Only usable in servers, not DMs`);

        if (!command.guildOnly) commandHelp.addField(`**Servers or DMs**`, `Usable in both servers and bot's DMs`);

        if (command.args) commandHelp.addField(`**Arguments required**`, `Providing the required arguments is required`);

        // data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
        commandHelp.addField(`**Cooldown**`, `${command.cooldown || 3} second(s)`);

        // message.channel.send(data, { split: true });
        message.channel.send(commandHelp);
    },
};