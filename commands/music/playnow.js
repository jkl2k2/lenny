const index = require(`../../index.js`);
const config = require('config');
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

module.exports = {
	name: 'playnow',
	description: 'Immediately skips the current song and plays the requested one',
	args: true,
	aliases: ['now', 'pnow'],
	usage: '[video]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
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

		async function process(input) {
			logger.debug(input.title);

			let newVideo = index.constructVideo(input, message.member);

			// queue.push(newVideo);

			if (!Queues.has(message.guild.id)) {
				let newQueue = index.constructQueue();
				newQueue.push(newVideo);
				// Queues.set(message.guild.id, newQueue);
				index.setQueue(message, newQueue);
			} else {
				queue.unshift(newVideo);
			}

			/*
			if (await newVideo.getLength() == "0:00") {
				let buffer = await fetch(newVideo.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
				let rgb = await colorThief.getColor(buffer);
				message.channel.send(new Discord.MessageEmbed()
					.setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
					.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${await newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\n\`YouTube Livestream\``)
					.setThumbnail(newVideo.getThumbnail())
					.setTimestamp()
					.setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar())
					.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));
			} else {
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
			*/

			if (message.member.voice.channel) {
				message.member.voice.channel.join()
					.then(connection => {
						if (index.getDispatcher(message) == undefined && !connection.voice.speaking) {
							index.callPlayMusic(message);
						} else {
							index.endDispatcher(message);
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

						let buffer = await fetch(playlist.thumbnails.default.url).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
						let rgb = await colorThief.getColor(buffer);
						var processing = await message.channel.send(new Discord.MessageEmbed()
							.setAuthor(`🔄 Processing playlist`)
							.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
							.setThumbnail(playlist.thumbnails.default.url)
							.setTimestamp()
							.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
							.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));

						for (var i = 0; i < videos.length; i++) {
							var newVideo = index.constructVideo(videos[i], message.author);
							if (newVideo.getTitle() == "Private video") {
								message.channel.send(new Discord.MessageEmbed()
									.setDescription(":information_source: At least 1 video from the playlist could not be added as it is private")
									.setColor(`#0083FF`));
							} else {
								queue.unshift(newVideo);
							}
						}

						processing.edit(new Discord.MessageEmbed()
							.setAuthor(`➕ Queued playlist`)
							.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
							.setThumbnail(playlist.thumbnails.default.url)
							.setTimestamp()
							.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
							.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));

						if (message.member.voice.channel) {
							message.member.voice.channel.join()
								.then(connection => {
									if (index.getDispatcher(message) == undefined && !connection.voice.speaking) {
										index.callPlayMusic(message);
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

		async function handleSoundCloud() {
			let dispatcher = index.getDispatcher(message);

			if (!scdl.isValidUrl(args[0])) {
				return message.channel.send(new Discord.MessageEmbed()
					.setDescription(`<:cross:729019052571492434> Sorry, ${message.author.username}, a SoundCloud URL was detected, but it is invalid`)
					.setColor(`#FF3838`));
			}

			const info = await scdl.getInfo(args[0]);

			var newSC = index.constructSC(message.member, info);

			if (!Queues.has(message.guild.id)) {
				let newQueue = index.constructQueue();
				newQueue.push(newSC);
				index.setQueue(message, newQueue);
			} else {
				queue.unshift(newSC);
			}

			if (dispatcher != undefined || (queue != undefined && queue.list[1])) {
				let buffer = await fetch(newSC.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
				let rgb = await colorThief.getColor(buffer);
				message.channel.send(new Discord.MessageEmbed()
					.setTitle(` `)
					.setAuthor(`Queued (#${newSC.getPosition()})`, newSC.getChannelThumbnail(), newSC.getChannelURL())
					.setDescription(`**[${newSC.getTitle()}](${newSC.getURL()})**\n[${newSC.getUploader()}](${newSC.getChannelURL()})\n\nLength: \`${newSC.getLength()}\``)
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
							index.endDispatcher(message);
						}
					})
					.catch(e => {
						logger.error(`Voice connection error\n${e}`);
					});
			} else {
				logger.error("Failed to join voice channel");
			}
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