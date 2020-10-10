const index = require(`../../index`);
const { MessageEmbed } = require(`discord.js`);
const Tags = index.getTags();

module.exports = {
    name: 'tag',
    description: 'Hub for all tag-related actions',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'fun',
    async execute(message, args) {
        // Get client
        const client = message.client;

        // Ensure serverConfig exists
        const serverConfig = client.settings.ensure(message.guild.id, client.settings.default);

        // If no arguments
        if (!args[0]) {
            // Show all available tag commands
            return message.channel.send(new MessageEmbed()
                .setAuthor(`Available tag commands`)
                .addField(`${serverConfig[`prefix`]}tag create [name]`, `Create a tag`)
                .addField(`${serverConfig[`prefix`]}tag edit [name]`, `Edit a tag`)
                .addField(`${serverConfig[`prefix`]}tag delete [name]`, `Delete a tag`)
                .addField(`${serverConfig[`prefix`]}tag list`, `List all tags`));
        }

        // If creating a tag
        if (args[0] == `create`) {
            // Create tag
            if (!args[1]) {
                // If name and tag body missing
                message.channel.send(new MessageEmbed()
                    .setDescription(`What would you like to name the tag?\nKeep in mind all tag names must have no spaces`)
                    .setFooter(`Or type 'cancel' to stop`)
                    .setColor(`#36393f`));

                // Listen for response to get tag name
                const filter = name => name.author.id == message.author.id;

                const collector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                collector.on(`collect`, name => {
                    if (name.content.toLowerCase() == `cancel`) {
                        // User canceled name entry
                        return message.channel.send(new MessageEmbed()
                            .setDescription(`<:cross:729019052571492434> Tag name entry canceled by user`)
                            .setColor(`#FF3838`));
                    } else {
                        // Name successfully acquired

                        // Ask for tag body
                        message.channel.send(new MessageEmbed()
                            .setDescription(`What would you like the body of the tag to be?`)
                            .setFooter(`Or type 'cancel' to stop`)
                            .setColor(`#36393f`));

                        // Listen for response to get tag body
                        const filter = body => body.author.id == message.author.id;

                        const collector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                        collector.on(`collect`, async body => {
                            if (body.content.toLowerCase() == `cancel`) {
                                // User canceled body entry
                                return message.channel.send(new MessageEmbed()
                                    .setDescription(`<:cross:729019052571492434> Tag body entry canceled by user`)
                                    .setColor(`#FF3838`));
                            } else {
                                // Body successfully acquired
                                const tagList = await Tags.findAll({ attributes: ['name', 'guild_id'] });

                                const uniqueCheck = element => element.name != name && element.guild_id != message.guild.id;

                                if (!tagList.some(uniqueCheck) && tagList.length > 0) {
                                    return message.channel.send(new MessageEmbed()
                                        .setDescription(`<:cross:729019052571492434> Sorry, \`${name}\` already exists`)
                                        .setColor(`#FF3838`));
                                }

                                // Create tag
                                try {
                                    const tag = await Tags.create({
                                        id: `${name.content}-${Math.floor(Math.random() * (999999999999999))}`,
                                        name: name.content,
                                        description: body.content,
                                        author_username: message.author.username,
                                        author_id: message.author.id,
                                        guild_id: message.guild.id
                                    });

                                    console.log(`Name: ${tag.name}\nID: ${tag.id}\nDescription: ${tag.description}\nAuthor username: ${tag.author_username}\nAuthor ID: ${tag.author_id}\nGuild ID: ${tag.guild_id}`);

                                    // Respond with success
                                    return message.channel.send(new MessageEmbed()
                                        .setDescription(`<:check:728881238970073090> Successfully created tag \`${tag.name}\``)
                                        .setFooter(`Creator: ${message.author.tag}`)
                                        .setColor(`#2EC14E`));
                                }
                                catch (e) {
                                    message.channel.send('Something went wrong with adding a tag.');
                                    console.error(e);
                                }
                            }
                        });
                        collector.on('end', body => {
                            // Body entry timed out
                            if (!body.size) return message.channel.send(new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> Tag body entry timed out`)
                                .setColor(`#FF3838`));
                        });
                    }
                });
                collector.on('end', name => {
                    // Name entry timed out
                    if (!name.size) return message.channel.send(new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Tag name entry timed out`)
                        .setColor(`#FF3838`));
                });
            } else if (args[1] && !args[2]) {
                // If body missing

                // Define name
                let name = args[1];

                // Ask for tag body
                message.channel.send(new MessageEmbed()
                    .setDescription(`What would you like the body of the tag to be?`)
                    .setFooter(`Or type 'cancel' to stop`)
                    .setColor(`#36393f`));

                // Listen for response to get tag body
                const filter = body => body.author.id == message.author.id;

                const collector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                collector.on(`collect`, async body => {
                    if (body.content.toLowerCase() == `cancel`) {
                        // User canceled body entry
                        return message.channel.send(new MessageEmbed()
                            .setDescription(`<:cross:729019052571492434> Tag body entry canceled by user`)
                            .setColor(`#FF3838`));
                    } else {
                        // Body successfully acquired
                        const tagList = await Tags.findAll({ attributes: ['name', 'guild_id'] });

                        const uniqueCheck = element => element.name != name && element.guild_id != message.guild.id;

                        if (!tagList.some(uniqueCheck) && tagList.length > 0) {
                            return message.channel.send(new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> Sorry, \`${name}\` already exists`)
                                .setColor(`#FF3838`));
                        }

                        // Create tag
                        try {
                            const tag = await Tags.create({
                                id: `${name}-${Math.floor(Math.random() * (999999999999999))}`,
                                name: name,
                                description: body.content,
                                author_username: message.author.username,
                                author_id: message.author.id,
                                guild_id: message.guild.id
                            });

                            console.log(`Name: ${tag.name}\nID: ${tag.id}\nDescription: ${tag.description}\nAuthor username: ${tag.author_username}\nAuthor ID: ${tag.author_id}\nGuild ID: ${tag.guild_id}`);

                            // Respond with success
                            return message.channel.send(new MessageEmbed()
                                .setDescription(`<:check:728881238970073090> Successfully created tag \`${tag.name}\``)
                                .setFooter(`Creator: ${message.author.tag}`)
                                .setColor(`#2EC14E`));
                        }
                        catch (e) {
                            message.channel.send('Something went wrong with adding a tag.');
                            console.error(e);
                        }
                    }
                });
                collector.on('end', body => {
                    // Body entry timed out
                    if (!body.size) return message.channel.send(new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Tag body entry timed out`)
                        .setColor(`#FF3838`));
                });
            } else {
                // If everything present

                // Remove keyword
                args.shift();

                // Extract name
                let name = args.shift();

                // Use remaining elements in array as body
                let body = args.join(" ");

                const tagList = await Tags.findAll({ attributes: ['name', 'guild_id'] });

                const uniqueCheck = element => element.name != name && element.guild_id != message.guild.id;

                if (!tagList.some(uniqueCheck) && tagList.length > 0) {
                    return message.channel.send(new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Sorry, \`${name}\` already exists`)
                        .setColor(`#FF3838`));
                }

                // Create tag
                try {
                    const tag = await Tags.create({
                        id: `${name}-${Math.floor(Math.random() * (999999999999999))}`,
                        name: name,
                        description: body,
                        author_username: message.author.username,
                        author_id: message.author.id,
                        guild_id: message.guild.id
                    });

                    console.log(`Name: ${tag.name}\nID: ${tag.id}\nDescription: ${tag.description}\nAuthor username: ${tag.author_username}\nAuthor ID: ${tag.author_id}\nGuild ID: ${tag.guild_id}`);

                    // Respond with success
                    return message.channel.send(new MessageEmbed()
                        .setDescription(`<:check:728881238970073090> Successfully created tag \`${tag.name}\``)
                        .setFooter(`Creator: ${message.author.tag}`)
                        .setColor(`#2EC14E`));
                }
                catch (e) {
                    message.channel.send('Something went wrong with adding a tag.');
                    console.error(e);
                }
            }
        }

        // If deleting a tag
        if (args[0] == `delete`) {
            // Find tag
            const tag = await Tags.findOne({ where: { name: args[0], guild_id: message.guild.id } });

            // Permissions check
            if (!message.member.hasPermission(`MANAGE_MESSAGES`) && !message.member.hasPermission(`ADMINISTRATOR`) && message.author.id != tag.author_id) {
                return message.channel.send(new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> Sorry, ${message.author.username}, you do not have permission to delete that tag`)
                    .setColor(`#FF3838`));
            }

            const tagName = args[1];
            const rowCount = await Tags.destroy({ where: { name: tagName, guild_id: message.guild.id } });
            if (!rowCount) return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> \`${tagName}\` is not a valid tag`)
                .setColor(`#FF3838`));

            return message.channel.send(new MessageEmbed()
                .setDescription(`<:check:728881238970073090> Deleted tag \`${tagName}\``)
                .setColor(`#2EC14E`));
        }

        // If editing a tag
        // TODO

        // If looking for a tag
        //#region Find tag
        if (args[0] != `create` && args[0] != `delete` && args[0] != `edit`) {
            const tag = await Tags.findOne({ where: { name: args[0], guild_id: message.guild.id } });
            if (tag) {
                tag.increment('usage_count');
                return message.channel.send(tag.get('description'));
            }
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Could not find tag \`${args[0]}\``)
                .setColor(`#FF3838`));
        }
        //#endregion
    }
};