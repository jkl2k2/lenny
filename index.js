// Load discord.js library and load config
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, api, ownerID, jahyID } = require('./config.json');
const ytdl = require("ytdl-core-discord");
const { YouTube } = require('better-youtube-api');
const youtube = new YouTube(api);
var ffmpeg = require('ffmpeg-static');
const prism = require('prism-media');

var queue = [];

// Initialize client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// Global variables
// var queue = [];

const activities_list = [
    "with Cat!",
    "Cat's PC melt",
    "trash music",
    "Russian spies",
    "your private convos",
    "Sege"
];

const activities_list_types = [
    "PLAYING",
    "WATCHING",
    "LISTENING",
    "LISTENING",
    "WATCHING",
    "PLAYING"
];

var dispatcher;

var serverMessage;

class YTVideo {
    constructor(video, requester) {
        this.video = video;
        this.requester = requester;
    }
    getTitle() {
        return this.video.title;
    }
    getURL() {
        return this.video.url;
    }
    getRequester() {
        return this.requester;
    }
    getRequesterName() {
        return this.requester.username;
    }
    getType() {
        return this.video.liveStatus;
    }
    getThumbnail() {
        return this.video.thumbnails.default.url;
    }
    async getChannelName() {
        var id = `${this.video.channelId}`;
        var resolved = await youtube.getChannel(id);
        return resolved.name;
    }
    getChannelURL() {
        return `https://www.youtube.com/channel/${this.video.channelId}`;
    }
    getVideo() {
        return this.video;
    }
}

// Fisher-Yates Shuffle
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function endDispatcher(c, author, method) {
    if (dispatcher != undefined && dispatcher.speaking == true) {
        if (method == "skip") {
            let endDispatcherEmbed = new Discord.RichEmbed()
                .setTitle(`:fast_forward: **${author} skipped the current song**`)
                .setColor(`#44C408`)
            c.send(endDispatcherEmbed);
        } else if (method == "skipall") {
            queue = [];
            let endDispatcherEmbed = new Discord.RichEmbed()
                .setTitle(`:fast_forward: **${author} emptied the queue and skipped everything**`)
                .setColor(`#44C408`)
            c.send(endDispatcherEmbed);
        } else if (method == "playnow") {
            let endDispatcherEmbed = new Discord.RichEmbed()
                .setTitle(`:fast_forward: **${author} force played a song**`)
                .setColor(`#44C408`)
            c.send(endDispatcherEmbed);
        }

        dispatcher.end();

    } else {
        let endDispatcherEmbed = new Discord.RichEmbed()
            .setTitle(`:eyes: ${author}, there's nothing to skip, dumbo`)
            .setColor(`#FF0000`)
        c.send(endDispatcherEmbed);
    }
}

async function sendDetails(input, c) {
    var musicEmbed = new Discord.RichEmbed()
        .setColor(`#00c292`)
        .setTitle(` `)
        .addField(`:arrow_forward: **Now playing**`, `[${input.getTitle()}](${input.getURL()})`)
        .addField(`Uploader`, `[${await input.getChannelName()}](${input.getChannelURL()})`)
        .setThumbnail(input.getThumbnail())
        .setTimestamp()
        .setFooter(`Requested by ${input.getRequesterName()}`)
    c.send(musicEmbed);
}

function handleVolume(volume) {
    var newVolume = volume / 100;
    if ((volume >= 0 && volume <= 500) || serverMessage.author.id == jahyID) {
        dispatcher.setVolume(newVolume);
        let vEmbed = new Discord.RichEmbed()
            .setTitle(`:loud_sound: Set volume to ${volume}%`)
            .setColor(`#44C408`)
        serverMessage.channel.send(vEmbed);
    } else {
        let vEmbed = new Discord.RichEmbed()
            .setTitle(`:no_entry: You can't set the volume to that number`)
            .setColor(`#FF0000`)
        serverMessage.channel.send(vEmbed);
    }
}

function queueResolver(arr, index) {
    if (arr[index]) {
        return `${index + 1}. [${arr[index].getTitle()}](${arr[index].getURL()})`;
    } else {
        return " ";
    }
}

function queueOverflowResolver(arr) {
    if (arr.length <= 5) {
        return " ";
    } else if (arr.length > 5) {
        return `**Plus ${arr.length - 5} more songs**`;
    }
}

async function playMusic(disabled) {
    // console.log(message);
    // console.log(serverMessage);
    if (queue == undefined) {
        console.log("playMusic() called, but queue undefined");
        return;
    }
    if (queue[0] == undefined) {
        console.log("playMusic() called, but queue[0] is undefined");
        return;
    }
    if (queue[0].getType() == undefined || queue[0].getType() == false) {
        // dispatcher = serverMessage.member.voiceChannel.connection.playOpusStream(await ytdl(queue[0].videoUrl));
        let input = await ytdl(queue[0].getURL());
        const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
        dispatcher = serverMessage.member.voiceChannel.connection.playConvertedStream(pcm);
    } else if (queue[0].getType() == "live") {
        // dispatcher = serverMessage.member.voiceChannel.connection.playOpusStream(await ytdl(queue[0].videoUrl, {quality: 95}));
        let input = await ytdl(queue[0].getURL(), { quality: 93 });
        const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
        dispatcher = serverMessage.member.voiceChannel.connection.playConvertedStream(pcm);
    } else {
        serverMessage.channel.send("Error assigning dispatcher");
    }

    sendDetails(queue[0], serverMessage.channel);
    queue.shift();

    serverMessage.member.voiceChannel.connection.player.streamingData.pausedTime = 0;

    dispatcher.on("end", function () {
        if (queue[0]) {
            playMusic();
        }
    });
}

function handleVC(discordMessage) {
    if (discordMessage.member.voiceChannel) {
        discordMessage.member.voiceChannel.join()
            .then(connection => {
                if (!connection.speaking) {
                    setTimeout(function () {
                        playMusic(discordMessage);
                    }, 250);

                }
            })
            .catch(`${console.log} Timestamp: timestamp`);
    } else {
        let vcFailEmbed = new Discord.RichEmbed()
            .setTitle(`:warning: ${discordMessage.author.username}, you are not in a voice channel. Your video has been queued, but I am unable to join you.`)
            .setColor(`#FF0000`)
        discordMessage.channel.send(vcFailEmbed);
    }
}

async function handlePlaylist(message, args) {
    var playlistInfo = await youtube.getPlaylist(args[0]);
    var playlistArray = await youtube.getPlaylistItems(args[0]).catch(function (error) {
        console.error(`${error}`);
    });

    var listEmbed = new Discord.RichEmbed()
        .setColor(`#00c292`)
        .setTitle(` `)
        .addField(`:arrow_up_small: **Playlist added to queue (${playlistInfo.length} songs)**`, `[${playlistInfo.title}](${args[0]})`)
        .setThumbnail(playlistInfo.thumbnails.default.url)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.username}`)
    message.channel.send(listEmbed);

    var listProcessingEmbed = new Discord.RichEmbed()
        .setTitle(`:arrows_counterclockwise: Please wait while your playlist is being processed`)
        .setColor(`#FF0000`)

    var listProcessingMessage = await message.channel.send(listProcessingEmbed);

    for (var i = 0; i < playlistArray.length; i++) {
        // let playlistVideo = new YTVideo(await playlistArray[i].title, await playlistArray[i].url, playlistArray[i].liveStatus, message.author);
        let playlistVideo = new YTVideo(playlistArray[i], message.author);
        queue.push(playlistVideo);

        // DEBUG - CAUSES SPAM
        // message.channel.send(`EXPECTED OUTCOME:\n\nQueued video with title ${await playlistArray.videos[i].title}\nURL of queued video is: ${await playlistArray.videos[i].url}\n\nRESULT:\n\nQueued video with title ${await videoRequestObject.videoTitle}\nURL of queued video is: ${await videoRequestObject.videoUrl}`);

    }
    let newProcessingEmbed = new Discord.RichEmbed()
        .setTitle(`:white_check_mark: The playlist has finished processing!`)
        .setColor(`#44C408`)
    listProcessingMessage.edit(newProcessingEmbed);
    // message.channel.send(newProcessingEmbed);
}

async function handleVideoNoPlaylist(method, message, args) {
    var videoResult = await youtube.getVideo(args.join(" "));

    // let newVideo = new YTVideo(videoResult.title, videoResult.url, videoResult.liveStatus, message.author);
    let newVideo = new YTVideo(videoResult, message.author);
    if (method === "playnow") {
        queue.unshift(newVideo);
        endDispatcher(message.channel, message.author.username, "playnow");
    } else if (method === "playnext") {
        queue.unshift(newVideo);
    } else {
        queue.push(newVideo);
    }

    var playEmbed = new Discord.RichEmbed()
        .setColor(`#00c292`)
        .setTitle(` `)
        .addField(`**:arrow_up_small: Queued**`, `[${newVideo.getTitle()}](${newVideo.getURL()})`)
        .addField(`Uploader`, `[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})`)
        .setThumbnail(newVideo.getThumbnail())
        .setTimestamp()
        .setFooter(`Requested by ${newVideo.getRequesterName()}`)
    message.channel.send(playEmbed);

}

function readIndexQueue(thingToPush) {
    queue.push(thingToPush);
    console.log(queue);
}

function onlyJoinVC(message) {
    if (message.member.voiceChannel) {
        message.member.voiceChannel.join();
        let joinEmbed = new Discord.RichEmbed()
            .setTitle(`:white_check_mark: **I joined your channel, ${message.author.username}**`)
            .setColor(`#44C408`)
        message.channel.send(joinEmbed);
    } else {
        message.channel.send(`:eyes: ${message.author}, I can't join your VC if you're not in a VC, ya doofus`);
    }
}

async function handlePlayCommand(method, message, args) {
    if (args[0] == undefined) {
        let undefArgsEmbed = new Discord.RichEmbed()
            .setTitle(`:eyes: ${message.author.username}, please include at least one search term or URL`)
            .setColor(`#FF0000`)
        message.channel.send(undefArgsEmbed);

        return;
    }

    if (args[0].includes("playlist?list=")) {
        handlePlaylist(message, args);
        setTimeout(function () {
            handleVC(message);
        }, 1000)
    } else {
        handleVideoNoPlaylist(method, message, args);
        setTimeout(function () {
            handleVC(message);
        }, 500)
    }
}

function pauseDispatcher(message) {
    if (dispatcher != undefined && dispatcher.paused == false) {
        dispatcher.pause();
        let pauseEmbed = new Discord.RichEmbed()
            .setTitle(`:pause_button: ${message.author.username} paused playback`)
            .setColor(`#44C408`)
        message.channel.send(pauseEmbed);
    } else {
        let pauseFailEmbed = new Discord.RichEmbed()
            .setTitle(`:no_entry: ${message.author.username}, the music is already paused`)
            .setColor(`#FF0000`)
        message.channel.send(pauseFailEmbed);
    }
}

function resumeDispatcher(message) {
    if (dispatcher != undefined && dispatcher.paused == true) {
        dispatcher.resume();
        let resumeEmbed = new Discord.RichEmbed()
            .setTitle(`:arrow_forward: ${message.author.username} resumed playback`)
            .setColor(`#44C408`)
        message.channel.send(resumeEmbed);
    } else {
        let resumeFailEmbed = new Discord.RichEmbed()
            .setTitle(`:no_entry: ${message.author.username}, the music is already playing`)
            .setColor(`#FF0000`)
        message.channel.send(resumeFailEmbed);
    }
}

client.on("playlistReady", () => {
    handleVC(servermessage);
});

// Functions
module.exports = {
    constructVideo: async function (title, url, type, requester) {
        return new YTVideo(title, url, type, requester);
    },
    pushQueue: function (toPush) {
        queue.push(toPush);
        console.log("pushed: " + toPush);
    },
    sendDetailsExport: function (input, c) {
        var musicEmbed = new Discord.RichEmbed()
            .setColor(`#00c292`)
            .setTitle(` `)
            .addField(`:arrow_forward: **Now playing**`, `[title](url)`)
            .setTimestamp()
            .setFooter(`Requested by requester`)
        c.send(musicEmbed);
        // nowPlayingEmbed = musicEmbed;
    },
    callEndDispatcher: function (c, author, method) {
        endDispatcher(c, author, method);
    },
    callQueueRead: function (toPush) {
        readIndexQueue(toPush);
    },
    playCommand: function (method, message, args) {
        // serverMessage = message;
        // console.log(serverMessage);
        handlePlayCommand(method, message, args);
    },
    changeVolume: function (volume) {
        handleVolume(volume);
    },
    viewQueue: function () {
        if (queue.length == 0) {
            let emptyQueueEmbed = new Discord.RichEmbed()
                .setTitle(`:information_source: **The queue is currently empty**`)
                .setColor(`#0083FF`)
                .setTimestamp()
                .setFooter(`Use /play to request songs or playlists!`)
            serverMessage.channel.send(emptyQueueEmbed);
        } else {
            let queueEmbed = new Discord.RichEmbed()
                .setTitle(`**:information_source: Current queue**`)
                // .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
                .setDescription(`${queueResolver(queue, 0)}\n\n${queueResolver(queue, 1)}\n\n${queueResolver(queue, 2)}\n\n${queueResolver(queue, 3)}\n\n${queueResolver(queue, 4)}\n\n${queueOverflowResolver(queue)}`)
                .setColor(`#0083FF`)
                .setTimestamp()
                .setFooter(`Use /play to request songs or playlists`)
            // message.channel.send(`Current queue: ${parsedQueue[0]}\n\nComing up next: ${parsedQueue[1]}`);
            serverMessage.channel.send(queueEmbed);
        }
    },
    removeFromQueue: function (target) {
        if (queue[target - 1] == undefined) {
            let indexDNEEmbed = new Discord.RichEmbed()
                .setTitle(`:no_entry: Index ${target - 1} of array with given input ${target} does not exist`)
                .setTimestamp()
                .setFooter(`Requested by ${serverMessage.author.username}`)
                .setColor(`#FF0000`);
            serverMessage.channel.send(indexDNEEmbed);
            return;
        }
        var elementToRemove = queue[target - 1];
        queue.splice(target - 1, 1);
        if (elementToRemove != queue[target]) {
            let queueRemoveEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`:white_check_mark: **Successfully removed from queue**`, `[${elementToRemove.getTitle()}](${elementToRemove.getURL()})`)
                .setTimestamp()
                .setFooter(`Requested by ${serverMessage.author.username}`)
                .setColor(`#44C408`)
            serverMessage.channel.send(queueRemoveEmbed);
            // message.reply(`successfully removed "${elementToRemove.videoTitle}" from queue!`);
        } else {
            let queueRemoveEmbed = new Discord.RichEmbed()
                .setTitle(`Somehow, I failed to remove "[${elementToRemove.getTitle()}](${elementToRemove.getURL()})" from queue. This should never happen.`)
                .setTimestamp()
                .setFooter(`Requested by ${serverMessage.author.username}`)
                .setColor(`#FF0000`);
            serverMessage.channel.send(queueRemoveEmbed);
            // message.reply(`:thinking: I don't understand.`);
        }
    },
    shuffleQueue: function (message) {
        if (queue.length > 0) {
            queue = shuffle(queue);
            let shuffleCompleteEmbed = new Discord.RichEmbed()
                .setTitle(`:white_check_mark: **Shuffled ${queue.length} songs in queue**`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.username}`)
                .setColor(`#44C408`)
            message.channel.send(shuffleCompleteEmbed);
        } else {
            let shuffleFailEmbed = new Discord.RichEmbed()
                .setTitle(`:no_entry: **Cannot shuffle an empty queue**`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.username}`)
                .setColor(`#FF0000`)
            message.channel.send(shuffleFailEmbed);
        }
    },
    pauseMusic: function (message) {
        pauseDispatcher(message);
    },
    resumeMusic: function (message) {
        resumeDispatcher(message);
    }
};

// Load all command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

// On ready
client.once('ready', () => {
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // random number between 1 and array length
        client.user.setActivity(activities_list[index], { type: activities_list_types[index] }); // sets bot's activities to one of the phrases in the arraylist
    }, 15000); // Time interval
    console.log("// Bot initialized //");
});

// On message
client.on('message', message => {
    // Return if no prefix or said by bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    serverMessage = message;

    // Put args into array
    const args = message.content.slice(prefix.length).split(/ +/);

    console.log(args);

    // Extract command name
    const commandName = args.shift().toLowerCase();

    // Check if valid command or alias
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Return if not valid command
    if (!command) return;

    // If guild-only, no DMs allowed
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    // If command needs arguments
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
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
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Attempt to execute command
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

// Handle uncaught promise rejections
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

client.login(token);