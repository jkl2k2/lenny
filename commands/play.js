const index = require(`../index.js`);
const config = require('config');
var fs = require('fs');
const youtubedl = require('youtube-dl');
const api = config.get(`Bot.api2`);
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
				.setTitle(` `)
				.setDescription(`<:error:643341473772863508> ${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF0000`)
			message.channel.send(vcFailEmbed);

			return;
		}

		if (args[0] == undefined) {
			// If no arguments
			let undefArgsEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`:no_entry: Please include at least one search term or URL`)
				.setColor(`#FF0000`)
			message.channel.send(undefArgsEmbed);

			return;
		}

		var queue = index.getQueue();

		async function process(input) {
			var videoResult = input;

			console.log(input.title);

			let newVideo = new YTVideo(videoResult, message.author);

			queue.push(newVideo);
			index.setQueue(queue);

			if (newVideo.getLength() == "unknown") {
				var playEmbed = new Discord.RichEmbed()
					.setTitle(` `)
					.setAuthor(`➕ Queued`)
					.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**`)
					.addField(`Uploader`, `[${newVideo.getChannelName()}](${newVideo.getChannelURL()})`, true)
					.addField(`Position`, newVideo.getPosition(), true)
					.setThumbnail(newVideo.getThumbnail())
					.setTimestamp()
					.setFooter(`Requested by ${newVideo.getRequesterName()}`)
				message.channel.send(playEmbed);
			} else {
				var playEmbed = new Discord.RichEmbed()
					.setTitle(` `)
					.setAuthor(`➕ Queued`)
					.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**`)
					.addField(`Uploader`, `[${newVideo.getChannelName()}](${newVideo.getChannelURL()})`, true)
					.addField(`Length`, newVideo.getLength(), true)
					.addField(`Position`, newVideo.getPosition(), true)
					.setThumbnail(newVideo.getThumbnail())
					.setTimestamp()
					.setFooter(`Requested by ${newVideo.getRequesterName()}`)
				message.channel.send(playEmbed);
			}

			if (message.member.voiceChannel) {
				message.member.voiceChannel.join()
					.then(connection => {
						if (!connection.speaking) {
							index.callPlayMusic(message);
						}
					})
					.catch(`${console.log}`);
			} else {
				console.log("Failed to join voice channel");
			}
		}

		async function handlePlaylist() {
			await youtube.getPlaylist(args[0])
				.then(async function(playlist) {
					if (playlist) {
						var videos = await playlist.getVideos();

						var listEmbed = new Discord.RichEmbed()
							.setAuthor(`🔄 Processing playlist`)
							.setDescription(`**[${playlist.title}](${playlist.url})**`)
							.addField(`Uploader`, `[${playlist.channel.title}](${playlist.channel.url})`, true)
							.addField(`Length`, `${videos.length} videos`, true)
							.setThumbnail(playlist.thumbnails.default.url)
							.setTimestamp()
							.setFooter(`Requested by ${message.author.username}`)
						var processing = await message.channel.send(listEmbed);

						for (var i = 0; i < videos.length; i++) {
							var newVideo = new YTVideo(videos[i], message.author);
							if (newVideo.getTitle() == "Private video") {
								var privateVideoEmbed = new Discord.RichEmbed()
									.setDescription(":information_source: At least 1 video from the playlist could not be added as it is private")
									.setColor(`#0083FF`)
								message.channel.send(privateVideoEmbed);
							}
							queue.push(newVideo);
						}

						var finishedEmbed = new Discord.RichEmbed()
							.setAuthor(`➕ Queued playlist`)
							.setDescription(`**[${playlist.title}](${playlist.url})**`)
							.addField(`Uploader`, `[${playlist.channel.title}](${playlist.channel.url})`, true)
							.addField(`Length`, `${videos.length} videos`, true)
							.setThumbnail(playlist.thumbnails.default.url)
							.setTimestamp()
							.setFooter(`Requested by ${message.author.username}`)
						processing.edit(finishedEmbed);
						
						if (message.member.voiceChannel) {
							message.member.voiceChannel.join()
								.then(connection => {
									if (!connection.speaking) {
										index.callPlayMusic(message);
									}
								})
								.catch(`${console.log} Timestamp: timestamp`);
						} else {
							console.log(`User not in voice channel after playlist processing`)
						}
					} else {
						console.log(`Playlist not found`);
					}
				})
		}

		async function handleVideo() {
			if (args[0].includes("watch?v=") || args[0].includes('youtu.be')) {
				var input = await youtube.getVideo(args[0]);
				process(input);
			} else {
				await youtube.searchVideos(args.join(" "), 1)
					.then(async function(results) {
						var input = await youtube.getVideo(results[0].url);
						process(input);
					});
			}
		}

		async function handleSoundCloud() {
			soundcloudQueued = true;

			const video = youtubedl(args[0], [`--simulate`, `--get-url`]);

			var gInfo;

			let scDownload = new Discord.RichEmbed()
				.setTitle(` `)
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
					.setTitle(` `)
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
			handlePlaylist();
		} else if (args[0].includes("soundcloud")) {
			handleSoundCloud();
		} else {
			handleVideo();
		}
	}
}