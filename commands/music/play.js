//#region Constants and requires
const index = require(`../../index.js`);
const config = require('config');
const fs = require('fs');
const youtubedl = require('youtube-dl');
const api = config.get(`Bot.api2`);
const Discord = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const chalk = require('chalk');
const logger = index.getLogger();
const Queues = index.getQueues();
//#endregion

//#region Class declarations
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
		return this.requester.user.username;
	}
	getLength() {
		return this.info._duration_hms.substring(3, 8);
	}
	getThumbnail() {
		return this.info.thumbnail;
	}
	getPosition() {
		// let queue = index.getQueue(this.requester.guild.id);
		let queue = Queues.get(this.requester.guild.id);
		if (queue.list.indexOf(this) == -1) {
			return 1;
		} else {
			return queue.list.indexOf(this) + 1;
		}
	}
}
//#endregion

module.exports = {
	name: 'play',
	description: 'Plays videos from YouTube, either by search or URL',
	aliases: ['p'],
	args: true,
	usage: '[search term(s)]',
	altUsage: '[Video or playlist URL]',
	cooldown: 3,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		//#region Error handling and other necessary setup
		if (!message.member.voiceChannel) {
			// If member not in VC
			return message.channel.send(new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`<:cross:729019052571492434> ${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF3838`));
		}

		if (args[0] == undefined) {
			// If no arguments
			return message.channel.send(new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`<:cross:729019052571492434> Please include at least one search term or URL`)
				.setColor(`#FF3838`));
		}

		var queue = index.getQueue(message);
		//#endregion

		//#region Playlist handling
		async function handlePlaylist() {
			await youtube.getPlaylist(args[0])
				.then(async function (playlist) {
					if (playlist) {
						var videos = await playlist.getVideos();

						if (!Queues.has(message.guild.id)) {
							let newQueue = [];
							// Queues.set(message.guild.id, newQueue);
							index.setQueue(message, newQueue);
							queue = index.getQueue(message);
						}

						var processing = await message.channel.send(new Discord.RichEmbed()
							.setAuthor(`🔄 Processing playlist`)
							.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
							.setThumbnail(playlist.thumbnails.default.url)
							.setTimestamp()
							.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL));

						for (var i = 0; i < videos.length; i++) {
							var newVideo = index.constructVideo(videos[i], message.member);
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
							.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL));

						if (message.member.voiceChannel) {
							message.member.voiceChannel.join()
								.then(connection => {
									if (index.getDispatcher(message) == undefined) {
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
		//#endregion

		//#region Regular video / livestream handling
		async function process(input) {
			// logger.debug(input.title);

			// let newVideo = index.constructVideo(input, message.member);
			let newVideo = index.constructVideo(input, message.member);

			// queue.push(newVideo);

			if (!Queues.has(message.guild.id)) {
				let newQueue = index.constructQueue();
				newQueue.push(newVideo);
				// Queues.set(message.guild.id, newQueue);
				index.setQueue(message, newQueue);
			} else {
				queue.push(newVideo);
			}

			if (await newVideo.getLength() == "0:00") {
				message.channel.send(new Discord.RichEmbed()
					.setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
					.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\n\`YouTube Livestream\``)
					.setThumbnail(newVideo.getThumbnail())
					.setTimestamp()
					.setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar()));
			} else {
				message.channel.send(new Discord.RichEmbed()
					.setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
					.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\nLength: \`${await newVideo.getLength()}\``)
					.setThumbnail(newVideo.getThumbnail())
					.setTimestamp()
					.setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar()));
			}

			if (message.member.voiceChannel) {
				message.member.voiceChannel.join()
					.then(connection => {
						if (index.getDispatcher(message) == undefined) {
							index.callPlayMusic(message);
						}
					})
					.catch(`${logger.error}`);
			} else {
				logger.error("Failed to join voice channel");
			}
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
		//#endregion

		//#region SoundCloud handling
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

				var newSC = new SCSong(args[0], message.member, gInfo);

				if (!Queues.has(message.guild.id)) {
					let newQueue = index.constructQueue();
					newQueue.push(newSC);
					// Queues.set(message.guild.id, newQueue);
					index.setQueue(message, newQueue);
				} else {
					queue.push(newSC);
				}

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
							if (index.getDispatcher(message) == undefined) {
								index.callPlayMusic(message);
							}
						})
						.catch(logger.error);
				} else {
					let vcFailEmbed = new Discord.RichEmbed()
						.setTitle(`:warning: ${message.author.username}, you are not in a voice channel. Your video has been queued, but I am unable to join you.`)
						.setColor(`#FF3838`);
					message.channel.send(vcFailEmbed);
				}
			});

		}
		//#endregion

		//#region Determine action based on input
		if (args[0].includes("playlist?list=")) {
			handlePlaylist();
		} else if (args[0].includes("soundcloud")) {
			handleSoundCloud();
		} else {
			handleVideo();
		}
		//#endregion
	}
};