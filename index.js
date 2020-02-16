// Load discord.js library and load config
const fs = require('fs');
const Discord = require('discord.js');
const config = require('config');
// const ytdl = require("ytdl-core-discord");
const ytdl = require("ytdl-core");
const prism = require('prism-media');

// Initialize client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// Global variables
var queue = [];
var repeat = false;

const prefix = config.get(`Bot.prefix`);
const token = config.get(`Bot.token`);
const ownerID = config.get(`Users.ownerID`);

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

const activities = [
    new Activity("with Cat!", "PLAYING"),
    new Activity("Sege", "PLAYING"),
    new Activity("Cat's PC melt", "WATCHING"),
    new Activity("your private convos", "WATCHING"),
    new Activity("trash music", "LISTENING"),
    new Activity("Russian spies", "LISTENING")
];

var dispatcher;
var lastDetails;
var lastPlayed;
// var lastMusicMessage;

async function sendDetails(input, c) {
    if (input.getLength() == `unknown`) {
        var musicEmbed = new Discord.RichEmbed()
            // .setColor(`#00c292`)
            .setAuthor(`▶️ Now playing`)
            // .addField(`:arrow_forward: **Now playing**`, `[${input.getTitle()}](${input.getURL()})`)
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**`)
            .addField(`Uploader`, `[${await input.getChannelName()}](${input.getChannelURL()})`, true)
            // .addField(`Length`, `${input.getLength()}`, true)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`)
    } else {
        var musicEmbed = new Discord.RichEmbed()
            // .setColor(`#00c292`)
            .setAuthor(`▶️ Now playing`)
            // .addField(`:arrow_forward: **Now playing**`, `[${input.getTitle()}](${input.getURL()})`)
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**`)
            .addField(`Uploader`, `[${await input.getChannelName()}](${input.getChannelURL()})`, true)
            .addField(`Length`, `${input.getLength()}`, true)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`)
    }
    c.send(musicEmbed);
    lastDetails = musicEmbed;
}

function sendSCDetails(input, c) {
    var scMusicEmbed = new Discord.RichEmbed()
        .setAuthor(`▶️ Now playing`)
        .setDescription(`**[${input.getCleanTitle()}](${input.getURL()})**`)
        .addField(`Uploader`, `[${input.getUploader()}](${input.getUploaderUrl()})`, true)
        .addField(`Length`, input.getLength(), true)
        .setThumbnail(input.getThumbnail())
        .setTimestamp()
        .setFooter(`Requested by ${input.getRequesterName()}`)
    c.send(scMusicEmbed);
    lastDetails = scMusicEmbed;
}

async function playMusic(message) {
    // console.log(message);
    // console.log(lastMusicMessage);

    if (queue == undefined) {
        console.log("playMusic() called, but queue undefined");
        return;
    }

    var count = 0;
    var awaitingLivestream = false;
    var catchingUpMessage;

    if (queue[0] == undefined) {
        console.log("playMusic() called, but queue[0] is undefined");

        var retry = setTimeout(function () {
            if (count < 4) {
                playMusic(message);
                count++;
            } else {
                clearTimeout(retry);
            }
        }, 500);
    } else {
        if (queue[0].getType() == undefined || queue[0].getType() == false) {
            // If regular video

            let input = ytdl(queue[0].getURL(), { quality: "highestaudio", highWaterMark: 1 << 25 });

            var connections = client.voiceConnections.array();

            dispatcher = connections[0].playStream(input);

            sendDetails(queue[0], message.channel);

        } else if (queue[0].getType() == "live") {
            // If YouTube livestream

            let input = ytdl(queue[0].getURL(), { quality: 93, highWaterMark: 1 << 25 });

            var connections = client.voiceConnections.array();

            dispatcher = connections[0].playStream(input);

            sendDetails(queue[0], message.channel);

            let catchingUp = new Discord.RichEmbed()
                .setDescription(`:arrows_counterclockwise: Catching up to livestream`)
                .setFooter(`Just a moment...`)

            catchingUpMessage = await message.channel.send(catchingUp);

            awaitingLivestream = true;

        } else if (queue[0].getType() == "soundcloud") {
            // If SoundCloud
            var connections = client.voiceConnections.array();

            dispatcher = connections[0].playStream(fs.createReadStream(`./soundcloud/${queue[0].getTitle()}`));

            sendSCDetails(queue[0], message.channel);

        } else {
            message.channel.send("Error assigning dispatcher");
        }

        count = 0;

        lastPlayed = queue.shift();
        if (lastPlayed && lastPlayed.getType() == "soundcloud") {
            var path = `./soundcloud/${lastPlayed.getTitle()}`;
        } else {
            var path = " ";
        }

        if (message.member.voiceChannel) {

            message.member.voiceChannel.connection.player.streamingData.pausedTime = 0;

        } else {
            // Fallback in case the original user left voice channel
            var connections = client.voiceConnections.array();
            connections[0].player.streamingData.pausedTime = 0;
        }

        dispatcher.on("end", function () {
            if (repeat) {
                queue.unshift(lastPlayed);
            }
            if (path != " ") {
                fs.unlink(path, (err) => {
                    if (err) {
                        console.error(`FAILED to delete file at path ${path}`);
                        console.error(err);
                        return;
                    }
                    console.log(`Removed file at path ${path}`);
                });
            }
            if (queue[0]) {
                playMusic(message);
            }
        });

        dispatcher.on("start", function () {
            if (awaitingLivestream) {
                let caughtUp = new Discord.RichEmbed()
                    .setDescription(`:white_check_mark: Caught up to livestream`);

                catchingUpMessage.edit(caughtUp);
                awaitingLivestream = false;
            }
        });
    }
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
    getPlaying: function () {
        if (dispatcher && dispatcher.speaking) {
            return lastDetails;
        } else {
            return new Discord.RichEmbed()
                .addField(`:information_source: Nothing is playing`, `Nothing is currently playing`)
                .setColor(`#0083FF`)
        }
    },
    getPlayingVideo: function () {
        return lastPlayed;
    },
    getRepeat: function () {
        return repeat;
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
    },
    setRepeat: function (toSet) {
        repeat = toSet;
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
client.on('ready', () => {
    // Randomly select status
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities.length - 1) + 1);
        client.user.setActivity(activities[index].getText(), { type: activities[index].getFormat() });
        client.user.setStatus("online");
    }, 15000);

    console.log("// Bot initialized //");
});

client.on('error', () => {
    // On connection error
    client.user.setActivity("lost connection...", { type: "PLAYING" });
    client.user.setStatus("dnd");
});

client.on('reconnecting', () => {
    // On reconnecting to Discord
    client.user.setActivity("reconnecting...", { type: "PLAYING" });
    client.user.setStatus("dnd");
});

// On message
client.on('message', message => {
    // Return if message from bot
    if (message.author.bot) return;

    if (message.content.includes("banana")) {
        message.react('🇴')
            .then(() => (message.react('🇼'))
                .then(() => message.react('🅾️')));
    }
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
            // console.log(`No star detected on a message after 48 hours or message failed to send`);
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
        let serverOnly = new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Sorry, that command is only usable in servers`)
            .setColor(`#FF0000`);
        return message.channel.send(serverOnly);
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