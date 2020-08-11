//#region Requires
const fs = require('fs');
const Discord = require('discord.js');
const config = require('config');
const ytdl = require('ytdl-core');
const chalk = require('chalk');
const winston = require('winston');
const winstonRotate = require(`winston-daily-rotate-file`);
const api = config.get(`Bot.api2`);
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(api);
const TwitchClient = require('twitch').default;
const twitchClient = TwitchClient.withCredentials(config.get(`Bot.TWITCH_CLIENT_ID`), config.get(`Bot.TWITCH_CLIENT_SECRET`));
const hex = require(`rgb-hex`);
const colorThief = require(`colorthief`);
const fetch = require(`node-fetch`);
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
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
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
        var unformatted = this.video.title;
        var formatted = ``;

        for (var i = 0; i < unformatted.length; i++) {
            if (unformatted.substring(i, i + 1) == `*` || unformatted.substring(i, i + 1) == `_`) {
                formatted += `\\`;
                formatted += unformatted.substring(i, i + 1);
                // i++;
            } else {
                formatted += unformatted.substring(i, i + 1);
            }
        }

        return formatted;
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
    getRequesterAvatar() {
        return this.requester.user.avatarURL();
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
    async getChannelThumbnail() {
        let fullChannel = await this.video.channel.fetch();
        return fullChannel.thumbnails.default.url;
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
        if (queue.list.indexOf(this) == -1) {
            return 1;
        } else {
            return queue.list.indexOf(this) + 1;
        }
    }
    getVideo() {
        return this.video;
    }
    async getFullVideo() {
        return await youtube.getVideo(this.video.url);
    }
}

class TwitchStream extends YTVideo {
    constructor(url, name, requester) {
        super(url, requester);
        this.name = name;
    }
    getTitle() {
        return this.name;
    }
    getCleanTitle() {
        return this.name;
    }
    getURL() {
        return this.url;
    }
    getType() {
        return "twitch";
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

class Queue {
    constructor() {
        this.list = [];
        this.repeat = false;
        this.volume = 1;
        this.oldVolume = 1;
        this.lastPlayed = undefined;
    }
    push(input) {
        this.list.push(input);
    }
    unshift(input) {
        this.list.unshift(input);
    }
    setLastPlayed(input) {
        this.lastPlayed = input;
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

var repeat = false;

const Queues = new Discord.Collection();
const Dispatchers = new Discord.Collection();

const token = config.get(`Bot.token`);
const ownerID = config.get(`Users.ownerID`);
const jahyID = config.get(`Users.jahyID`);
const fookID = config.get(`Users.fookID`);

var lastDetails;

var statusChannel;
var statusMessage;
var casinoStatusMessage;

var adminStatusChannel;
var adminStatusMessage;
//#endregion

//#region Winston logger
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green',
});

const logger = winston.createLogger({
    transports: [
        new winstonRotate({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.uncolorize(),
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
            ),
            filename: `./logs/info-%DATE%.log`,
            datePattern: `YYYY-MM-DD`,
            level: `info`
        }),
        new winstonRotate({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.uncolorize(),
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
            ),
            filename: `./logs/error-%DATE%.log`,
            datePattern: `YYYY-MM-DD`,
            level: `error`
        }),
        new winstonRotate({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.uncolorize(),
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
            ),
            filename: `./logs/debug-%DATE%.log`,
            datePattern: `YYYY-MM-DD`,
            level: `debug`
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                // winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.simple()
            ),
            level: `info`
        })
    ]
});
//#endregion

//#region ClientUser activities
const activities = [
    new Activity("Sege", "PLAYING"),
    new Activity("my PC melt", "WATCHING"),
    new Activity("your private convos", "WATCHING"),
    new Activity("trash music", "LISTENING"),
    new Activity("Russian spies", "LISTENING"),
    new Activity("Minecraft", "PLAYING")
];
//#endregion

//#region Music info message sending
async function sendDetails(input, c) {
    if (input.getType() == "livestream") {
        let buffer = await fetch(input.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
        let rgb = await colorThief.getColor(buffer);
        let musicEmbed = new Discord.MessageEmbed()
            .setAuthor(`Now playing`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${await input.getChannelName()}](${input.getChannelURL()})\n\n\`YouTube Livestream\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`);
        c.send(musicEmbed);
        lastDetails = musicEmbed;
    } else if (input.getType() == "twitch") {
        let channel = await twitchClient.helix.users.getUserByName(input.getTitle());
        let musicEmbed = new Discord.MessageEmbed()
            .setAuthor(`Now playing`, channel.profilePictureUrl)
            .setDescription(`**[${channel.displayName}](www.twitch.tv/${channel.displayName})**\n\n\`Twitch Livestream\``)
            .setThumbnail(channel.profilePictureUrl)
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar());
        c.send(musicEmbed);
        lastDeatils = musicEmbed;
    } else {
        let buffer = await fetch(input.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
        let rgb = await colorThief.getColor(buffer);
        let musicEmbed = new Discord.MessageEmbed()
            .setAuthor(`Now playing`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${await input.getChannelName()}](${input.getChannelURL()})\n\nLength: \`${await input.getLength()}\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`);
        c.send(musicEmbed);
        lastDetails = musicEmbed;
    }
}

function sendSCDetails(input, c) {
    var scMusicEmbed = new Discord.MessageEmbed()
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

    if (queue.list == undefined) return logger.debug("playMusic() called, but queue undefined");
    if (queue.list[0] == undefined) return logger.debug("playMusic() called, but queue[0] is undefined");

    if (queue.list[0].getType() == "video" || queue.list[0].getType() == "livestream") {
        // If regular video

        var input = ytdl(queue.list[0].getURL(), { quality: "highestaudio" });

        Dispatchers.set(message.guild.id, client.voice.connections.get(message.guild.id).play(input, { bitrate: 384, volume: Queues.get(message.guild.id).volume, passes: 5, fec: true }));

        if (!queue.repeat) sendDetails(queue.list[0], message.channel);

        if (queue.list[0].getType() == "livestream") {
            queue.repeat = true;
        }

    } else if (queue.list[0].getType() == "twitch") {
        // If Twitch

        // Dispatchers.set(message.guild.id, client.voice.connections.get(message.guild.id).playStream(queue.list[0].getURL()));

        sendDetails(queue.list[0], message.channel);

    } else if (queue.list[0].getType() == "soundcloud") {
        // If SoundCloud

        // Dispatchers.set(message.guild.id, client.voice.connections.get(message.guild.id).playStream(fs.createReadStream(`./soundcloud/${queue.list[0].getTitle()}`)));
        Dispatchers.set(message.guild.id, client.voice.connections.get(message.guild.id).play(queue.list[0].getURL()));

        sendSCDetails(queue.list[0], message.channel);

    } else {
        return message.channel.send("Error assigning dispatcher, object at index 0 not of recognized type");
    }

    queue.lastPlayed = queue.list.shift();
    // Queues.get(message.guild.id).shift();
    var path;
    if (queue.lastPlayed && queue.lastPlayed.getType() == "soundcloud") {
        path = `./soundcloud/${queue.lastPlayed.getTitle()}`;
    } else {
        path = " ";
    }

    // Reset dispatcher stream delay
    client.voice.connections.get(message.guild.id).player.streamingData.pausedTime = 0;

    Dispatchers.get(message.guild.id).on("close", function () {
        if (queue.repeat) {
            queue.list.unshift(queue.lastPlayed);
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
        if (queue.list[0]) {
            playMusic(message);
        } else {
            Dispatchers.set(message.guild.id, undefined);
        }
    });

    Dispatchers.get(message.guild.id).on("finish", function () {
        if (queue.repeat) {
            queue.list.unshift(queue.lastPlayed);
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
        if (queue.list[0]) {
            playMusic(message);
        } else {
            Dispatchers.set(message.guild.id, undefined);
        }
    });
}
//#endregion

//#region Casino status
function updateCasinoStats(mainGuild) {
    var newLeaderboard = new Discord.MessageEmbed()
        .setDescription(`:money_with_wings: **OWO GRAND RESORT & CASINO PROFITS** :money_with_wings:\n\nProfit: **$${currency.getBalance("0")}**\n\n:medal: **Top 10 users by currency**\n\n` + currency.sort((a, b) => b.balance - a.balance)
            .filter(user => client.users.cache.has(user.user_id) && mainGuild.member(client.users.cache.get(user.user_id)))
            .first(10)
            .map((user, position) => `\`${position + 1}.\` **${(client.users.cache.get(user.user_id).username)}**\nBalance: \`$${user.balance}\`\n`)
            .join('\n'),
            { code: true })
        .setColor(`#1b9e56`);
    casinoStatusMessage.edit(newLeaderboard);
}
//#endregion

//#region Admin dashboard
function formatDate() {
    var date = new Date();
    if (date.getSeconds() < 10) {
        return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
    } else {
        return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
}

async function updateAdminDashboard() {
    var heartbeatPing = Math.round(client.ping);

    var newMessage = new Discord.MessageEmbed()
        .setDescription(`:clock3: Websocket Ping: **${heartbeatPing}ms**`)
        .setFooter(`Updated ${formatDate()}`);
    adminStatusMessage.edit(newMessage);
}
//#endregion

//#region Exports
module.exports = {
    constructQueue: function () {
        return new Queue();
    },
    constructVideo: function (input, member) {
        return new YTVideo(input, member);
    },
    constructTwitch: function (input, name, member) {
        console.log("Constructing Twitch stream");
        return new TwitchStream(input, name, member);
    },
    getTwitchClient: function () {
        return twitchClient;
    },
    getQueues: function () {
        return Queues;
    },
    getCurrencyDB: function () {
        return currency;
    },
    getLogger: function () {
        return logger;
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
        if (Dispatchers.get(message.guild.id) != undefined) {
            return Dispatchers.get(message.guild.id);
        } else {
            return undefined;
        }
    },
    getDispatchers: function () {
        return Dispatchers;
    },
    getClient: function () {
        return client;
    },
    getPlaying: function (message) {
        let dispatcher = Dispatchers.get(message.guild.id);
        if (dispatcher && dispatcher.speaking) {
            return lastDetails;
        } else {
            return new Discord.MessageEmbed()
                .setDescription(`:information_source: Nothing is currently playing`)
                .setColor(`#0083FF`);
        }
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
    setDispatcher: function (message, newDispatcher) {
        Dispatchers.set(message.guild.id, newDispatcher);
    },
    endDispatcher: function (message) {
        Dispatchers.get(message.guild.id).destroy();
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
logger.debug(chalk.black.bgGray(`Loading commands...`));

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
    logger.debug(chalk.black.bgGray(`Syncing with currency database...`));
    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => currency.set(b.user_id, b));

    let date = new Date();

    // client.user.setActivity(`trash music`, { type: "LISTENING" });

    // Randomly select status
    setInterval(() => {
        let index = Math.floor(Math.random() * (activities.length - 1) + 1);
        client.user.setActivity(activities[index].getText(), { type: activities[index].getFormat() });
    }, 15000);

    //#region Casino stats

    var casinoChannel = client.channels.cache.get(`696986079584321566`);
    var mainGuild = client.guilds.cache.get(`471193210102743040`);

    logger.debug(chalk.black.bgGray(`Clearing leaderboard channel...`));
    var casinoFetched = await casinoChannel.messages.fetch({ limit: 10 });
    casinoChannel.bulkDelete(casinoFetched);

    logger.debug(chalk.black.bgGray(`Sending initial leaderboard message...`));
    casinoStatusMessage = await casinoChannel.send(new Discord.MessageEmbed()
        .setDescription(`:money_with_wings: **OWO GRAND RESORT & CASINO PROFITS** :money_with_wings:\n\nProfit: **$${currency.getBalance("0")}**\n\n:medal: **Top 10 users by currency**\n\n` + currency.sort((a, b) => b.balance - a.balance)
            .filter(user => client.users.cache.has(user.user_id) && mainGuild.member(client.users.cache.get(user.user_id)))
            .first(10)
            .map((user, position) => `\`${position + 1}.\` **${(client.users.cache.get(user.user_id).username)}**\nBalance: \`$${user.balance}\`\n`)
            .join('\n'),
            { code: true })
        .setColor(`#1b9e56`));

    setInterval(() => {
        updateCasinoStats(mainGuild);
    }, 10000);

    //#endregion

    //#region Init log message
    logger.info(chalk.white.bgCyan(`--------Bot Initialized--------`));
    if (date.getMinutes() < 10) {
        if (date.getSeconds() < 10) {
            logger.info(chalk.white.bgCyan(`Timestamp: ${date.getHours()}:0${date.getMinutes()}:0${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
        } else {
            logger.info(chalk.white.bgCyan(`Timestamp: ${date.getHours()}:0${date.getMinutes()}:${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
        }
    } else if (date.getSeconds() < 10) {
        logger.info(chalk.white.bgCyan(`Timestamp: ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
    } else {
        logger.info(chalk.white.bgCyan(`Timestamp: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
    }
    // logger.info(chalk.white.bgCyan(`Timestamp: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
    logger.info(chalk.white.bgCyan.bold(`-------Awaiting Commands-------`));
    //#endregion

    clientReady = true;
});
//#endregion

//#region Client VC Disconnect -> Reset music data
client.on(`voiceStateUpdate`, (oldState, newState) => {
    if (oldState.channel && !newState.channel) {
        Dispatchers.set(oldState.guild.id, undefined);
        Queues.set(oldState.guild.id, new Queue());
    }
});
//#endregion

//#region Administrative logging
/*
client.on(`messageDelete`, message => {
    function getMessageTimestamp(message) {
        if (message.createdAt.getMinutes() < 10) {
            return `[${message.createdAt.getMonth() + 1}/${message.createdAt.getDate() + 1} @ ${message.createdAt.getHours()}:0${message.createdAt.getMinutes()}]`;
        } else {
            return `[${message.createdAt.getMonth() + 1}/${message.createdAt.getDate() + 1} @ ${message.createdAt.getHours()}:${message.createdAt.getMinutes()}]`;
        }
    }

    let logChannel = message.guild.channels.cache.find(channel => channel.name == `admin-log`);

    if (logChannel == undefined) return;

    if (message.guild.id != `438485091824697344`) return;

    logChannel.send(new Discord.MessageEmbed()
        .setDescription(`:wastebasket: Message Deleted By: **${message.author.tag}** in channel ${message.channel}\n\`\`\`${getMessageTimestamp(message)} ${message.cleanContent}\`\`\``)
        .setFooter(`ID: ${message.id}`)
        .setColor(`#FF3838`)
        .setTimestamp());
});

client.on(`messageDeleteBulk`, async messages => {
    let message = messages.array()[0];

    if (message.partial) await message.fetch();

    let logChannel = message.guild.channels.cache.find(channel => channel.name == `admin-log`);

    if (logChannel == undefined) return;

    if (message.guild.id != `438485091824697344`) return;

    logChannel.send(new Discord.MessageEmbed()
        .setDescription(`:wastebasket: ${messages.size - 1} Messages (Bulk) Deleted\n\`${messages.size - 1} messages deleted\` in channel ${message.channel}`)
        .setColor(`#FF3838`)
        .setTimestamp());
});
*/
//#endregion

//#region Starboard
client.on('messageReactionAdd', async (reaction, user) => {
    // ready check attachments function 
    function extension(reaction, attachment) {
        const imageLink = attachment.split('.');
        const typeOfImage = imageLink[imageLink.length - 1];
        const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
        if (!image) return '';
        return attachment;
    }

    function getDescription(message) {
        if (message.cleanContent.length < 1 && message.embeds.length > 0) {
            // If starred message is an embed
            let constructed = ``;
            let embed = message.embeds[0];

            if (embed.author) constructed += `**${embed.author.name}**`;
            if (embed.title) constructed += `\n\n**${embed.title}**`;
            if (embed.description) constructed += `\n${embed.description}`;

            return constructed;
        } else if (message.cleanContent.length < 1 && message.attachments.array()[0]) {
            // If attachment detected
            return `[${message.attachments.array()[0].name}](${message.attachments.array()[0].url})`;
        } else {
            // If only text
            return message.cleanContent;
        }
    }

    function checkImage(embed) {
        if (embed.image && embed.image.url) {
            return embed.image.url;
        } else {
            return "";
        }
    }

    // if uncached message
    if (reaction.message.partial) await reaction.message.fetch();

    // cache reaction (fetches potentially defunct resources)
    if (reaction.partial) await reaction.fetch();

    // easy access of message
    const message = reaction.message;

    // if not star, return
    if (reaction.emoji.name != `⭐`) return;

    // look for "starboard"
    const starChannel = client.guilds.cache.get(message.guild.id).channels.cache.find(channel => channel.name == `starboard`);

    // if no starboard found
    if (!starChannel) return message.channel.send(new Discord.MessageEmbed()
        .setDescription(`<:cross:729019052571492434> Unable to find a valid \`#starboard\` channel`)
        .setColor(`#FF3838`));

    // fetch last 100 embeds in starChannel
    const fetch = await starChannel.messages.fetch({ limit: 100 });

    // check if previous embed with same message
    const stars = fetch.filter((m) => m.embeds.length != 0).find((m) => m.embeds[0].footer && m.embeds[0].footer.text.includes(message.id));

    if (stars) {
        // if message already starred

        // check star amount
        const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);

        // store previous embed
        const foundStar = stars.embeds[0];

        // construct new embed to edit old one with
        const embed = new Discord.MessageEmbed()
            .setColor(foundStar.color)
            .setDescription(foundStar.description)
            .addField(`Channel`, message.channel, true)
            .addField(`Source`, `[Jump](${message.url})`, true)
            .setAuthor(message.author.username, message.author.avatarURL())
            .setTimestamp()
            .setFooter(`⭐ ${parseInt(star[1]) + 1} | ${message.id}`)
            .setImage(checkImage(foundStar));

        // fetch previous embed's ID
        const starMsg = await starChannel.messages.fetch(stars.id);

        // edit old embed with new one
        await starMsg.edit({ embed });
    } else {
        // check for attachment
        var image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';

        // if embed exists
        if (image == '' && message.embeds.length > 0 && message.embeds[0].image) {
            // if embed has full image
            image = message.embeds[0].image.url;
        } else if (image == '' && message.embeds.length > 0 && message.embeds[0].thumbnail) {
            // if embed has thumbnail
            image = message.embeds[0].thumbnail.url;
        }

        const embed = new Discord.MessageEmbed()
            .setColor(15844367)
            .setDescription(getDescription(message))
            .addField(`Channel`, message.channel, true)
            .addField(`Source`, `[Jump](${message.url})`, true)
            .setAuthor(message.author.username, message.author.avatarURL())
            .setTimestamp()
            .setFooter(`⭐ ${reaction.count} | ${message.id}`)
            .setImage(image);
        await starChannel.send({ embed });
    }
});

client.on(`messageReactionRemove`, async reaction => {
    // ready check attachments function 
    function extension(reaction, attachment) {
        const imageLink = attachment.split('.');
        const typeOfImage = imageLink[imageLink.length - 1];
        const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
        if (!image) return '';
        return attachment;
    }

    function getDescription(message) {
        if (message.cleanContent.length < 1 && message.embeds.length > 0) {
            // If starred message is an embed
            let constructed = ``;
            let embed = message.embeds[0];

            if (embed.author) constructed += `**${embed.author.name}**`;
            if (embed.title) constructed += `\n\n**${embed.title}**`;
            if (embed.description) constructed += `\n${embed.description}`;

            return constructed;
        } else if (message.cleanContent.length < 1 && message.attachments.array()[0]) {
            // If attachment detected
            return `[${message.attachments.array()[0].name}](${message.attachments.array()[0].url})`;
        } else {
            // If only text
            return message.cleanContent;
        }
    }

    function checkImage(embed) {
        if (embed.image && embed.image.url) {
            return embed.image.url;
        } else {
            return "";
        }
    }

    // if uncached message
    if (reaction.message.partial) await reaction.message.fetch();

    // cache reaction (fetches potentially defunct resources)
    if (reaction.partial) await reaction.fetch();

    // easy access of message
    const message = reaction.message;

    // if not star, return
    if (reaction.emoji.name != `⭐`) return;

    // look for "starboard"
    const starChannel = client.guilds.cache.get(message.guild.id).channels.cache.find(channel => channel.name == `starboard`);

    // if no starboard found
    if (!starChannel) return message.channel.send(new Discord.MessageEmbed()
        .setDescription(`<:cross:729019052571492434> Unable to find a valid \`#starboard\` channel`)
        .setColor(`#FF3838`));

    // fetch last 100 embeds in starChannel
    const fetch = await starChannel.messages.fetch({ limit: 100 });

    // check if previous embed with same message
    const stars = fetch.filter((m) => m.embeds.length != 0).find((m) => m.embeds[0].footer && m.embeds[0].footer.text.includes(message.id));

    if (stars) {
        // if message already starred

        // check star amount
        const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);

        // store previous embed
        const foundStar = stars.embeds[0];

        if (star[1] > 1) {
            // construct new embed to edit old one with
            const embed = new Discord.MessageEmbed()
                .setColor(foundStar.color)
                .setDescription(foundStar.description)
                .addField(`Channel`, message.channel, true)
                .addField(`Source`, `[Jump](${message.url})`, true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setTimestamp()
                .setFooter(`⭐ ${parseInt(star[1]) - 1} | ${message.id}`)
                .setImage(checkImage(foundStar));

            // fetch previous embed's ID
            const starMsg = await starChannel.messages.fetch(stars.id);

            // edit old embed with new one
            await starMsg.edit({ embed });
        } else {
            // fetch previous embed's ID
            const starMsg = await starChannel.messages.fetch(stars.id);

            // edit old embed with new one
            await starMsg.delete();
        }

    }
});
//#endregion

//#region Client on message
client.on('message', message => {

    // If client is not ready to accept commands or process data
    if (!clientReady) return;

    // If the message's guild is not available
    if (!message.guild.available) return;

    // Read serverConfig.json
    let serverConfig = JSON.parse(fs.readFileSync(`./config/serverConfig.json`, `utf8`));

    // If server not registered
    if (!serverConfig[message.guild.id]) {
        logger.info(chalk.bgWhiteBright.black(`New server registered with serverConfig\nName: "${message.guild.name}"\nID: ${message.guild.id}`));

        // Register server with default prefix
        serverConfig[message.guild.id] = {
            name: message.guild.name,
            prefix: config.get(`Bot.prefix`)
        };

        // Write to serverConfig.json
        fs.writeFile(`./config/serverConfig.json`, JSON.stringify(serverConfig, null, `\t`), err => {
            if (err) logger.error(err);
        });
    }

    // If server name changed
    if (serverConfig[message.guild.id] && serverConfig[message.guild.id].name != message.guild.name) {
        logger.info(chalk.bgWhiteBright.black(`Updating server in serverConfig\nPrevious Name: "${serverConfig[message.guild.id].name}"\nNew Name: "${message.guild.name}"\nID: ${message.guild.id}`));

        // Update server config with new name
        serverConfig[message.guild.id] = {
            name: message.guild.name,
            prefix: serverConfig[message.guild.id].prefix
        };

        // Write to serverConfig.json
        fs.writeFile(`./config/serverConfig.json`, JSON.stringify(serverConfig, null, `\t`), err => {
            if (err) logger.error(err);
        });
    }

    let prefix = serverConfig[message.guild.id].prefix;

    if (message.content.toLowerCase().includes("banana")) {
        message.react('🍌')
            .then(() => (message.react('🇴')))
            .then(() => (message.react('🇼'))
                .then(() => message.react('🅾️')));
    }

    if (message.author.id == `569277281046888488`) {
        let rand = Math.floor(Math.random() * (4 - 1) + 1);

        switch (rand) {
            case 1:
                return message.channel.send(`https://tenor.com/view/the-room-what-astory-mark-haha-gif-10493980`);
            case 2:
                return message.channel.send(`https://tenor.com/view/haha-what-astory-gif-11633875`);
            case 3:
                return message.channel.send(`https://tenor.com/view/theroom-himark-what-astory-gif-13403343`);
            case 4:
                return message.channel.send(`https://tenor.com/view/laughing-what-astory-gif-10783591`);
        }

    }

    // Return if message from bot
    if (message.author.bot) return;

    // Award money for activity
    if (message.attachments.array()[0]) {
        currency.add(message.author.id, Math.floor((message.content.length / 10)) + 10);
    } else if (message.content.length >= 5) {
        if (Math.floor(message.content.length / 10) < 1) {
            currency.add(message.author.id, 1);
        } else {
            currency.add(message.author.id, Math.floor((message.content.length / 10)));
        }
    }

    // If message is only bot mention, show prefix
    if (message.content == "<@!641137495886528513>") {
        return message.channel.send(new Discord.MessageEmbed()
            .setDescription(`:information_source: The prefix for the server \`${message.guild.name}\` is currently \`${prefix}\``)
            .setColor(`#0083FF`));
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
    if (!command.enabled && (message.author.id != ownerID && message.author.id != jahyID && message.author.id != fookID)) {
        logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`${prefix}${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Command is disabled`)}`);
        return message.channel.send(new Discord.MessageEmbed()
            .setDescription(`<:cross:729019052571492434> Sorry, \`!${commandName}\` is disabled`)
            .setColor(`#FF3838`));
    }

    // If guild-only, no DMs allowed
    if (command.guildOnly && message.channel.type !== 'text') {
        logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`${prefix}${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Command is guild-only`)}`);
        return message.channel.send(new Discord.MessageEmbed()
            .setDescription(`<:cross:729019052571492434> Sorry, that command is only usable in servers`)
            .setColor(`#FF3838`));
    }

    // If command needs arguments
    if (command.args && !args.length) {
        logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`${prefix}${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Improper usage`)}`);
        let noArgs = new Discord.MessageEmbed();
        let msg = `You didn't use \`${prefix}${command.name}\` correctly, ${message.author.username}`;

        if (command.usage) {
            msg += `\n\nThe proper usage would be:\n\`${prefix}${command.name} ${command.usage}\``;
        }

        if (command.altUsage) {
            msg += `\n*Or alternatively*\n\`${prefix}${command.name} ${command.altUsage}\``;
        }

        noArgs.setDescription(msg);
        noArgs.setAuthor(`Improper usage`, client.user.avatarURL());

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
            let cooldownEmbed = new Discord.MessageEmbed()
                .addField(`<:cross:729019052571492434> Command cooldown`, `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`)
                .setColor(`#FF3838`);
            return message.channel.send(cooldownEmbed);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // If command has permission restrictions
    if (command.restrictions && message.member.id != ownerID) {
        if (command.restrictions.resolvable && command.restrictions.resolvable.length > 0 && !message.member.hasPermission(command.restrictions.resolvable)) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Sorry, ${message.author.username}, you do not have the required permission(s) to use \`${prefix}${command.name}\`\n\nPermissions required:\n\`${command.restrictions.resolvable.join("\n")}\``)
                .setColor(`#FF3838`));
        } else if (command.restrictions.id && command.restrictions.id.length > 0) {
            const match = (element) => element == message.author.id;
            if (!command.restrictions.id.some(match)) {
                return message.channel.send(new Discord.MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> Sorry, ${message.author.username}, only certain users can use \`${prefix}${command.name}\``)
                    .setColor(`#FF3838`));
            }
        }
    }

    // Attempt to execute command
    try {
        logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}`);
        command.execute(message, args);
    } catch (error) {
        logger.error(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${commandName}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}${chalk.whiteBright.bgRedBright(`Command errored`)}`);
        logger.error(error);
        let errorEmbed = new Discord.MessageEmbed()
            .setDescription(`<:cross:729019052571492434> Error executing command\n\n\`\`\`${error}\`\`\``)
            .setColor(`#FF3838`);
        message.channel.send(errorEmbed);
    }
});
//#endregion

//#region Login
logger.debug(chalk.black.bgGray(`Logging in to Discord...`));
client.login(token);
//#endregion