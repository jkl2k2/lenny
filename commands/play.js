const index = require(`../index.js`);
const config = require('config');
var fs = require('fs');
const youtubedl = require('youtube-dl');
const api = config.get(`Bot.api`);
const Discord = require(`discord.js`);
const { YouTube } = require('better-youtube-api');
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
		return this.video.liveStatus;
	}
	getThumbnail() {
		if (this.video.thumbnails.standard) {
			return this.video.thumbnails.standard.url;
		} else {
			return this.video.thumbnails.default.url;
		}
	}
	async getChannelName() {
		var id = `${this.video.channelId}`;
		var resolved = await youtube.getChannel(id);
		return resolved.name;
	}
	getChannelURL() {
		return `https://www.youtube.com/channel/${this.video.channelId}`;
	}
	getLength() {
		if (!this.video.seconds) {
			return `unknown`;
		}

		if (this.video.seconds < 10) {
			return `${this.video.minutes}:0${this.video.seconds}`;
		} else {
			return `${this.video.minutes}:${this.video.seconds}`;
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

class SCSong {
	constructor(url, requester, info) {
		this.url = url;
		this.requester = requester;
		this.info = info;
	}
	getURL() {
		return this.info.url;
	}
	getType() {
		return "soundcloud";
	}
	getTitle() {
		return this.info._filename;
	}
	getCleanTitle() {
		return this.info._filename.substring(0, (this.info._filename.length) - 14);
	}
	getUploader() {
		return this.info.uploader;
	}
	getChannelName() {
		return this.info.uploader;
	}
	getUploaderUrl() {
		return this.info.uploader_url;
	}
	getChannelURL() {
		return this.info.uploader_url;
	}
	getRequesterName() {
		return this.requester.username;
	}
	getLength() {
		return this.info._duration_hms.substring(3, 8)
	}
	getThumbnail() {
		return this.info.thumbnail;
	}
	getPosition() {
		let queue = index.getQueue();
		return queue.indexOf(this) + 1;
	}
}

module.exports = {
	name: 'play',
	description: 'Plays videos from YouTube, either by search or URL',
	aliases: ['p'],
	usage: '[search term(s) or URL]',
	cooldown: 3,
	guildOnly: true,
	execute(message, args) {

		if (!message.member.voiceChannel) {
			// If member not in VC
			let vcFailEmbed = new Discord.RichEmbed()
				 
				.setDescription(`<:error:643341473772863508> ${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF0000`)
			message.channel.send(vcFailEmbed);

			return;
		}

		if (args[0] == undefined) {
			// If no arguments
			let undefArgsEmbed = new Discord.RichEmbed()
				 
				.setDescription(`:no_entry: Please include at least one search term or URL`)
				.setColor(`#FF0000`)
			message.channel.send(undefArgsEmbed);

			return;
		}

		var queue = index.getQueue();
		var client = index.getClient();

		async function handlePlaylist(method, message, args) {
			var playlistInfo = await youtube.getPlaylist(args[0]);
			var playlistArray = await youtube.getPlaylistItems(args[0]);

			var listEmbed = new Discord.RichEmbed()
				 
				.setAuthor(`➕ Queued playlist (${playlistInfo.length} songs)`)
				.setDescription(`**[${playlistInfo.title}](${args[0]})**`)
				.setThumbnail(playlistInfo.thumbnails.standard.url)
				.setTimestamp()
				.setFooter(`Requested by ${message.author.username}`)
			message.channel.send(listEmbed);

			var listProcessingEmbed = new Discord.RichEmbed()
				 
				.setDescription(`:arrows_counterclockwise: *Processing playlist...*`)

			var listProcessingMessage = await message.channel.send(listProcessingEmbed);

			for (var i = 0; i < playlistArray.length; i++) {
				// Loop through playlist, adding each video to queue
				let playlistVideo = new YTVideo(playlistArray[i], message.author);
				if (method == "playnext") {
					queue.unshift(playlistVideo);
				} else {
					queue.push(playlistVideo);
				}
			}

			index.setQueue(queue);

			let newProcessingEmbed = new Discord.RichEmbed()
				 
				.setDescription(`:white_check_mark: *The playlist has finished processing*`)
			listProcessingMessage.edit(newProcessingEmbed);
			// message.channel.send(newProcessingEmbed);

			if (message.member.voiceChannel) {
				message.member.voiceChannel.join()
					.then(connection => {
						if (!connection.speaking) {
							index.callPlayMusic(message);
						}
					})
					.catch(`${console.log} Timestamp: timestamp`);
			} else {
				let vcFailEmbed = new Discord.RichEmbed()
					.setTitle(`:warning: ${message.author.username}, you are not in a voice channel. Your video has been queued, but I am unable to join you.`)
					.setColor(`#FF0000`)
				message.channel.send(vcFailEmbed);
			}
		}

		async function handleVideo(method, message, args) {

			try {
				var videoResult = await youtube.getVideo(args.join(" "));
			} catch (error) {
				console.error(error);

				let notFoundEmbed = new Discord.RichEmbed()
					 
					.setDescription(`<:error:643341473772863508> Sorry, YouTube could not find any video with that input`)
					.setColor(`#FF0000`)
				message.channel.send(notFoundEmbed);

				return;
			}

			let newVideo = new YTVideo(videoResult, message.author);

			if (method === "playnow") {
				queue.unshift(newVideo);
				index.setQueue(queue);
				endDispatcher(message.channel, message.author.username, "playnow");
			} else if (method === "playnext") {
				queue.unshift(newVideo);
				index.setQueue(queue);
			} else {
				queue.push(newVideo);
				index.setQueue(queue);
			}

			var playEmbed = new Discord.RichEmbed()
				 
				.setAuthor(`➕ Queued`)
				.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**`)
				.addField(`Uploader`, `[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})`, true)
				.addField(`Length`, newVideo.getLength(), true)
				.addField(`Position`, newVideo.getPosition(), true)
				.setThumbnail(newVideo.getThumbnail())
				.setTimestamp()
				.setFooter(`Requested by ${newVideo.getRequesterName()}`)
			message.channel.send(playEmbed);

			if (message.member.voiceChannel) {
				message.member.voiceChannel.join()
					.then(connection => {
						if (!connection.speaking) {
							index.callPlayMusic(message);
						}
					})
					.catch(`${console.log} Timestamp: timestamp`);
			} else {
				let vcFailEmbed = new Discord.RichEmbed()
					.setTitle(`:warning: ${message.author.username}, you are not in a voice channel. Your video has been queued, but I am unable to join you.`)
					.setColor(`#FF0000`)
				message.channel.send(vcFailEmbed);
			}
		}

		async function handleSoundCloud() {
			soundcloudQueued = true;

			const video = youtubedl(args[0], [`--simulate`, `--get-url`]);

			var gInfo;

			let scDownload = new Discord.RichEmbed()
				 
				.addField(`:arrows_counterclockwise: Downloading SoundCloud song`, `[Download in progress...](${args[0]})`)
				.setColor(`#0083FF`)
			var sent = await message.channel.send(scDownload);

			video.on('info', function (info) {
				// console.log('Download started');
				// console.log('filename: ' + info._filename);
				// console.log('size: ' + info.size);
				gInfo = info;

				var newSC = new SCSong(args[0], message.author, gInfo);

				queue.push(newSC);
				index.setQueue(queue);

				let scDownloadComplete = new Discord.RichEmbed()
					 
					.setAuthor(`➕ Queued`)
					.setDescription(`**[${newSC.getCleanTitle()}](${newSC.getURL()})**`)
					.addField(`Uploader`, `[${newSC.getUploader()}](${newSC.getUploaderUrl()})`, true)
					.addField(`Length`, newSC.getLength(), true)
					.addField(`Position`, newSC.getPosition(), true)
					.setThumbnail(newSC.getThumbnail());
				sent.edit(scDownloadComplete);

				video.pipe(fs.createWriteStream(`./soundcloud/${gInfo._filename}`));

			});

			video.on('end', function () {
				if (message.member.voiceChannel) {
					message.member.voiceChannel.join()
						.then(connection => {
							if (!connection.speaking) {
								index.callPlayMusic(message);
							}
						})
						.catch(`${console.log} Timestamp: timestamp`);
				} else {
					let vcFailEmbed = new Discord.RichEmbed()
						.setTitle(`:warning: ${message.author.username}, you are not in a voice channel. Your video has been queued, but I am unable to join you.`)
						.setColor(`#FF0000`)
					message.channel.send(vcFailEmbed);
				}
			});

		}

		if (args[0].includes("playlist?list=")) {
			handlePlaylist("play", message, args);
		} else if (args[0].includes("soundcloud")) {
			handleSoundCloud();
		} else {
			handleVideo("play", message, args);
		}
	}
}