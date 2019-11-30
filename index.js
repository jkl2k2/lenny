// Load discord.js library and load config
const fs = require('fs');
const Discord = require('discord.js');
const config = require('config');
const ytdl = require("ytdl-core-discord");
const prism = require('prism-media');

// Initialize client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// Global variables
var queue = [];

const prefix = config.get(`Bot.prefix`);
const token = config.get(`Bot.token`);
const ownerID = config.get(`Users.ownerID`);

class activity {
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

const activities = [
    new activity("with Cat!", "PLAYING"),
    new activity("Sege", "PLAYING"),
    new activity("Cat's PC melt", "WATCHING"),
    new activity("your private convos", "WATCHING"),
    new activity("trash music", "LISTENING"),
    new activity("Russian spies", "LISTENING")
];

var dispatcher;

var lastMusicMessage;

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

async function playMusic(message) {
    // console.log(message);
    // console.log(lastMusicMessage);

    if (queue == undefined) {
        console.log("playMusic() called, but queue undefined");
        return;
    }
    if (queue[0] == undefined) {
        console.log("playMusic() called, but queue[0] is undefined");
        setTimeout(function () {
            playMusic(message);
        }, 100);
    }
    if (queue[0].getType() == undefined || queue[0].getType() == false) {
        let input = await ytdl(queue[0].getURL());
        const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
        var connectionArray = client.voiceConnections.array();
        dispatcher = connectionArray[0].playConvertedStream(pcm);

    } else if (queue[0].getType() == "live") {
        let input = await ytdl(queue[0].getURL(), { quality: 93 });
        const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
        var connectionArray = client.voiceConnections.array();
        dispatcher = connectionArray[0].playConvertedStream(pcm);
    } else {
        message.channel.send("Error assigning dispatcher");
    }

    sendDetails(queue[0], message.channel);
    queue.shift();

    message.member.voiceChannel.connection.player.streamingData.pausedTime = 0;

    dispatcher.on("end", function () {
        if (queue[0]) {
            playMusic(message);
        }
    });
}

// Functions
module.exports = {
    getVolume: function () {
        return dispatcher.volume;
    },
    getQueue: function () {
        return queue;
    },
    getDispatcher: function () {
        return dispatcher;
    },
    getQueue: function () {
        return queue;
    },
    getClient: function () {
        return client;
    },
    setQueue: function (newQueue) {
        queue = newQueue;
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
    endDispatcher: function () {
        dispatcher.end();
    },
    callPlayMusic: function (message) {
        playMusic(message);
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
    // Randomly select status
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities.length - 1) + 1);
        client.user.setActivity(activities[index].getText(), { type: activities[index].getFormat() });
    }, 15000);

    console.log("// Bot initialized //");
});

// On message
client.on('message', message => {
    // Return if message from bot
    if (message.author.bot) return;

    // Declare reaction filter
    const filter = (reaction, user) => {
        return ['⭐'].includes(reaction.emoji.name);
    };

    // Find starboard channel by specific ID
    var starChannel = client.channels.get(`554868648964259861`);

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
                console.log(`User ${message.author.username} reacted with a star`);
            }

            // If starboard channel exists
            if (starChannel) {
                var attachmentsArray = (message.attachments).array();

                // If image attached to message
                if (attachmentsArray[0]) {
                    let starEmbed = new Discord.RichEmbed()
                        .setTitle(`⭐ Starred Message ⭐`)
                        .addField(`Author`, message.author.username)
                        .addField(`Message`, checkContent(message))
                        .setThumbnail(message.author.avatarURL)
                        .setImage(attachmentsArray[0].url)
                        .setColor(`#FCF403`)
                        .setTimestamp()

                    starChannel.send(starEmbed);
                    console.log(`Sent embed with image to starboard`);
                } else {
                    // If image NOT attached to image
                    let starEmbed = new Discord.RichEmbed()
                        .setTitle(`⭐ Starred Message ⭐`)
                        .addField(`Author`, message.author.username)
                        .addField(`Message`, checkContent(message))
                        .setThumbnail(message.author.avatarURL)
                        .setColor(`#FCF403`)
                        .setTimestamp()

                    starChannel.send(starEmbed);
                    console.log(`Sent embed WITHOUT image to starboard`);
                }
            }
        })
        .catch(collected => {
            // message.channel.send(`No star detected`);
            console.log(`No star detected on a message after 48 hours or message failed to send`);
        });

    // Return if no prefix
    if (!message.content.startsWith(prefix)) return;

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
            let cooldownEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`<:error:643341473772863508> Command cooldown`, `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`)
                .setColor(`#FF0000`)
            return message.channel.send(cooldownEmbed);
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