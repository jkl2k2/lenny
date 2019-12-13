const index = require(`../index.js`);
const config = require('config');
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
		return `${this.video.minutes}:${this.video.seconds}`;
	}
	getVideo() {
		return this.video;
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
		args.unshift();

		if (!message.member.voiceChannel) {
			let vcFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> Play failed`, `${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF0000`)
			message.channel.send(vcFailEmbed);

			return;
		}

		var playlistQueued = false;

		var queue = index.getQueue();

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
				.addField(`:arrows_counterclockwise: Processing playlist`, `Please wait...`)
				.setColor(`#FF0000`)

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
				.addField(`:white_check_mark: Playlist added`, `The playlist has finished processing`)
				.setColor(`#44C408`)
			listProcessingMessage.edit(newProcessingEmbed);
			// message.channel.send(newProcessingEmbed);
		}

		async function handleVideoNoPlaylist(method, message, args) {
			var videoResult = await youtube.getVideo(args.join(" ")).catch(err => {
				console.log(error);
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
				.setColor(`#00c292`)
				.setTitle(` `)
				.addField(`**:arrow_up_small: Queued**`, `[${newVideo.getTitle()}](${newVideo.getURL()})`)
				.addField(`Uploader`, `[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})`, true)
				.addField(`Length`, newVideo.getLength(), true)
				.setThumbnail(newVideo.getThumbnail())
				.setTimestamp()
				.setFooter(`Requested by ${newVideo.getRequesterName()}`)
			message.channel.send(playEmbed);

		}

		if (args[0] == undefined) {
			let undefArgsEmbed = new Discord.RichEmbed()
				.setTitle(`:eyes: ${message.author.username}, please include at least one search term or URL`)
				.setColor(`#FF0000`)
			message.channel.send(undefArgsEmbed);

			return;
		}

		if (args[0].includes("playlist?list=")) {
			handlePlaylist("play", message, args);
		} else {
			handleVideoNoPlaylist("play", message, args);
		}

		if (message.member.voiceChannel) {
			message.member.voiceChannel.join()
				.then(connection => {
					if (!connection.speaking) {
						if(playlistQueued == false) {
							setTimeout(function () {
								index.callPlayMusic(message);
							}, 500);
						} else {
							setTimeout(function () {
								index.callPlayMusic(message);
							}, 1500);
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