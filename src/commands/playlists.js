/*jshint esversion: 11 */

const { Command } = require(`discord-akairo`);
const { MessageEmbed, MessageButton, MessageActionRow } = require(`discord.js`);
const play = require(`play-dl`);
const paginationEmbed = require(`discordjs-button-pagination`);
const PlayCommand = require(`./play`);

async function listResolver(arr, index) {
    if (arr[index]) {
        return `\`${index + 1}.\` **[${arr[index].title}](${arr[index].url})**\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0By: **[${arr[index].channel.name}](${arr[index].channel.url})**`;
    } else {
        return " ";
    }
}

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class PlaylistsCommand extends Command {
    constructor() {
        super(`playlists`, {
            aliases: [`playlists`],
            category: `music`,
            description: `Add, manage, and play from your saved playlists`,
            slash: true,
            slashOptions: [
                {
                    name: `action`,
                    type: `STRING`,
                    description: `Choose what action to take (play, view, save/add, or delete). Don't include any URLs.`,
                    required: false
                }
            ],
            channel: `guild`
        });
    }

    exec() {
        return;
    }

    async execSlash(message, args) {
        const userPlaylists = message.client.userPlaylists.ensure(message.author.id, message.client.userPlaylists.default);

        if (!args.action || args.action === `view`) {
            if (userPlaylists[`savedPlaylists`].length === 0) {
                return await message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`:information_source: You have no saved playlists`)
                            .setColor(`#36393f`)
                    ]
                });
            }

            if (userPlaylists[`savedPlaylists`].length <= 5) {
                return message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`${message.author.username}'s playlists`, message.author.avatarURL())
                            .setDescription(`${await listResolver(userPlaylists[`savedPlaylists`], 0)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 1)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 2)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 3)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 4)}`)
                    ]
                });
            } else {
                let pages = [];

                for (let page = 0; page < userPlaylists[`savedPlaylists`].length / 5; page++) {
                    pages.push(new MessageEmbed()
                        .setAuthor(`${message.author.username}'s playlists`, message.author.avatarURL())
                        .setDescription(`${await listResolver(userPlaylists[`savedPlaylists`], 0 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 1 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 2 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 3 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 4 + page * 5)}`));
                }

                const button1 = new MessageButton()
                    .setCustomId('previousbtn')
                    .setLabel('Previous')
                    .setStyle('DANGER');

                const button2 = new MessageButton()
                    .setCustomId('nextbtn')
                    .setLabel('Next')
                    .setStyle('SUCCESS');

                const buttons = [
                    button1,
                    button2
                ];

                await paginationEmbed(message.interaction, pages, buttons, 120000);
            }
        } else if (args.action === `save` || args.action === `add`) {
            await message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:arrow_right: Next, send the URL of the playlist into the chat`)
                        .setFooter(`Type "cancel" to stop`)
                        .setColor(`#36393f`)
                ]
            });

            const filter = m => m.author.id == message.author.id;
            const urlCollector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

            urlCollector.on(`collect`, async url => {
                await url.delete();

                urlCollector.stop();

                if (url.content.includes(`cancel`)) {
                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`:stop_button: Canceled saving playlist`)
                                .setColor(`#36393f`)
                        ]
                    });
                } else if (url.content.includes(`/playlist?list=`)) {
                    // YouTube playlist
                    const info = await play.playlist_info(url.content);

                    const filter = m => m.author.id == message.author.id && (m.content.toLowerCase() === `yes` || m.content.toLowerCase() === `no`);
                    const confirmCollector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`💾 Saving YouTube playlist`)
                                .setDescription(`**[${info.title}](${info.url})**\n[${info.channel.name ?? `YouTube Playlist`}](${info.channel.url ?? ``}) \n\n **Is this correct? (yes/no)**`)
                                .setThumbnail(info.thumbnail?.url ?? info.videos[0].thumbnails[0]?.url)
                                .setColor(`#36393f`)
                        ]
                    });

                    confirmCollector.on(`collect`, async confirm => {
                        if (confirm.content.toLowerCase() === `yes`) {
                            let newList = [...userPlaylists[`savedPlaylists`]];

                            newList.push(info);
                            await this.client.userPlaylists.set(message.author.id, newList, `savedPlaylists`);

                            await confirm.delete();

                            message.interaction.editReply({
                                embeds: [
                                    new MessageEmbed()
                                        .setAuthor(`🟢 Saved YouTube playlist`)
                                        .setDescription(`**[${info.title}](${info.url})**\n[${info.channel.name ?? `YouTube Playlist`}](${info.channel.url ?? ``})`)
                                        .setThumbnail(info.thumbnail?.url ?? info.videos[0].thumbnails[0]?.url)
                                        .setColor(`#36393f`)
                                ]
                            });

                            confirmCollector.stop();
                        } else {
                            message.interaction.editReply({
                                embeds: [
                                    new MessageEmbed()
                                        .setDescription(`:stop_button: Canceled saving playlist`)
                                        .setColor(`#36393f`)
                                ]
                            });

                            confirmCollector.stop();
                        }
                    });

                    confirmCollector.on(`end`, reason => {
                        if (reason === `time`) {
                            message.interaction.editReply({
                                embeds: [
                                    new MessageEmbed()
                                        .setDescription(`:stop_button: Canceled saving playlist`)
                                        .setColor(`#36393f`)
                                ]
                            });
                        }
                    });
                } else if (url.content.includes(`spotify.com/`)) {
                    // Spotify playlist
                    if (play.is_expired()) {
                        await play.refreshToken();
                    }

                    if (play.sp_validate(url.content) === `playlist` || play.sp_validate(url.content) === `album`) {
                        const sp_data = await play.spotify(url.content);

                        const filter = m => m.author.id == message.author.id && m.content.toLowerCase() === `yes` || m.content.toLowerCase() === `no`;
                        const confirmCollector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                        message.interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`💾 Saving Spotify playlist`)
                                    .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.owner?.name || sp_data.artists[0].name}](${sp_data.owner?.url || sp_data.artists[0].url}) \n\n **Is this correct? (yes/no)**`)
                                    .setThumbnail(sp_data.thumbnail?.url || sp_data.page(1)[0].thumbnail?.url)
                                    .setColor(`#36393f`)
                            ]
                        });

                        confirmCollector.on(`collect`, async confirm => {
                            if (confirm.content.toLowerCase() === `yes`) {
                                let newList = [...userPlaylists[`savedPlaylists`]];

                                newList.push({
                                    title: sp_data.name,
                                    url: sp_data.url,
                                    channel: {
                                        name: sp_data.owner?.name || sp_data.artists[0].name,
                                        url: sp_data.owner?.url || sp_data.artists[0].url
                                    }
                                });
                                await this.client.userPlaylists.set(message.author.id, newList, `savedPlaylists`);

                                await confirm.delete();

                                message.interaction.editReply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setAuthor(`🟢 Saved Spotify playlist`)
                                            .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.owner?.name || sp_data.artists[0].name}](${sp_data.owner?.url || sp_data.artists[0].url})`)
                                            .setThumbnail(sp_data.thumbnail?.url || sp_data.page(1)[0].thumbnail?.url)
                                            .setColor(`#36393f`)
                                    ]
                                });

                                confirmCollector.stop();
                            } else {
                                message.interaction.editReply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setDescription(`:stop_button: Canceled saving playlist`)
                                            .setColor(`#36393f`)
                                    ]
                                });

                                confirmCollector.stop();
                            }
                        });

                        confirmCollector.on(`end`, reason => {
                            if (reason === `time`) {
                                message.interaction.editReply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setDescription(`:stop_button: Canceled saving playlist`)
                                            .setColor(`#36393f`)
                                    ]
                                });
                            }
                        });
                    } else {
                        return message.interaction.editReply(`Spotify URL was invalid`);
                    }
                } else if (url.content.includes(`soundcloud.com/`)) {
                    // SoundCloud playlist
                    if (url.content.includes(`/sets/`) && !url.content.includes(`?in=`)) {
                        const so_data = await play.soundcloud(url.content);

                        const filter = m => m.author.id == message.author.id && m.content.toLowerCase() === `yes` || m.content.toLowerCase() === `no`;
                        const confirmCollector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                        message.interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`💾 Saving SoundCloud playlist`)
                                    .setDescription(`**[${so_data.name}](${url.content})**\n[${so_data.user.name}](${so_data.user.url})\n\n**Is this correct? (yes/no)**`)
                                    .setThumbnail(so_data.tracks[0].thumbnail)
                                    .setColor(`#36393f`)
                            ]
                        });

                        confirmCollector.on(`collect`, async confirm => {
                            if (confirm.content.toLowerCase() === `yes`) {
                                let newList = [...userPlaylists[`savedPlaylists`]];

                                newList.push({
                                    title: so_data.name,
                                    url: url.content,
                                    channel: {
                                        name: so_data.user?.name,
                                        url: so_data.user?.url
                                    }
                                });
                                await this.client.userPlaylists.set(message.author.id, newList, `savedPlaylists`);

                                await confirm.delete();

                                message.interaction.editReply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setAuthor(`🟢 Saved SoundCloud playlist`)
                                            .setDescription(`**[${so_data.name}](${so_data.url})**\n[${so_data.user.name}](${so_data.user.url})`)
                                            .setThumbnail(so_data.tracks[0].thumbnail)
                                            .setColor(`#36393f`)
                                    ]
                                });

                                confirmCollector.stop();
                            } else {
                                message.interaction.editReply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setDescription(`:stop_button: Canceled saving playlist`)
                                            .setColor(`#36393f`)
                                    ]
                                });

                                confirmCollector.stop();
                            }
                        });

                        confirmCollector.on(`end`, reason => {
                            if (reason === `time`) {
                                message.interaction.editReply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setDescription(`:stop_button: Canceled saving playlist`)
                                            .setColor(`#36393f`)
                                    ]
                                });
                            }
                        });
                    } else {
                        return message.interaction.editReply(`SoundCloud URL was invalid`);
                    }
                } else {
                    return message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`That link was invalid. Only playlists from YouTube, Spotify, and SoundCloud are supported`)
                        ]
                    });
                }
            });
        } else if (args.action === `delete`) {
            if (userPlaylists[`savedPlaylists`].length === 0) {
                return await message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`:information_source: You have no saved playlists`)
                            .setColor(`#36393f`)
                    ]
                });
            } else if (userPlaylists[`savedPlaylists`].length <= 5) {
                message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`${message.author.username}'s playlists`, message.author.avatarURL())
                            .setDescription(`${await listResolver(userPlaylists[`savedPlaylists`], 0)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 1)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 2)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 3)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 4)}`)
                    ]
                });
            } else {
                let pages = [];

                for (let page = 0; page < userPlaylists[`savedPlaylists`].length / 5; page++) {
                    pages.push(new MessageEmbed()
                        .setAuthor(`${message.author.username}'s playlists`, message.author.avatarURL())
                        .setDescription(`${await listResolver(userPlaylists[`savedPlaylists`], 0 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 1 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 2 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 3 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 4 + page * 5)}`));
                }

                const button1 = new MessageButton()
                    .setCustomId('previousbtn')
                    .setLabel('Previous')
                    .setStyle('DANGER');

                const button2 = new MessageButton()
                    .setCustomId('nextbtn')
                    .setLabel('Next')
                    .setStyle('SUCCESS');

                const buttons = [
                    button1,
                    button2
                ];

                await paginationEmbed(message.interaction, pages, buttons, 120000);
            }

            const sent = await message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Please enter the number next to the playlist you would like to delete`)
                        .setFooter(`Type "cancel" to stop`)
                        .setColor(`#36393f`)
                ]
            });

            const filter = m => m.author.id == message.author.id;
            const urlCollector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

            urlCollector.on(`collect`, async pos => {
                urlCollector.stop();

                await sent.delete();

                if (pos.content.includes(`cancel`)) {
                    await pos.delete();

                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`:stop_button: Canceled deleting playlist`)
                                .setColor(`#36393f`)
                        ]
                    });
                } else if (userPlaylists[`savedPlaylists`][parseInt(pos.content) - 1]) {
                    await message.interaction.deleteReply();
                    const sureMessage = await message.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🗑️ Deleting playlist`)
                                .setDescription(`Are you sure you want to delete [${userPlaylists[`savedPlaylists`][parseInt(pos.content) - 1].title}](${userPlaylists[`savedPlaylists`][parseInt(pos.content) - 1].url})? (yes/no)`)
                                .setColor(`#36393f`)
                        ]
                    });

                    await pos.delete();

                    const filter = m => m.author.id == message.author.id && (m.content.toLowerCase() === `yes` || m.content.toLowerCase() === `no`);
                    const confirmCollector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                    confirmCollector.on(`collect`, async confirm => {
                        confirmCollector.stop();

                        await sureMessage.delete();
                        await confirm.delete();

                        if (confirm.content.toLowerCase() === `yes`) {
                            let newList = [...userPlaylists[`savedPlaylists`]];
                            const deleted = newList.splice(parseInt(pos.content) - 1, 1);
                            await this.client.userPlaylists.set(message.author.id, newList, `savedPlaylists`);
                            message.channel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setAuthor(`🗑️ Deleted playlist`)
                                        .setDescription(`Deleted [${deleted[0].title}](${deleted[0].url})`)
                                        .setColor(`#36393f`)
                                ]
                            });

                        } else {
                            message.interaction.editReply({
                                embeds: [
                                    new MessageEmbed()
                                        .setDescription(`:stop_button: Canceled deleting playlist`)
                                        .setColor(`#36393f`)
                                ]
                            });
                        }
                    });
                } else {
                    message.channel.send(`Not a valid number`);
                }
            });
        } else if (args.action === `play`) {
            if (userPlaylists[`savedPlaylists`].length === 0) {
                return await message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`:information_source: You have no saved playlists`)
                            .setColor(`#36393f`)
                    ]
                });
            } else if (userPlaylists[`savedPlaylists`].length <= 5) {
                await message.interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`${message.author.username}'s playlists`, message.author.avatarURL())
                            .setDescription(`${await listResolver(userPlaylists[`savedPlaylists`], 0)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 1)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 2)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 3)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 4)}`)
                    ]
                });
            } else {
                let pages = [];

                for (let page = 0; page < userPlaylists[`savedPlaylists`].length / 5; page++) {
                    pages.push(new MessageEmbed()
                        .setAuthor(`${message.author.username}'s playlists`, message.author.avatarURL())
                        .setDescription(`${await listResolver(userPlaylists[`savedPlaylists`], 0 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 1 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 2 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 3 + page * 5)}\n\n${await listResolver(userPlaylists[`savedPlaylists`], 4 + page * 5)}`));
                }

                const button1 = new MessageButton()
                    .setCustomId('previousbtn')
                    .setLabel('Previous')
                    .setStyle('DANGER');

                const button2 = new MessageButton()
                    .setCustomId('nextbtn')
                    .setLabel('Next')
                    .setStyle('SUCCESS');

                const buttons = [
                    button1,
                    button2
                ];

                await paginationEmbed(message.interaction, pages, buttons, 120000);
            }

            const row = new MessageActionRow().addComponents([
                new MessageButton()
                    .setCustomId(`shufflebtn`)
                    .setLabel(`Shuffle: on`)
                    .setStyle(`PRIMARY`)
            ]);

            const sent = await message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Please enter the number next to the playlist you want`)
                        .setFooter(`Type "cancel" to stop`)
                        .setColor(`#36393f`)
                ],
                components: [row]
            });

            const filter = m => m.author.id == message.author.id;
            const indexCollector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });
            const buttonCollector = sent.createMessageComponentCollector(filter, { time: 60000, max: 1 });

            buttonCollector.on(`collect`, async i => {
                await i.deferUpdate();

                if (i.component.style === `PRIMARY`) {
                    const row = new MessageActionRow().addComponents([
                        new MessageButton()
                            .setCustomId(`shufflebtn`)
                            .setLabel(`Shuffle: off`)
                            .setStyle(`SECONDARY`)
                    ]);

                    await sent.edit({
                        embeds: [sent.embeds[0]],
                        components: [row]
                    });
                } else {
                    const row = new MessageActionRow().addComponents([
                        new MessageButton()
                            .setCustomId(`shufflebtn`)
                            .setLabel(`Shuffle: on`)
                            .setStyle(`PRIMARY`)
                    ]);

                    await sent.edit({
                        embeds: [sent.embeds[0]],
                        components: [row]
                    });
                }

                buttonCollector.resetTimer();
            });

            indexCollector.on(`collect`, async index => {
                indexCollector.stop();

                await sent.delete();
                await index.delete();

                if (index.content.includes(`cancel`)) {
                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`:stop_button: Canceled playing playlist`)
                                .setColor(`#36393f`)
                        ]
                    });
                } else if (userPlaylists[`savedPlaylists`][parseInt(index) - 1]) {
                    if (sent.components[0].components[0].style === `PRIMARY`) {
                        PlayCommand.prototype.execSlash(message,
                            {
                                song: userPlaylists[`savedPlaylists`][parseInt(index) - 1].url,
                            },
                            {
                                shufflePlaylist: true
                            }
                        );
                    } else {
                        PlayCommand.prototype.execSlash(message,
                            {
                                song: userPlaylists[`savedPlaylists`][parseInt(index) - 1].url,
                            },
                            {
                                shufflePlaylist: false
                            }
                        );
                    }
                } else {
                    return message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`That position was not valid`)
                        ]
                    });
                }
            });
        }
    }
}

module.exports = PlaylistsCommand;