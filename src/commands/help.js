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
            return message.channel.send(new MessageEmbed()
                .setAuthor(`Use ${prefix}help [category] to view commands`, client.user.avatarURL())
                .setDescription(`**You can also [visit my GitBook](https://jkl2k2.gitbook.io/lenny/) for help**`)
                .addField(`:globe_with_meridians: General`, `\`Typical util stuff\``, true)
                .addField(`:clipboard: Admin`, `\`Configure the bot\``, true)
                .addField(`:tada: Fun`, `\`Just for fun\``, true)
                .addField(`:headphones: Music`, `\`Listen with friends\``, true)
                .addField(`:game_die: Currency`, `\`Feeling lucky?\``, true)
                .setColor(`#36393f`));
        } else if (args.input.toLowerCase() == `general`) {
            return message.channel.send(new MessageEmbed()
                .setAuthor(`Category: General`, client.user.avatarURL(), `https://jkl2k2.gitbook.io/lenny/commands/command-groups/general`)
                .setDescription(`[Link to help docs](https://jkl2k2.gitbook.io/lenny/commands/command-groups/general)**\n\nUse \`${prefix}help [command]\` to view a specific command**`)
                .addField(`help`, `View help for commands`)
                .addField(`ping`, `Display the bot's ping`)
                .setColor(`#36393f`));
        } else if (args.input.toLowerCase() == `admin`) {
            return message.channel.send(new MessageEmbed()
                .setAuthor(`Category: Admin`, client.user.avatarURL(), `https://jkl2k2.gitbook.io/lenny/commands/command-groups/admin`)
                .setDescription(`[Link to help docs](https://jkl2k2.gitbook.io/lenny/commands/command-groups/admin)**\n\nUse \`${prefix}help [command]\` to view a specific command**`)
                .addField(`kick`, `Kicks a tagged user`)
                .addField(`ban`, `Bans a tagged user`)
                .addField(`config`, `Configure server settings`)
                .addField(`prune`, `Remove up to 100 messages from a channel`)
                .setColor(`#36393f`));
        } else if (args.input.toLowerCase() == `fun`) {
            return message.channel.send(new MessageEmbed()
                .setAuthor(`Category: Fun`, client.user.avatarURL(), `https://jkl2k2.gitbook.io/lenny/commands/command-groups/fun`)
                .setDescription(`[Link to help docs](https://jkl2k2.gitbook.io/lenny/commands/command-groups/fun)**\n\nUse \`${prefix}help [command]\` to view a specific command**`)
                .addField(`ask`, `Ask a yes or no question!`)
                .addField(`choose`, `Separate options with commas`)
                .addField(`lenny`, `( ͡° ͜ʖ ͡°)`)
                .addField(`uwu`, `Uwuify text ~w~`)
                .addField(`thesaurize`, `Pass your message through a thesaurus`)
                .addField(`tag/tags`, `Create/view tags`)
                .addField(`gpt`, `Have the bot complete your sentence`)
                .setColor(`#36393f`));
        } else if (args.input.toLowerCase() == `music`) {
            return message.channel.send(new MessageEmbed()
                .setAuthor(`Category: Music`, client.user.avatarURL(), `https://jkl2k2.gitbook.io/lenny/commands/command-groups/music`)
                .setDescription(`[Link to help docs](https://jkl2k2.gitbook.io/lenny/commands/command-groups/music)**\n\nUse \`${prefix}help [command]\` to view a specific command**`)
                .addField(`play`, `Play a YouTube or SoundCloud song`)
                .addField(`playnext`, `Queues a song to play immediately next`)
                .addField(`playnow`, `Immediately skips and plays a song`)
                .addField(`playlist`, `Searches for 5 YouTube playlists`)
                .addField(`search`, `Searches for 5 YouTube videos`)
                .addField(`radio`, `Searches using iHeartRadio`)
                .addField(`skip/skipall`, `Skips the current song`)
                .addField(`clear`, `Clears the queue`)
                .addField(`join/leave/stop`, `Joins/leaves a voice channel`)
                .addField(`pause/resume`, `Pauses/resumes playback`)
                .addField(`mute/unmute`, `Mutes/unmutes the audio`)
                .addField(`volume`, `Set playback volume`)
                .addField(`queue`, `View the server's music queue`)
                .addField(`playing`, `See what is currently playing`)
                .addField(`next`, `See what is coming up next`)
                .addField(`remove`, `Remove a song from the queue`)
                .addField(`repeat`, `Enable/disable looping of the current song`)
                .addField(`move`, `Moves a song's position in the queue`)
                .addField(`force`, `Unstick a frozen player`)
                .addField(`find/yt`, `Search for a YouTube video and send a link to the first result`)
                .setColor(`#36393f`));
        } else if (args.input.toLowerCase() == `currency`) {
            return message.channel.send(new MessageEmbed()
                .setAuthor(`Category: Currency`, client.user.avatarURL(), `https://jkl2k2.gitbook.io/lenny/commands/command-groups/currency`)
                .setDescription(`[Link to help docs](https://jkl2k2.gitbook.io/lenny/commands/command-groups/currency)**\n\nUse \`${prefix}help [command]\` to view a specific command**`)
                .addField(`balance`, `Displays your current wallet`)
                .addField(`transfer`, `Give money to another user`)
                .addField(`badge`, `Use money to upgrade badges`)
                .addField(`leaderboard`, `Show the top 10 richest users in the server`)
                .addField(`blackjack`, `Play a game of blackjack`)
                .addField(`flip`, `Bet on a coin flip`)
                .addField(`slots`, `Play a slot machine`)
                .setColor(`#36393f`));
        }

        const command = message.client.commandHandler.modules.find(c => c.aliases && c.aliases.includes(args.input));

        if (!command) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Sorry, \`${prefix}${args.input}\` is not a valid command`)
                .setColor(`#FF3838`));
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

        message.channel.send(commandHelp);
    }
}

module.exports = HelpCommand;