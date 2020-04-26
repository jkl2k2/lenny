//#region Requires
const fs = require('fs');
const Discord = require('discord.js');
const config = require('config');
const ytdl = require('ytdl-core');
const chalk = require('chalk');
const winston = require('winston');
const api = config.get(`Bot.api2`);
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(api);
//#endregion

//#region Initialize database
const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();

Reflect.defineProperty(currency, 'add', {
    value: async function add(id, amount) {
        const user = currency.get(id);
        if (user) {
            user.balance += Number(amount);
            return user.save();
        }
        const newUser = await Users.create({ user_id: id, balance: amount });
        currency.set(id, newUser);
        return newUser;
    },
});

Reflect.defineProperty(currency, 'getBalance', {
    value: function getBalance(id) {
        const user = currency.get(id);
        return user ? user.balance : 0;
    },
});
//#endregion

//#region Initialize client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
//#endregion

//#region Classes
class YTVideo {
    constructor(video, requester) {
        this.video = video;
        this.requester = requester;
    }
    getTitle() {
        return this.video.title;
    }
    getCleanTitle() {
        return this.video.title;
    }
    getURL() {
        return this.video.url;
    }
    getRequester() {
        return this.requester;
    }
    getRequesterName() {
        return this.requester.user.username;
    }
    getType() {
        if (!this.video.duration) {
            return "video";
        } else if (this.video.duration.hours == 0 && this.video.duration.minutes == 0 && this.video.duration.seconds == 0) {
            return "livestream";
        } else {
            return "video";
        }
    }
    getThumbnail() {
        if (this.video.maxRes) {
            return this.video.maxRes.url;
        } else {
            return ``;
        }
    }
    getChannelName() {
        return this.video.channel.title;
    }
    getChannelURL() {
        return this.video.channel.url;
    }
    async getLength() {
        if ((!this.video.duration) || this.video.duration.hours == 0 && this.video.duration.minutes == 0 && this.video.duration.seconds == 0) {
            var fullVideo = await youtube.getVideo(this.video.url);
            if (fullVideo.duration.hours == 0) {
                if (fullVideo.duration.seconds < 10) {
                    return `${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
                } else {
                    return `${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
                }
            } else {
                if (fullVideo.duration.seconds < 10) {
                    if (fullVideo.duration.minutes < 10) {
                        return `${fullVideo.duration.hours}:0${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
                    } else {
                        return `${fullVideo.duration.hours}:${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
                    }
                } else {
                    if (fullVideo.duration.minutes < 10) {
                        return `${fullVideo.duration.hours}:0${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
                    } else {
                        return `${fullVideo.duration.hours}:${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
                    }
                }
            }
        }

        if (this.video.duration.hours == 0) {
            if (this.video.duration.seconds < 10) {
                return `${this.video.duration.minutes}:0${this.video.duration.seconds}`;
            } else {
                return `${this.video.duration.minutes}:${this.video.duration.seconds}`;
            }
        } else {
            if (this.video.duration.seconds < 10) {
                if (this.video.duration.minutes < 10) {
                    return `${this.video.duration.hours}:0${this.video.duration.minutes}:0${this.video.duration.seconds}`;
                } else {
                    return `${this.video.duration.hours}:${this.video.duration.minutes}:0${this.video.duration.seconds}`;
                }
            } else {
                if (this.video.duration.minutes < 10) {
                    return `${this.video.duration.hours}:0${this.video.duration.minutes}:${this.video.duration.seconds}`;
                } else {
                    return `${this.video.duration.hours}:${this.video.duration.minutes}:${this.video.duration.seconds}`;
                }
            }
        }
    }
    getPosition() {
        // let queue = index.getQueue(this.requester.guild.id);
        let queue = Queues.get(this.requester.guild.id);
        if (queue.indexOf(this) == -1) {
            return 1;
        } else {
            return queue.indexOf(this) + 1;
        }
    }
    getVideo() {
        return this.video;
    }
    async getFullVideo() {
        return await youtube.getVideo(this.video.url);
    }
}

class Command {
    constructor(command, folder) {
        this.command = command;
        this.folder = folder;
    }
    getFolder() {
        return this.folder;
    }
    getCommand() {
        return this.command;
    }
}

class Activity {
    constructor(text, format) {
        this.text = text;
        this.format = format;
    }
    getText() {
        return this.text;
    }
    getFormat() {
        return this.format;
    }
}
//#endregion

//#region Globals/Constants/Variables/etc.

var clientReady = false;

global.constructVideo = (video, requester) => {
    return new YTVideo(video, requester);
};

var repeat = false;

const Queues = new Discord.Collection();
const Dispatchers = new Discord.Collection();


const prefix = config.get(`Bot.prefix`);
const token = config.get(`Bot.token`);
const ownerID = config.get(`Users.ownerID`);

var dispatcher;
var lastDetails;
var lastPlayed;

var statusChannel;
var statusMessage;
var casinoStatusMessage;
//#endregion

//#region Winston logger
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green',
});

const logger = winston.createLogger({
    // level: `debug`,
    transports: [
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.uncolorize()
            ),
            filename: `combined.log`,
            level: `info`
        }),
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.uncolorize()
            ),
            filename: `errors.log`,
            level: `warn`
        }),
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.uncolorize()
            ),
            filename: `debug.log`,
            level: `debug`
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                // winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.simple()
            )
        })
    ]
});
//#endregion

//#region ClientUser activities
const activities = [
    new Activity("with Cat!", "PLAYING"),
    new Activity("Sege", "PLAYING"),
    new Activity("Cat's PC melt", "WATCHING"),
    new Activity("your private convos", "WATCHING"),
    new Activity("trash music", "LISTENING"),
    new Activity("Russian spies", "LISTENING")
];
function newFunction() {
    return 1;
}

//#endregion

//#region Music info message sending
async function sendDetails(input, c) {
    if (input.getType() == "livestream") {
        let musicEmbed = new Discord.RichEmbed()
            .setAuthor(`▶️ Now playing`)
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\nBy: [${await input.getChannelName()}](${input.getChannelURL()})\n\n\`YouTube Livestream\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`);
        c.send(musicEmbed);
        lastDetails = musicEmbed;
    } else {
        let musicEmbed = new Discord.RichEmbed()
            .setAuthor(`▶️ Now playing`)
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\nBy: [${await input.getChannelName()}](${input.getChannelURL()})\n\n\`<⚫——————————> (0:00/${await input.getLength()})\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`);
        c.send(musicEmbed);
        lastDetails = musicEmbed;
    }
}

function sendSCDetails(input, c) {
    var scMusicEmbed = new Discord.RichEmbed()
        .setAuthor(`▶️ Now playing`)
        .setDescription(`**[${input.getCleanTitle()}](${input.getURL()})**`)
        .addField(`Uploader`, `[${input.getUploader()}](${input.getUploaderUrl()})`, true)
        .addField(`Length`, input.getLength(), true)
        .setThumbnail(input.getThumbnail())
        .setTimestamp()
        .setFooter(`Requested by ${input.getRequesterName()}`);
    c.send(scMusicEmbed);
    lastDetails = scMusicEmbed;
}
//#endregion

//#region Music playing
async function playMusic(message) {

    var queue = Queues.get(message.guild.id);

    if (queue == undefined) {
        logger.debug("playMusic() called, but queue undefined");
        return;
    }

    if (queue[0] == undefined) {
        logger.debug("playMusic() called, but queue[0] is undefined");
        return;
    } else {
        if (queue[0].getType() == "video" || queue[0].getType() == "livestream") {
            // If regular video

            let input = ytdl(queue[0].getURL(), { quality: "highestaudio", highWaterMark: 1 << 25 });

            // let connections = client.voiceConnections.array();

            Dispatchers.set(message.guild.id, client.voiceConnections.get(message.guild.id).playStream(input));
            Dispatchers.get(message.guild.id).setBitrate(384);

            sendDetails(queue[0], message.channel);

        } else if (queue[0].getType() == "soundcloud") {
            // If SoundCloud

            Dispatchers.set(message.guild.id, client.voiceConnections.get(message.guild.id).playStream(fs.createReadStream(`./soundcloud/${queue[0].getTitle()}`)));

            sendSCDetails(queue[0], message.channel);

        } else {
            message.channel.send("Error assigning dispatcher, object at index 0 not of recognized type");
        }

        lastPlayed = queue.shift();
        // Queues.get(message.guild.id).shift();
        var path;
        if (lastPlayed && lastPlayed.getType() == "soundcloud") {
            path = `./soundcloud/${lastPlayed.getTitle()}`;
        } else {
            path = " ";
        }

        if (message.member.voiceChannel) {
            // Reset dispatcher stream delay
            message.member.voiceChannel.connection.player.streamingData.pausedTime = 0;

        } else {
            // Fallback in case the original user left voice channel
            var connections = client.voiceConnections.array();
            connections[0].player.streamingData.pausedTime = 0;
        }

        Dispatchers.get(message.guild.id).on("end", function () {
            if (repeat) {
                queue.unshift(lastPlayed);
            }
            if (path != " ") {
                fs.unlink(path, (err) => {
                    if (err) {
                        logger.error(`FAILED to delete file at path ${path}`);
                        logger.error(err);
                        return;
                    }
                    logger.info(`Removed file at path ${path}`);
                });
            }
            if (queue[0]) {
                playMusic(message);
            }
        });
    }
}
//#endregion

//#region Casino status
async function updateCasinoStats(mainGuild) {
    var newLeaderboard = new Discord.RichEmbed()
        .setDescription(`:money_with_wings: **OWO GRAND RESORT & CASINO PROFITS** :money_with_wings:\n\nProfit: **$${currency.getBalance("0")}**\n\n:medal: **Top 10 users by currency**\n\n` + currency.sort((a, b) => b.balance - a.balance)
            .filter(user => client.users.has(user.user_id) && mainGuild.member(client.users.get(user.user_id)))
            .first(10)
            .map((user, position) => `\`${position + 1}.\` **${(client.users.get(user.user_id).username)}**\nBalance: \`$${user.balance}\`\n`)
            .join('\n'),
            { code: true })
        .setColor(`#1b9e56`);
    casinoStatusMessage.edit(newLeaderboard);
}
//#endregion

//#region Exports
module.exports = {
    getQueues: function () {
        return Queues;
    },
    getCurrencyDB: function () {
        return currency;
    },
    getLogger: function () {
        return logger;
    },
    getVolume: function () {
        return dispatcher.volume;
    },
    getQueue: function (message) {
        if (Queues.has(message)) {
            return Queues.get(message);

        } else if (Queues.has(message.guild.id)) {
            return Queues.get(message.guild.id);

        } else {
            return undefined;
        }
    },
    setQueue: function (message, newQueue) {
        Queues.set(message.guild.id, newQueue);
    },
    getDispatcher: function (message) {
        if (Dispatchers.get(message.guild.id)) {
            return Dispatchers.get(message.guild.id);
        } else {
            return undefined;
        }
    },
    getClient: function () {
        return client;
    },
    getPlaying: function (message) {
        let dispatcher = Dispatchers.get(message.guild.id);
        if (dispatcher && dispatcher.speaking) {
            return lastDetails;
        } else {
            return new Discord.RichEmbed()
                .setDescription(`:information_source: Nothing is currently playing`)
                .setColor(`#0083FF`);
        }
    },
    getPlayingVideo: function () {
        return lastPlayed;
    },
    getRepeat: function () {
        return repeat;
    },
    getStatusChannel: function () {
        return statusChannel;
    },
    getStatusMessage: function () {
        return statusMessage;
    },
    setDispatcher: function (newDispatcher) {
        dispatcher = newDispatcher;
    },
    setDispatcherVolume: function (newVolume) {
        dispatcher.setVolume(newVolume);
    },
    pauseMusic: function () {
        dispatcher.pause();
    },
    resumeMusic: function () {
        dispatcher.resume();
    },
    endDispatcher: function (message) {
        Dispatchers.get(message.guild.id).end();
    },
    callPlayMusic: function (message) {
        playMusic(message);
    },
    setRepeat: function (toSet) {
        repeat = toSet;
    }
};
//#endregion

//#region Command file loading

// Initialize array of command files
var commandFiles = [];

// Load unsorted commands
const unsortedCommandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const unsortedCommand of unsortedCommandFiles) {
    commandFiles.push(new Command(unsortedCommand, "/"));
}

// Load music commands
const musicCommandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'));
for (const musicCommand of musicCommandFiles) {
    commandFiles.push(new Command(musicCommand, '/music/'));
}

// Load currency commands
const currencyCommandFiles = fs.readdirSync('./commands/currency').filter(file => file.endsWith('.js'));
for (const currencyCommand of currencyCommandFiles) {
    commandFiles.push(new Command(currencyCommand, '/currency/'));
}

// Load fun commands
const funCommandFiles = fs.readdirSync('./commands/fun').filter(file => file.endsWith('.js'));
for (const funCommand of funCommandFiles) {
    commandFiles.push(new Command(funCommand, '/fun/'));
}

// Load admin commands
const adminCommandFiles = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));
for (const adminCommand of adminCommandFiles) {
    commandFiles.push(new Command(adminCommand, '/admin/'));
}

// Load general commands
const generalCommandFiles = fs.readdirSync('./commands/general').filter(file => file.endsWith('.js'));
for (const generalCommand of generalCommandFiles) {
    commandFiles.push(new Command(generalCommand, '/general/'));
}

// Register commands with client
for (const file of commandFiles) {
    const command = require(`./commands${file.getFolder()}${file.getCommand()}`);

    // Key: name, value: command module
    client.commands.set(command.name, command);
}

//#endregion

//#region Client Ready
client.on('ready', async () => {
    // Sync with currency database
    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => currency.set(b.user_id, b));

    let date = new Date();

    // Randomly select status
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities.length - 1) + 1);
        client.user.setActivity(activities[index].getText(), { type: activities[index].getFormat() });
        client.user.setStatus("online");
    }, 15000);

    var casinoChannel = client.channels.get(`696986079584321566`);

    // casinoStatusMessage = await casinoChannel.send(new Discord.RichEmbed()
    // .setDescription(`:money_with_wings: **OWO GRAND RESORT & CASINO PROFITS** :money_with_wings:\n\n__Total profits__\n**$placeholder**`));

    var casinoFetched = await casinoChannel.fetchMessages({ limit: 10 });
    casinoChannel.bulkDelete(casinoFetched);

    var mainGuild = client.guilds.get(`471193210102743040`);

    casinoStatusMessage = await casinoChannel.send(new Discord.RichEmbed()
        .setDescription(`:money_with_wings: **OWO GRAND RESORT & CASINO PROFITS** :money_with_wings:\n\nProfit: **$${currency.getBalance("0")}**\n\n:medal: **Top 10 users by currency**\n\n` + currency.sort((a, b) => b.balance - a.balance)
            .filter(user => client.users.has(user.user_id) && mainGuild.member(client.users.get(user.user_id)))
            .first(10)
            .map((user, position) => `\`${position + 1}.\` **${(client.users.get(user.user_id).username)}**\nBalance: \`$${user.balance}\`\n`)
            .join('\n'),
            { code: true })
        .setColor(`#1b9e56`));

    setInterval(() => {
        updateCasinoStats(mainGuild);
    }, 5000);

    logger.info(chalk.white.bgCyan(`--------Bot Initialized--------`));
    logger.info(chalk.white.bgCyan(`Timestamp: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
    logger.info(chalk.white.bgCyan.bold(`-------Awaiting Commands-------`));

    clientReady = true;
});
//#endregion

//#region Client on message
client.on('message', message => {

    if (!clientReady) {
        return;
    }

    if (message.content.includes("banana")) {
        message.react('🍌')
            .then(() => (message.react('🇴')))
            .then(() => (message.react('🇼'))
                .then(() => message.react('🅾️')));
    }
    // Declare reaction filter
    const filter = (reaction, user) => {
        return ['⭐'].includes(reaction.emoji.name);
    };

    // Find starboard channel by specific ID
    var starChannel = client.channels.get(`554868648964259861`);
    // var starChannel = client.channels.get(`554873931555667969`);

    function checkContent(msg) {
        if (!msg.cleanContent) {
            return "*Message had no text*";
        } else {
            return msg.cleanContent;
        }
    }

    // Check for star reactions for 48 hours
    message.awaitReactions(filter, { max: 1, time: 172800000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            // If reaction is a star
            if (reaction.emoji.name === '⭐') {
                logger.info(`Message by ${message.author.username} has been starred`);
            }

            // If starboard channel exists
            if (starChannel) {
                var attachmentsArray = (message.attachments).array();

                // If image attached to message
                if (attachmentsArray[0]) {
                    let starEmbed = new Discord.RichEmbed()
                        .setDescription(`:star: **Starred Message** :star:\nAuthor: **${message.author.username}**`)
                        .setThumbnail(message.author.avatarURL)
                        .addField(`Message`, checkContent(message))
                        .addField(`Channel`, `<#${message.channel.id}>`, true)
                        .addField(`Message link`, `[Jump to message](${message.url})`, true)
                        // .setThumbnail(message.author.avatarURL)
                        .setImage(attachmentsArray[0].url)
                        .setColor(`#FCF403`)
                        .setTimestamp();

                    starChannel.send(starEmbed);
                    logger.info(`Sent embed with image to starboard`);
                } else {
                    // If image NOT attached to image
                    let starEmbed = new Discord.RichEmbed()
                        .setDescription(`:star: **Starred Message** :star:\nAuthor: **${message.author.username}**`)
                        .setThumbnail(message.author.avatarURL)
                        .addField(`Message`, checkContent(message))
                        .addField(`Channel`, `<#${message.channel.id}>`, true)
                        .addField(`Message link`, `[Jump to message](${message.url})`, true)
                        .setColor(`#FCF403`)
                        .setTimestamp();

                    starChannel.send(starEmbed);
                    logger.info(`Sent embed WITHOUT image to starboard`);
                }
            }
        })
        .catch(collected => {
            // When collector expires
        });

    // Return if message from bot
    if (message.author.bot) return;

    // Give user 1 coin
    if (message.attachments.array()[0]) {
        currency.add(message.author.id, 10);
    } else if (message.content.length > 5) {
        currency.add(message.author.id, 1);
    }

    // Return if no prefix
    if (!message.content.startsWith(prefix)) return;

    // Put args into array
    const args = message.content.slice(prefix.length).split(/ +/);
    const argsShifted = [...args];
    argsShifted.shift();

    // Extract command name
    const commandName = args.shift().toLowerCase();

    // Check if valid command or alias
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Return if not valid command
    if (!command) {
        // return logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Not valid command`)}`);
        return;
    }

    // Return if command is disabled
    if (!command.enabled) {
        logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Command is disabled`)}`);
        return message.channel.send(new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Sorry, \`!${commandName}\` is disabled`)
            .setColor(`#FF0000`));
    }

    // If guild-only, no DMs allowed
    if (command.guildOnly && message.channel.type !== 'text') {
        logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Command is guild-only`)}`);
        let serverOnly = new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Sorry, that command is only usable in servers`)
            .setColor(`#FF0000`);
        return message.channel.send(serverOnly);
    }

    // If command needs arguments
    if (command.args && !args.length) {
        logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Improper usage`)}`);
        let noArgs = new Discord.RichEmbed();
        let msg = `You didn't provide the required arguments, ${message.author.username}`;

        if (command.usage) {
            msg += `\n\nThe proper usage would be:\n\`${prefix}${command.name} ${command.usage}\``;
        }

        noArgs.setDescription(msg);
        noArgs.setAuthor(`Improper usage`, client.user.avatarURL);

        return message.channel.send(noArgs);
    }

    // If command has cooldowns
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    // Set times for use with cooldown
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // Act on cooldown
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime && message.author.id != ownerID) {
            const timeLeft = (expirationTime - now) / 1000;
            logger.debug(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Cooldown in effect`)}`);
            let cooldownEmbed = new Discord.RichEmbed()
                .addField(`<:error:643341473772863508> Command cooldown`, `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`)
                .setColor(`#FF0000`);
            // return message.channel.send(cooldownEmbed);
            return;
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Attempt to execute command
    try {
        logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}`);
        command.execute(message, args);
    } catch (error) {
        logger.error(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Command errored`)}`);
        logger.error(error);
        let errorEmbed = new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Error executing command\n\n\`\`\`${error}\`\`\``)
            .setColor(`#FF0000`);
        message.channel.send(errorEmbed);
    }
});
//#endregion

client.login(token);