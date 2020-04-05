const index = require(`../index.js`);
const config = require('config');
const fs = require('fs');
const youtubedl = require('youtube-dl');
const api = config.get(`Bot.api2`);
const Discord = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const chalk = require('chalk');
const logger = index.getLogger();

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
		if (!this.video.duration) {
			return "video";
		} else if (this.video.duration.hours == 0 && this.video.duration.minutes == 0 && this.video.duration.seconds == 0) {
			return "livestream";
		} else {
			return "video";
		}
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
	async getLength() {
		if ((!this.video.duration) || this.video.duration.hours == 0 && this.video.duration.minutes == 0 && this.video.duration.seconds == 0) {
			var fullVideo = await youtube.getVideo(this.video.url);
			if (fullVideo.duration.hours == 0) {
				if (fullVideo.duration.seconds < 10) {
					return `${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
				} else {
					return `${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
				}
			} else {
				if (fullVideo.duration.seconds < 10) {
					if (fullVideo.duration.minutes < 10) {
						return `${fullVideo.duration.hours}:0${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
					} else {
						return `${fullVideo.duration.hours}:${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
					}
				} else {
					if (fullVideo.duration.minutes < 10) {
						return `${fullVideo.duration.hours}:0${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
					} else {
						return `${fullVideo.duration.hours}:${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
					}
				}
			}
		}

		if (this.video.duration.hours == 0) {
			if (this.video.duration.seconds < 10) {
				return `${this.video.duration.minutes}:0${this.video.duration.seconds}`;
			} else {
				return `${this.video.duration.minutes}:${this.video.duration.seconds}`;
			}
		} else {
			if (this.video.duration.seconds < 10) {
				if (this.video.duration.minutes < 10) {
					return `${this.video.duration.hours}:0${this.video.duration.minutes}:0${this.video.duration.seconds}`;
				} else {
					return `${this.video.duration.hours}:${this.video.duration.minutes}:0${this.video.duration.seconds}`;
				}
			} else {
				if (this.video.duration.minutes < 10) {
					return `${this.video.duration.hours}:0${this.video.duration.minutes}:${this.video.duration.seconds}`;
				} else {
					return `${this.video.duration.hours}:${this.video.duration.minutes}:${this.video.duration.seconds}`;
				}
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
	async getFullVideo() {
		return await youtube.getVideo(this.video.url);
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
		return this.info._duration_hms.substring(3, 8);
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
	args: true,
	usage: '[search term(s) or URL]',
	cooldown: 3,
	guildOnly: true,
	enabled: true,
	execute(message, args) {
		if (!message.member.voiceChannel) {
			// If member not in VC
			return message.channel.send(new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`<:error:643341473772863508> ${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF0000`));
		}

		if (args[0] == undefined) {
			// If no arguments
			return message.channel.send(new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`:no_entry: Please include at least one search term or URL`)
				.setColor(`#FF0000`));
		}

		var queue = index.getQueue();

		async function process(input) {
			logger.debug(input.title);

			let newVideo = new YTVideo(input, message.author);

			queue.push(newVideo);

			message.channel.send(new Discord.RichEmbed()
				.setAuthor(`➕ Queued`)
				.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\nBy: [${await newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\n\`Position in queue: #${newVideo.getPosition()}\``)
				.setThumbnail(newVideo.getThumbnail())
				.setTimestamp()
				.setFooter(`Requested by ${newVideo.getRequesterName()}`));

			if (message.member.voiceChannel) {
				message.member.voiceChannel.join()
					.then(connection => {
						if (index.getDispatcher() == undefined || (!connection.speaking && !index.getDispatcher().paused)) {
							index.callPlayMusic(message);
						}
					})
					.catch(`${logger.error}`);
			} else {
				logger.error("Failed to join voice channel");
			}
		}

		async function handlePlaylist() {
			await youtube.getPlaylist(args[0])
				.then(async function (playlist) {
					if (playlist) {
						var videos = await playlist.getVideos();

						var processing = await message.channel.send(new Discord.RichEmbed()
							.setAuthor(`🔄 Processing playlist`)
							.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
							.setThumbnail(playlist.thumbnails.default.url)
							.setTimestamp()
							.setFooter(`Requested by ${message.author.username}`));

						for (var i = 0; i < videos.length; i++) {
							var newVideo = new YTVideo(videos[i], message.author);
							if (newVideo.getTitle() == "Private video") {
								message.channel.send(new Discord.RichEmbed()
									.setDescription(":information_source: At least 1 video from the playlist could not be added as it is private")
									.setColor(`#0083FF`));
							} else {
								queue.push(newVideo);
							}
						}

						processing.edit(new Discord.RichEmbed()
							.setAuthor(`➕ Queued playlist`)
							.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
							.setThumbnail(playlist.thumbnails.default.url)
							.setTimestamp()
							.setFooter(`Requested by ${message.author.username}`));

						if (message.member.voiceChannel) {
							message.member.voiceChannel.join()
								.then(connection => {
									if (index.getDispatcher() == undefined || (!connection.speaking && !index.getDispatcher().paused)) {
										index.callPlayMusic(message);
									}
								})
								.catch(logger.error);
						} else {
							logger.warn(`User not in voice channel after playlist processing`);
						}
					} else {
						logger.error(`Playlist not found`);
						message.channel.send(new Discord.RichEmbed()
							.setDescription(`:information_source: YouTube could not find a playlist with that input`)
							.setColor(`#0083FF`));
					}
				});
		}

		async function handleVideo() {
			if (args[0].includes("watch?v=") || args[0].includes('youtu.be')) {
				process(await youtube.getVideo(args[0]));
			} else {
				await youtube.searchVideos(args.join(" "), 1)
					.then(async results => {
						if (results[0]) {
							process(await youtube.getVideo(results[0].url));
						} else {
							message.channel.send(new Discord.RichEmbed()
								.setDescription(`:information_source: YouTube could not find a video with that input`)
								.setColor(`#0083FF`));
						}
					});
			}
		}

		async function handleSoundCloud() {
			soundcloudQueued = true;

			const video = youtubedl(args[0], [`--simulate`, `--get-url`]);

			var gInfo;

			var sent = await message.channel.send(new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`:arrows_counterclockwise: Downloading SoundCloud song`, `[Download in progress...](${args[0]})`)
				.setColor(`#0083FF`));

			video.on('info', function (info) {
				// console.log('Download started');
				// console.log('filename: ' + info._filename);
				// console.log('size: ' + info.size);
				gInfo = info;

				var newSC = new SCSong(args[0], message.author, gInfo);

				queue.push(newSC);

				sent.edit(new Discord.RichEmbed()
					.setTitle(` `)
					.setAuthor(`➕ Queued`)
					.setDescription(`**[${newSC.getCleanTitle()}](${newSC.getURL()})**`)
					.addField(`Uploader`, `[${newSC.getUploader()}](${newSC.getUploaderUrl()})`, true)
					.addField(`Length`, newSC.getLength(), true)
					.addField(`Position`, newSC.getPosition(), true)
					.setThumbnail(newSC.getThumbnail()));

				video.pipe(fs.createWriteStream(`./soundcloud/${gInfo._filename}`));

			});

			video.on('end', function () {
				if (message.member.voiceChannel) {
					message.member.voiceChannel.join()
						.then(connection => {
							if (index.getDispatcher() == undefined || (!connection.speaking && !index.getDispatcher().paused)) {
								index.callPlayMusic(message);
							}
						})
						.catch(logger.error);
				} else {
					let vcFailEmbed = new Discord.RichEmbed()
						.setTitle(`:warning: ${message.author.username}, you are not in a voice channel. Your video has been queued, but I am unable to join you.`)
						.setColor(`#FF0000`);
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
};