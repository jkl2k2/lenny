// Load discord.js library and load config
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, api, ownerID, jahyID } = require('./config.json');

var queue = [];

// Initialize client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// Global variables
// var queue = [];

var dispatcher = undefined;

function playMusic(){
    if(queue[0].getType() == undefined || queue[0].getType() == false) {
        dispatcher = message.member.voiceChannel.connection.playStream(ytdl(queue[0].videoUrl, {filters: "audioonly"}));
    } else if (queue[0].getType() == "live") {
        dispatcher = message.member.voiceChannel.connection.playStream(ytdl(queue[0].videoUrl, {quality: 95}));
    } else {
        message.channel.send("Error assigning dispatcher");
    }
    sendDetails(queue[0], message.channel).catch(function(error) {
        console.error(`${error}Failed to send video details\nTimestamp of error: timestamp`)
    });
    queue.shift();

    message.member.voiceChannel.connection.player.streamingData.pausedTime = 0;

    dispatcher.on("end", function() {
        if(queue[0]) {
            playMusic();
        }
    });
}

function readIndexQueue(thingToPush) {
    queue.push(thingToPush);
    console.log(queue);
}

function handleVC(discordMessage) {
    if (discordMessage.member.voiceChannel) {
        discordMessage.member.voiceChannel.join()
            .then(connection => {
                if(!connection.speaking) {
                    playMusic();
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

// Functions
module.exports = {
    constructVideo: async function (title, url, type, requester) {
        return new YTVideo(title, url, type, requester);
    },
    pushQueue: function (toPush) {
        queue.push(toPush);
        console.log("pushed: " + toPush);
    },
    sendDetails: function (input, c) {
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
    callHandleVC: function (discordMessage) {
        handleVC(discordMessage);
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

// On ready
client.once('ready', () => {
    console.log("// Bot initialized //");
});

// On message
client.on('message', message => {
    // Return if no prefix or said by bot
	if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Put args into array
    const args = message.content.slice(prefix.length).split(/ +/);
    
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

client.login(token);