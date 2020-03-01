const index = require(`../index.js`);
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);
const fs = require('fs');
const youtubedl = require('youtube-dl');
const api = config.get(`Bot.api`);
const Discord = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);

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
		return this.requester.username;
	}
	getType() {
		return "youtube";
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
	getLength() {
		if ((!this.video.duration) || this.video.duration.hours == 0 && this.video.duration.minutes == 0 && this.video.duration.seconds == 0) {
			return `unknown`;
		}

		if (this.video.duration.hours == 0) {
			if (this.video.duration.seconds < 10) {
				return `${this.video.duration.minutes}:0${this.video.duration.seconds}`
			} else {
				return `${this.video.duration.minutes}:${this.video.duration.seconds}`;
			}
		}
	}
	getPosition() {
		let queue = index.getQueue();
		if (queue.indexOf(this) == -1) {
			return 1;
		} else {
			return queue.indexOf(this) + 1;
		}
	}
	getVideo() {
		return this.video;
	}
}

function clean(text) {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

module.exports = {
    name: 'eval',
    description: 'Executes JavaScript code - ONLY OWNER CAN ACCESS THIS',
    aliases: ['e'],
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    async execute(message, args) {
        if (message.author.id !== ownerID) return;
        try {
            const code = args.join(" ");
            let evaled = await eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            message.channel.send(clean(evaled), { code: "xl" });
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    }
}