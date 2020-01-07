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
// var lastMusicMessage;

async function sendDetails(input, c) {
    if (input.getLength() == `unknown`) {
        var musicEmbed = new Discord.RichEmbed()
            // .setColor(`#00c292`)
            .setTitle(` `)
            .setAuthor(`▶️ Now playing`)
            // .addField(`:arrow_forward: **Now playing**`, `[${input.getTitle()}](${input.getURL()})`)
            .setDescription(`[${input.getTitle()}](${input.getURL()})`)
            .addField(`Uploader`, `[${await input.getChannelName()}](${input.getChannelURL()})`, true)
            // .addField(`Length`, `${input.getLength()}`, true)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`)
    } else {
        var musicEmbed = new Discord.RichEmbed()
            // .setColor(`#00c292`)
            .setTitle(` `)
            .setAuthor(`▶️ Now playing`)
            // .addField(`:arrow_forward: **Now playing**`, `[${input.getTitle()}](${input.getURL()})`)
            .setDescription(`[${input.getTitle()}](${input.getURL()})`)
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
        .setColor(`#00c292`)
        .setTitle(` `)
        .addField(`:arrow_forward: **Now playing**`, `[${input.getCleanTitle()}](${input.getURL()})`)
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
    }

    if (queue[0].getType() == undefined || queue[0].getType() == false) {
        // console.log("Requested video is normal, not a livestream");
        let input = await ytdl(queue[0].getURL(), { quality: "highestaudio" }).catch(err => {
            console.error(err);
            message.channel.send("Encountered an error attempting to download from YouTube. Probably copyrighted.");
        });
        const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
        var connectionArray = client.voiceConnections.array();
        dispatcher = connectionArray[0].playConvertedStream(pcm);
        // dispatcher = connectionArray[0].playStream(input);
        sendDetails(queue[0], message.channel);
        count = 0;
    } else if (queue[0].getType() == "live") {
        // console.log("Requested video is a livestream");
        let input = await ytdl(queue[0].getURL(), { quality: 93 }).catch(err => {
            console.error(err);
            message.channel.send("Encountered an error attempting to download from YouTube. Probably copyrighted.");
        });
        const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
        var connectionArray = client.voiceConnections.array();
        dispatcher = connectionArray[0].playConvertedStream(pcm);
        // dispatcher = connectionArray[0].playStream(input);
        sendDetails(queue[0], message.channel);
        count = 0;
    } else if (queue[0].getType() == "soundcloud") {
        console.log("Requested SoundCloud song");
        var connectionArray = client.voiceConnections.array();
        dispatcher = connectionArray[0].playStream(fs.createReadStream(`./soundcloud/${queue[0].getTitle()}`));
        sendSCDetails(queue[0], message.channel);
        count = 0;
    } else {
        message.channel.send("Error assigning dispatcher");
        count = 0;
    }

    var lastPlayed = queue.shift();
    if (lastPlayed.getType() == "soundcloud") {
        var path = `./soundcloud/${lastPlayed.getTitle()}`;
    } else {
        var path = " ";
    }

    message.member.voiceChannel.connection.player.streamingData.pausedTime = 0;

    loopCounter = 0;

    dispatcher.on("end", function () {
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
                .setTitle(` `)
                .addField(`:information_source: Nothing is playing`, `Nothing is currently playing`)
                .setColor(`#0083FF`)
        }
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