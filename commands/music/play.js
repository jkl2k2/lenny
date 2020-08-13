//#region Constants and requires
const index = require(`../../index.js`);
const config = require('config');
const fs = require('fs');
const scdl = require(`soundcloud-downloader`);
const api = config.get(`Bot.api2`);
const Discord = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const logger = index.getLogger();
const Queues = index.getQueues();
const fetch = require(`node-fetch`);
const hex = require(`rgb-hex`);
const colorThief = require(`colorthief`);
const prettyMs = require(`pretty-ms`);
//#endregion

//#region Class declarations
class SCSong {
	constructor(url, requester, info) {
		this.url = url;
		this.requester = requester;
		this.info = info;
	}
	getURL() {
		return this.info.permalink_url;
	}
	getType() {
		return "soundcloud";
	}
	getTitle() {
		return this.info.title;
	}
	getCleanTitle() {
		var unformatted = this.info.title;
		var formatted = ``;

		for (var i = 0; i < unformatted.length; i++) {
			if (unformatted.substring(i, i + 1) == `*` || unformatted.substring(i, i + 1) == `_`) {
				formatted += `\\`;
				formatted += unformatted.substring(i, i + 1);
			} else {
				formatted += unformatted.substring(i, i + 1);
			}
		}

		return formatted;
	}
	getUploader() {
		return this.info.user.username;
	}
	getChannelName() {
		return this.info.user.username;
	}
	getUploaderUrl() {
		return this.info.user.permalink_url;
	}
	getChannelThumbnail() {
		return this.info.user.avatar_url;
	}
	getChannelURL() {
		return this.info.user.permalink_url;
	}
	getRequesterName() {
		return this.requester.user.username;
	}
	getRequesterAvatar() {
		return this.requester.user.avatarURL();
	}
	getLength() {
		return prettyMs(this.info.duration, { colonNotation: true, secondsDecimalDigits: 0 });
	}
	getThumbnail() {
		return this.info.artwork_url;
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
	description: 'Plays videos from YouTube or SoundCloud',
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
		if (!message.member.voice.channel) {
			// If member not in VC
			return message.channel.send(new Discord.MessageEmbed()
				.setTitle(` `)
				.setDescription(`<:cross:729019052571492434> ${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF3838`));
		}

		if (args[0] == undefined) {
			// If no arguments
			return message.channel.send(new Discord.MessageEmbed()
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

						let processing;

						if (playlist.thumbnails.default) {
							let buffer = await fetch(playlist.thumbnails.default.url).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
							let rgb = await colorThief.getColor(buffer);
							processing = await message.channel.send(new Discord.MessageEmbed()
								.setAuthor(`🔄 Processing playlist`)
								.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
								.setThumbnail(playlist.thumbnails.default.url)
								.setTimestamp()
								.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
								.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));
						} else if (videos[0].thumbnails.default) {
							let buffer = await fetch(videos[0].maxRes.url).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
							let rgb = await colorThief.getColor(buffer);
							processing = await message.channel.send(new Discord.MessageEmbed()
								.setAuthor(`🔄 Processing playlist`)
								.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
								.setThumbnail(videos[0].maxRes.url)
								.setTimestamp()
								.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
								.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));
						} else {
							processing = await message.channel.send(new Discord.MessageEmbed()
								.setAuthor(`🔄 Processing playlist`)
								.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
								.setTimestamp()
								.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL()));
						}


						for (var i = 0; i < videos.length; i++) {
							var newVideo = index.constructVideo(videos[i], message.member);
							if (newVideo.getTitle() == "Private video") {
								message.channel.send(new Discord.MessageEmbed()
									.setDescription(":information_source: At least 1 video from the playlist could not be added as it is private")
									.setColor(`#0083FF`));
							} else {
								queue.push(newVideo);
							}
						}

						// jshint ignore:start
						processing.edit(new Discord.MessageEmbed()
							.setAuthor(`➕ Queued playlist`)
							.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
							.setThumbnail(processing.embeds[0].thumbnail?.url)
							.setTimestamp()
							.setFooter(processing.embeds[0].footer?.text)
							.setColor(processing.embeds[0].hexColor));
						// jshint ignore:end

						if (message.member.voice.channel) {
							message.member.voice.channel.join()
								.then(connection => {
									if (index.getDispatcher(message) == undefined && !connection.voice.speaking) {
										index.callPlayMusic(message);
									} else {
										logger.debug(`Connection speaking`);
									}
								})
								.catch(logger.error);
						} else {
							logger.warn(`User not in voice channel after playlist processing`);
						}
					} else {
						logger.error(`Playlist not found`);
						message.channel.send(new Discord.MessageEmbed()
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

			let queue = index.getQueue(message);
			let prevQueue = index.getQueue(message);
			let dispatcher = index.getDispatcher(message);

			if (!Queues.has(message.guild.id)) {
				let newQueue = index.constructQueue();
				newQueue.push(newVideo);
				// Queues.set(message.guild.id, newQueue);
				index.setQueue(message, newQueue);
				queue = index.getQueue(message);
			} else {
				queue.push(newVideo);
			}

			if (await newVideo.getLength() == "0:00") {
				if (dispatcher != undefined || (prevQueue != undefined && prevQueue.list[1])) {
					let buffer = await fetch(newVideo.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
					let rgb = await colorThief.getColor(buffer);
					message.channel.send(new Discord.MessageEmbed()
						.setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
						.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\n\`YouTube Livestream\``)
						.setThumbnail(newVideo.getThumbnail())
						.setTimestamp()
						.setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar())
						.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));
				}
			} else {
				if (dispatcher != undefined || (prevQueue != undefined && prevQueue.list[1])) {
					let buffer = await fetch(newVideo.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
					let rgb = await colorThief.getColor(buffer);
					message.channel.send(new Discord.MessageEmbed()
						.setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
						.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\nLength: \`${await newVideo.getLength()}\``)
						.setThumbnail(newVideo.getThumbnail())
						.setTimestamp()
						.setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar())
						.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));
				}
			}

			if (message.member.voice.channel) {
				message.member.voice.channel.join()
					.then(connection => {
						if (index.getDispatcher(message) == undefined && !connection.voice.speaking) {
							index.callPlayMusic(message);
						} else {
							logger.debug(`Connection speaking`);
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
							message.channel.send(new Discord.MessageEmbed()
								.setDescription(`:information_source: YouTube could not find a video with that input`)
								.setColor(`#0083FF`));
						}
					});
			}
		}
		//#endregion

		//#region SoundCloud handling
		async function handleSoundCloud() {
			let dispatcher = index.getDispatcher(message);

			if (!scdl.isValidUrl(args[0])) {
				return message.channel.send(new Discord.MessageEmbed()
					.setDescription(`<:cross:729019052571492434> Sorry, ${message.author.username}, a SoundCloud URL was detected, but it is invalid`)
					.setColor(`#FF3838`));
			}

			const info = await scdl.getInfo(args[0]);

			var newSC = new SCSong(args[0], message.member, info);

			if (!Queues.has(message.guild.id)) {
				let newQueue = index.constructQueue();
				newQueue.push(newSC);
				index.setQueue(message, newQueue);
			} else {
				queue.push(newSC);
			}

			if (dispatcher != undefined || (queue != undefined && queue.list[1])) {
				let buffer = await fetch(newSC.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
				let rgb = await colorThief.getColor(buffer);
				message.channel.send(new Discord.MessageEmbed()
					.setTitle(` `)
					.setAuthor(`Queued (#${newSC.getPosition()})`, newSC.getChannelThumbnail(), newSC.getURL())
					.setDescription(`**[${newSC.getCleanTitle()}](${newSC.getURL()})**\n[${newSC.getUploader()}](${newSC.getUploaderUrl()})\n\nLength: \`${newSC.getLength()}\``)
					.setThumbnail(newSC.getThumbnail())
					.setFooter(`Requested by ${newSC.getRequesterName()}`, newSC.getRequesterAvatar())
					.setTimestamp()
					.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));
			}

			if (message.member.voice.channel) {
				message.member.voice.channel.join()
					.then(connection => {
						if (index.getDispatcher(message) == undefined && !connection.voice.speaking) {
							index.callPlayMusic(message);
						} else {
							logger.debug(`Connection speaking`);
						}
					})
					.catch(logger.error);
			} else {
				let vcFailEmbed = new Discord.MessageEmbed()
					.setTitle(`:warning: ${message.author.username}, you are not in a voice channel. Your video has been queued, but I am unable to join you.`)
					.setColor(`#FF3838`);
				message.channel.send(vcFailEmbed);
			}
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