const index = require(`../../index.js`);
const musicConstructor = require(`../../modules/musicConstructor.js`);
const player = require(`../../modules/musicPlayer`);
const config = require('config');
const scdl = require(`soundcloud-downloader`);
const api = config.get(`Bot.api2`);
const Discord = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const logger = index.getLogger();

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

		const client = message.client;
		//#endregion

		//#region Playlist handling
		function handlePlaylist() {
			youtube.getPlaylist(args[0])
				.then(async playlist => {
					if (playlist) {
						let videos = await playlist.getVideos();

						const queue = message.guild.music.queue;

						if (playlist.thumbnails.default) {
							message.channel.send(new Discord.MessageEmbed()
								.setAuthor(`➕ Queued playlist`)
								.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
								.setThumbnail(playlist.thumbnails.default.url)
								.setTimestamp()
								.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
								.setColor(`#36393f`));
						} else if (videos[0].thumbnails.default) {
							message.channel.send(new Discord.MessageEmbed()
								.setAuthor(`➕ Queued playlist`)
								.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
								.setThumbnail(videos[0].maxRes.url)
								.setTimestamp()
								.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
								.setColor(`#36393f`));
						} else {
							message.channel.send(new Discord.MessageEmbed()
								.setAuthor(`➕ Queued playlist`)
								.setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
								.setTimestamp()
								.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL()));
						}

						// Set up counter for how many private videos are in the playlist
						let privateCounter = 0;

						// Queue videos
						for (var i = videos.length - 1; i >= 0; i--) {
							const newVideo = musicConstructor.constructVideo(videos[i], message.member);
							if (newVideo.getTitle() == "Private video") {
								privateCounter++;
							} else {
								queue.unshift(newVideo);
							}
						}

						// Show how many videos were private
						if (privateCounter > 0)
							message.channel.send(new Discord.MessageEmbed()
								.setDescription(`:information_source: ${privateCounter} video(s) from the playlist could not be added due to privacy settings`)
								.setColor(`#36393f`));

						if (!message.member.voice.channel) return logger.warn(`User not in voice channel after playlist processing`);

						if (client.voice.connections.get(message.member.voice.channel)) {
							// if already in vc
							let connection = client.voice.connections.get(message.member.voice.channel);
							if (!message.guild.music.speaking) {
								return player.play(message);
							} else {
								return message.guild.music.dispatcher.end();
							}
						}

						if (message.member.voice.channel) {
							message.member.voice.channel.join()
								.then(connection => {
									if (!message.guild.music.playing) {
										return player.play(message);
									} else {
										return message.guild.music.dispatcher.end();
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
							.setColor(`#36393f`));
					}
				});
		}
		//#endregion

		//#region Regular video / livestream handling
		async function process(input) {
			// Construct a new YTVideo
			const newVideo = musicConstructor.constructVideo(input, message.member);

			// Easy access to music data
			let music = message.guild.music;

			// Define the music-related variables
			const queue = music.queue;

			// Add new video to queue
			queue.unshift(newVideo);

			/*
			if (await newVideo.getLength() == "0:00") {
				if (music.playing) {
					message.channel.send(new Discord.MessageEmbed()
						.setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
						.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\n\`YouTube Livestream\``)
						.setThumbnail(newVideo.getThumbnail())
						.setTimestamp()
						.setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar())
						.setColor(`#36393f`));
				}
			} else {
				if (music.playing) {
					message.channel.send(new Discord.MessageEmbed()
						.setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
						.setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\nLength: \`${await newVideo.getLength()}\``)
						.setThumbnail(newVideo.getThumbnail())
						.setTimestamp()
						.setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar())
						.setColor(`#36393f`));
				}
			}
			*/

			if (!message.member.voice.channel) return logger.warn(`User not in voice channel after video processing`);

			if (client.voice.connections.get(message.member.voice.channel)) {
				// if already in vc
				// let connection = client.voice.connections.get(message.member.voice.channel);
				if (!music.playing /* && !connection.voice.speaking */) {
					return player.play(message);
				} else {
					return message.guild.music.dispatcher.end();
				}
			}

			if (message.member.voice.channel) {
				message.member.voice.channel.join()
					.then(connection => {
						if (!music.playing /* && !connection.voice.speaking */) {
							return player.play(message);
						} else {
							message.guild.music.dispatcher.end();
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
								.setColor(`#36393f`));
						}
					});
			}
		}
		//#endregion

		//#region SoundCloud handling
		async function handleSoundCloud() {
			const queue = message.guild.music.queue;

			if (!scdl.isValidUrl(args[0])) {
				return message.channel.send(new Discord.MessageEmbed()
					.setDescription(`<:cross:729019052571492434> Sorry, ${message.author.username}, a SoundCloud URL was detected, but it is invalid`)
					.setColor(`#FF3838`));
			}

			const info = await scdl.getInfo(args[0]);

			const newSC = musicConstructor.constructSC(message.member, info);

			queue.unshift(newSC);

			// Skip sending details message if not playing (avoids spam)
			/*
			if (message.guild.music.playing) {
				message.channel.send(new Discord.MessageEmbed()
					.setAuthor(`Queued (#${newSC.getPosition()})`, newSC.getChannelThumbnail(), newSC.getURL())
					.setDescription(`**[${newSC.getTitle()}](${newSC.getURL()})**\n[${newSC.getChannelName()}](${newSC.getChannelURL()})\n\nLength: \`${newSC.getLength()}\``)
					.setThumbnail(newSC.getThumbnail())
					.setFooter(`Requested by ${newSC.getRequesterName()}`, newSC.getRequesterAvatar())
					.setTimestamp()
					.setColor(`#36393f`));
			}
			*/

			if (!message.member.voice.channel) return logger.warn(`User not in voice channel after playlist processing`);

			if (client.voice.connections.get(message.member.voice.channel)) {
				// if already in vc
				let connection = client.voice.connections.get(message.member.voice.channel);
				if (!message.guild.music.playing) {
					return player.play(message);
				} else {
					return message.guild.music.dispatcher.end();
				}
			}

			if (message.member.voice.channel) {
				message.member.voice.channel.join()
					.then(connection => {
						if (!message.guild.music.playing) {
							return player.play(message);
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