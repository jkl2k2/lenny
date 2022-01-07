const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class HelpCommand extends Command {
    constructor() {
        super(`help`, {
            aliases: [`help`, `commands`],
            args: [
                {
                    id: `input`,
                    type: `string`,
                    default: null
                }
            ],
            category: `general`,
            description: `Learn what functions Lenny has to offer`,
        });
    }

    exec(message, args) {
        // Get client
        const client = message.client;

        // Ready for assigning
        let serverConfig;
        let prefix;

        // Determine prefix
        if (message.guild) {
            serverConfig = client.settings.ensure(message.guild.id, client.settings.default);
            prefix = serverConfig[`prefix`];
        } else {
            prefix = "!";
        }

        // If no arguments provided
        if (args.input == null) {
            // Show help directory
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`Use ${prefix}help [category] to view commands`, client.user.avatarURL())
                        .addField(`:globe_with_meridians: General`, `\`Typical utility\``, true)
                        .addField(`:clipboard: Admin`, `\`Configure the bot\``, true)
                        .addField(`:tada: Fun`, `\`Just for fun\``, true)
                        .addField(`:headphones: Music`, `\`Listen with friends\``, true)
                        .setColor(`#36393f`)
                ]
            });
        } else if (args.input.toLowerCase() == `general`) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`Category: General`, client.user.avatarURL())
                        .setDescription(`**Use \`${prefix}help [command]\` to view a specific command**`)
                        .addField(`help`, `View help for commands`)
                        .addField(`ping`, `Display the bot's ping`)
                        .addField(`invite`, `Provides an invite for the bot`)
                        .setColor(`#36393f`)
                ]
            });
        } else if (args.input.toLowerCase() == `admin`) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`Category: Admin`, client.user.avatarURL())
                        .setDescription(`**Use \`${prefix}help [command]\` to view a specific command**`)
                        .addField(`prefix`, `Change the prefix of the bot`)
                        .setColor(`#36393f`)
                ]
            });
        } else if (args.input.toLowerCase() == `fun`) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`Category: Fun`, client.user.avatarURL())
                        .setDescription(`**Use \`${prefix}help [command]\` to view a specific command**`)
                        .addField(`lenny`, `( ͡° ͜ʖ ͡°)`)
                        .setColor(`#36393f`)
                ]
            });
        } else if (args.input.toLowerCase() == `music`) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`Category: Music`, client.user.avatarURL())
                        .setDescription(`**Use \`${prefix}help [command]\` to view a specific command**\n\n**Music commands are all accessed with \`/\`**`)
                        .addField(`play`, `Play a song or playlist from YouTube, Spotify, or SoundCloud`)
                        .addField(`playlists`, `Add, manage, and play from your saved playlists`)
                        .addField(`skip`, `Skips the current song`)
                        .addField(`clear`, `Clears the queue`)
                        .addField(`leave/stop`, `Leaves a voice channel`)
                        .addField(`shuffle`, `Shuffles the queue`)
                        .addField(`pause/resume`, `Pauses/resumes playback`)
                        .addField(`queue`, `View the server's music queue`)
                        .addField(`playing`, `See what is currently playing`)
                        .addField(`remove`, `Remove a song from the queue`)
                        .addField(`find`, `Search for a YouTube video and send a link to the first result`)
                        .setColor(`#36393f`)
                ]
            });
        }

        const command = message.client.commandHandler.modules.find(c => c.aliases && c.aliases.includes(args.input));

        if (!command) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Sorry, \`${prefix}${args.input}\` is not a valid command`)
                        .setColor(`#FF3838`)
                ]
            });
        }

        var commandHelp = new MessageEmbed();

        if (args.input != command.aliases[0]) {
            commandHelp.setDescription(`\`(Redirected from ${prefix}${args.input})\``);
        }

        commandHelp.setAuthor(prefix + command.aliases[0], client.user.avatarURL());

        // Aliases
        if (command.aliases) commandHelp.addField(`**Aliases** `, command.aliases.join(', '));

        // Description
        if (command.description) commandHelp.addField(`**Description** `, command.description);

        // Restrictions
        if (command.userPermissions) {
            commandHelp.addField(`**Required User Permissions** `, `\`${command.userPermissions.join(", ")}\``);
        }

        if (command.ownerOnly) {
            commandHelp.addField(`**Restricted Command**`, `Only the owner can access this command`);
        }

        // Usage
        /*
        if (command.args) {
            if (command.altUsage) {
                commandHelp.addField(`**Usage**`, `\`${prefix}${command.aliases[0]} ${command.usage}\`\n*Or alternatively*\n\`${prefix}${command.aliases[0]} ${command.altUsage}\``);
            } else {
                commandHelp.addField(`**Usage**`, `\`${prefix}${command.aliases[0]} ${command.usage}\``);
            }
        }
        */

        // Guild only
        if (command.channel == `guild`) {
            commandHelp.addField(`**Servers only**`, `Only usable in servers, not DMs`);
        } else {
            commandHelp.addField(`**Servers or DMs**`, `Usable in both servers and bot's DMs`);
        }

        // Arguments
        // if (command.args) commandHelp.addField(`**Arguments required**`, `Providing the required arguments is required`);

        // Cooldown
        commandHelp.addField(`**Cooldown**`, `${command.cooldown || 3} second(s)`);

        commandHelp.setColor(`#36393f`);

        message.channel.send({
            embeds: [
                commandHelp
            ]
        });
    }
}

module.exports = HelpCommand;