// Load discord.js library and load config
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, api, ownerID, jahyID } = require('./config.json');
const ytdl = require("ytdl-core-discord");
const { YouTube } = require('better-youtube-api');
const youtube = new YouTube(api);
var ffmpeg = require('ffmpeg-static');
console.log(ffmpeg.path);

var queue = [];

// Initialize client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// Global variables
// var queue = [];

var dispatcher;

var serverMessage;

class YTVideo {
	constructor(videoTitle, videoUrl, type, requester) {
		this.videoTitle = videoTitle;
		this.videoUrl = videoUrl;
		this.type = type;
		this.requester = requester;
	}
	getTitle() {
		return this.videoTitle;
	}
	getURL() {
		return this.videoUrl;
	}
	getRequester() {
		return this.requester;
	}
	getRequesterName() {
		return this.requester.username;
	}
	getType() {
		return this.type;
	}
}
function sendDetails(input, c) {
    var musicEmbed = new Discord.RichEmbed()
            .setColor(`#00c292`)
            .setTitle(` `)
            .addField(`:arrow_forward: **Now playing**`, `[${input.getTitle()}](${input.getURL()})`)
            .setFooter(`Requested by ${input.getRequesterName()} • timestamp`)
    c.send(musicEmbed);
}

async function playMusic(disabled){
    // console.log(message);
    // console.log(serverMessage);
    if(queue == undefined) {
        console.log("playMusic() called, but queue undefined");
        return;
    }
    if(queue[0] == undefined) {
        console.log("playMusic() called, but queue[0] is undefined");
        return;
    }
    if(queue[0].getType() == undefined || queue[0].getType() == false) {
        dispatcher = serverMessage.member.voiceChannel.connection.playOpusStream(await ytdl(queue[0].videoUrl));
    } else if (queue[0].getType() == "live") {
        dispatcher = serverMessage.member.voiceChannel.connection.playOpusStream(await ytdl(queue[0].videoUrl, {quality: 95}));
    } else {
        serverMessage.channel.send("Error assigning dispatcher");
    }
    
    sendDetails(queue[0], serverMessage.channel)
    queue.shift();
    
    serverMessage.member.voiceChannel.connection.player.streamingData.pausedTime = 0;

    dispatcher.on("end", function() {
        if(queue[0]) {
            playMusic();
        }
    });
}

function handleVC(discordMessage) {
    if (discordMessage.member.voiceChannel) {
        discordMessage.member.voiceChannel.join()
            .then(connection => {
                if(!connection.speaking) {
                    playMusic(discordMessage);
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

async function handleVideoNoPlaylist(method, message, args) {
    var videoResult = await youtube.getVideo(args.join(" "));

    let newVideo = new YTVideo(videoResult.title, videoResult.url, videoResult.liveStatus, message.author);

    if(method === "playnow") {
        queue.unshift(newVideo);
        endDispatcher(message.channel, message.author, "playnow");
    } else if(method === "playnext") {
        queue.unshift(newVideo);
    } else {
        queue.push(newVideo);
    }

    var playEmbed = new Discord.RichEmbed()
    .setColor(`#00c292`)
    .setTitle(` `)
    .addField(`**:arrow_up_small: Queued**`, `[${newVideo.getTitle()}](${newVideo.getURL()})`)
    .setFooter(`Requested by ${newVideo.getRequesterName()} • timestamp`)
    message.channel.send(playEmbed);

}

function readIndexQueue(thingToPush) {
    queue.push(thingToPush);
    console.log(queue);
}

function onlyJoinVC(message) {
    if(message.member.voiceChannel) {
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

    handleVideoNoPlaylist(method, message, args);

    
    setTimeout(function () {
        handleVC(message);
    }, 500)
}

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
            .setFooter(`Requested by requester • timestamp`)
        c.send(musicEmbed);
        // nowPlayingEmbed = musicEmbed;
    },
    endDispatcher: function (c, author, method) {
        if(dispatcher != undefined && dispatcher.speaking == true){
            if(method == "skip") {
                let endDispatcherEmbed = new Discord.RichEmbed()
                .setTitle(`:fast_forward: **${author} skipped the current song**`)
                .setColor(`#44C408`)
                c.send(endDispatcherEmbed);
            } else if(method == "skipall") {
                let endDispatcherEmbed = new Discord.RichEmbed()
                .setTitle(`:fast_forward: **${author} emptied the queue and skipped everything**`)
                .setColor(`#44C408`)
                c.send(endDispatcherEmbed);
            } else if(method == "playnow") {
                let endDispatcherEmbed = new Discord.RichEmbed()
                .setTitle(`:fast_forward: **${author} force played a song**`)
                .setColor(`#44C408`)
                c.send(endDispatcherEmbed);
            }
    
            setTimeout(function() {
                dispatcher.end();
            }, 500);
    
        } else {
            let endDispatcherEmbed = new Discord.RichEmbed()
                .setTitle(`:eyes: ${author}, there's nothing to skip, dumbo`)
                .setColor(`#FF0000`)
            c.send(endDispatcherEmbed);
        }
    },
    callQueueRead: function (toPush) {
        readIndexQueue(toPush);
    },
    callJoinVC: function (discordMessage) {
        onlyJoinVC(discordMessage);
    },
    playCommand: function (method, message, args) {
        // serverMessage = message;
        // console.log(serverMessage);
        handlePlayCommand(method, message, args);
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

// Handle uncaught promise rejection
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

client.login(token);