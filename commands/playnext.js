const index = require(`../index.js`);
const config = require('config');
const api = config.get(`Bot.api`);
const Discord = require(`discord.js`);
const { YouTube } = require('better-youtube-api');
const youtube = new YouTube(api);
const youtubedl = require('youtube-dl');
const fs = require('fs');

class YTVideo {
	constructor(video, requester) {
		this.video = video;
		this.requester = requester;
	}
	getTitle() {
		return this.video.title;
	}
	getCleanTitle()  {
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
	getLength() {
		if(!this.video.seconds) {
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
		if(queue.indexOf(this) == -1)
		{
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
	getUploaderUrl() {
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
	name: 'playnext',
	description: 'Plays videos from YouTube, either by search or URL',
	aliases: ['pn', 'playn', 'pnext'],
	usage: '[search term(s) or URL]',
	cooldown: 3,
	guildOnly: true,
	execute(message, args) {
		
		if (!message.member.voiceChannel) {
			let vcFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`<:error:643341473772863508> ${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF0000`)
			message.channel.send(vcFailEmbed);

			return;
		}

		var playlistQueued = false;
		var soundcloudQueued = false;

		var queue = index.getQueue();
		var client = index.getClient();

		async function handlePlaylist(method, message, args) {
			playlistQueued = true;
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
				.setTitle(` `)
				.setDescription(`:arrows_counterclockwise: *Processing playlist...*`)

			var listProcessingMessage = await message.channel.send(listProcessingEmbed);

			for (var i = 0; i < playlistArray.length; i++) {
				// let playlistVideo = new YTVideo(await playlistArray[i].title, await playlistArray[i].url, playlistArray[i].liveStatus, message.author);
				let playlistVideo = new YTVideo(playlistArray[i], message.author);
				if (method == "playnext") {
					queue.unshift(playlistVideo);
				} else {
					queue.push(playlistVideo);
				}

				// DEBUG - CAUSES SPAM
				// message.channel.send(`EXPECTED OUTCOME:\n\nQueued video with title ${await playlistArray.videos[i].title}\nURL of queued video is: ${await playlistArray.videos[i].url}\n\nRESULT:\n\nQueued video with title ${await videoRequestObject.videoTitle}\nURL of queued video is: ${await videoRequestObject.videoUrl}`);

			}

			index.setQueue(queue);

			let newProcessingEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`:white_check_mark: *The playlist has finished processing*`)
			listProcessingMessage.edit(newProcessingEmbed);
			// message.channel.send(newProcessingEmbed);
		}

		async function handleVideoNoPlaylist(method, message, args) {
			var videoResult = await youtube.getVideo(args.join(" ")).catch(err => {
				console.log(err);
				let notFoundEmbed = new Discord.RichEmbed()
					.setTitle(` `)
					.addField(`<:error:643341473772863508> Video not found`, `Sorry, no video could be found with your input`)
					.setColor(`#FF0000`)
				message.channel.send(notFoundEmbed);

				console.log(`Video search fail\nError is: ${err}`);

				return;
			});

			// let newVideo = new YTVideo(videoResult.title, videoResult.url, videoResult.liveStatus, message.author);
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
				// .setColor(`#00c292`)
				.setTitle(` `)
				.setAuthor(`➕ Queued`)
				// .addField(`**:arrow_up_small: Queued**`, `[${newVideo.getTitle()}](${newVideo.getURL()})`)
				.setDescription(`[${newVideo.getTitle()}](${newVideo.getURL()})`)
				.addField(`Uploader`, `[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})`, true)
				.addField(`Length`, newVideo.getLength(), true)
				.addField(`Position`, newVideo.getPosition(), true)
				.setThumbnail(newVideo.getThumbnail())
				.setTimestamp()
				.setFooter(`Requested by ${newVideo.getRequesterName()}`)
			message.channel.send(playEmbed);
		}

		async function handleSoundCloud() {
			soundcloudQueued = true;

			const video = youtubedl(args[0]);

			var gInfo;

			let scDownload = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`:arrows_counterclockwise: Downloading SoundCloud song`, `[Download in progress...](${args[0]})`)
				.setColor(`#0083FF`)
			var sent = await message.channel.send(scDownload);

			video.on('info', function (info) {
				console.log('Download started');
				console.log('filename: ' + info._filename);
				console.log('size: ' + info.size);
				gInfo = info;

				video.pipe(fs.createWriteStream(`./soundcloud/${gInfo._filename}`));

			});

			video.on('end', function () {
				var newSC = new SCSong(args[0], message.author, gInfo);

				queue.push(newSC);
				index.setQueue(queue);

				client.emit("SC ready");

				let scDownloadComplete = new Discord.RichEmbed()
					.setTitle(` `)
					.addField(`**:arrow_up_small: Queued**`, `[${newSC.getCleanTitle()}](${newSC.getURL()})`)
					.addField(`Uploader`, `[${newSC.getUploader()}](${newSC.getUploaderUrl()})`, true)
					.addField(`Length`, newSC.getLength(), true)
					.addField(`Position`, newSC.getPosition(), true)
					.setThumbnail(newSC.getThumbnail());
				sent.edit(scDownloadComplete);
			});

		}

		if (args[0] == undefined) {
			let undefArgsEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`<:error:643341473772863508> *Please include at least one search term or URL*`)
				.setColor(`#FF0000`)
			message.channel.send(undefArgsEmbed);

			return;
		}

		if (args[0].includes("playlist?list=")) {
			handlePlaylist("playnext", message, args);
		} else if (args[0].includes("soundcloud")) {
			handleSoundCloud();
		} else {
			handleVideoNoPlaylist("playnext", message, args);
		}

		if (message.member.voiceChannel) {
			message.member.voiceChannel.join()
				.then(connection => {
					if (!connection.speaking) {
						if (playlistQueued == false && soundcloudQueued == false) {
							setTimeout(function () {
								index.callPlayMusic(message);
							}, 500);
						} else if (soundcloudQueued = true) {
							client.on("SC ready", function () {
								if (!connection.speaking) {
									index.callPlayMusic(message);
								}
							});
						} else {
							setTimeout(function () {
								index.callPlayMusic(message);
							}, 4000);
						}
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
}