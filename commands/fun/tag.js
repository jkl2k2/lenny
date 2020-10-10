const index = require(`../../index`);
const { MessageEmbed } = require(`discord.js`);
const Tags = index.getTags();

// Check attachments function
function extension(attachment) {
    const imageLink = attachment.split('.');
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
    if (!image) return '';
    return attachment;
}

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
                .addField(`${serverConfig[`prefix`]}tag list`, `List all tags`)
                .addField(`${serverConfig[`prefix`]}tag info`, `Shows info on a specific tag`));
        }

        // If creating a tag
        if (args[0] == `create`) {
            // Create tag
            if (!args[1]) {
                // If name and tag body missing
                message.channel.send(new MessageEmbed()
                    .setDescription(`:label: What would you like to name the tag?\n\n*Keep in mind all tag names must have no spaces*`)
                    .setFooter(`Type 'cancel' to stop`)
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
                            .setDescription(`:scroll: What would you like the body of the tag to be?`)
                            .setFooter(`Type 'cancel' to stop`)
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

                                // Check if body has anything attached
                                let image = body.attachments.size > 0 ? extension(body.attachments.array()[0].url) : '';

                                let imageBody = '';

                                // If image exists, get its URL
                                if (image.length > 0) {
                                    imageBody = extension(image);
                                }

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
                                        description: body.content || imageBody,
                                        author_username: message.author.tag,
                                        author_id: message.author.id,
                                        guild_id: message.guild.id
                                    });

                                    console.log(`Name: ${tag.name}\nID: ${tag.id}\nDescription: ${tag.description}\nAuthor username: ${tag.author_username}\nAuthor ID: ${tag.author_id}\nGuild ID: ${tag.guild_id}`);

                                    // Respond with success
                                    return message.channel.send(new MessageEmbed()
                                        .setDescription(`<:check:728881238970073090> Successfully created tag \`${tag.name}\``)
                                        .setFooter(`Creator: ${message.author.tag}`, message.author.avatarURL())
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

                // Check if image attached
                let image = message.attachments.size > 0 ? extension(message.attachments.array()[0].url) : '';

                let imageBody = '';

                // If image exists, get its URL
                if (image.length > 0) {
                    imageBody = extension(image);
                }

                // If image exists, skip asking for the body
                if (imageBody) {
                    // Create tag
                    try {
                        const tag = await Tags.create({
                            id: `${name}-${Math.floor(Math.random() * (999999999999999))}`,
                            name: name,
                            description: imageBody,
                            author_username: message.author.tag,
                            author_id: message.author.id,
                            guild_id: message.guild.id
                        });

                        console.log(`Name: ${tag.name}\nID: ${tag.id}\nDescription: ${tag.description}\nAuthor username: ${tag.author_username}\nAuthor ID: ${tag.author_id}\nGuild ID: ${tag.guild_id}`);

                        // Respond with success
                        return message.channel.send(new MessageEmbed()
                            .setDescription(`<:check:728881238970073090> Successfully created tag \`${tag.name}\``)
                            .setFooter(`Creator: ${message.author.tag}`, message.author.avatarURL())
                            .setColor(`#2EC14E`));
                    }
                    catch (e) {
                        message.channel.send('Something went wrong with adding a tag.');
                        console.error(e);
                    }
                }

                // Ask for tag body
                message.channel.send(new MessageEmbed()
                    .setDescription(`:scroll: What would you like the body of the tag to be?`)
                    .setFooter(`Type 'cancel' to stop`)
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

                        // Check if body has anything attached
                        let image = body.attachments.size > 0 ? extension(body.attachments.array()[0].url) : '';

                        let imageBody = '';

                        // If image exists, get its URL
                        if (image.length > 0) {
                            imageBody = extension(image);
                        }

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
                                description: body.content || imageBody,
                                author_username: message.author.tag,
                                author_id: message.author.id,
                                guild_id: message.guild.id
                            });

                            console.log(`Name: ${tag.name}\nID: ${tag.id}\nDescription: ${tag.description}\nAuthor username: ${tag.author_username}\nAuthor ID: ${tag.author_id}\nGuild ID: ${tag.guild_id}`);

                            // Respond with success
                            return message.channel.send(new MessageEmbed()
                                .setDescription(`<:check:728881238970073090> Successfully created tag \`${tag.name}\``)
                                .setFooter(`Creator: ${message.author.tag}`, message.author.avatarURL())
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

                // Check if body has anything attached
                let image = message.attachments.size > 0 ? extension(message.attachments.array()[0].url) : '';

                let imageBody = '';

                // If image exists, get its URL
                if (image.length > 0) {
                    imageBody = extension(image);
                }

                console.log(imageBody);

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
                        description: body || imageBody,
                        author_username: message.author.tag,
                        author_id: message.author.id,
                        guild_id: message.guild.id
                    });

                    console.log(`Name: ${tag.name}\nID: ${tag.id}\nDescription: ${tag.description}\nAuthor username: ${tag.author_username}\nAuthor ID: ${tag.author_id}\nGuild ID: ${tag.guild_id}`);

                    // Respond with success
                    return message.channel.send(new MessageEmbed()
                        .setDescription(`<:check:728881238970073090> Successfully created tag \`${tag.name}\``)
                        .setFooter(`Creator: ${message.author.tag}`, message.author.avatarURL())
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
        if (args[0] == `edit`) {

            // Remove keyword
            args.shift();

            // Extract name
            let name = args.shift();

            // Use remaining elements in array as body
            let body = args.join(" ");

            // Find tag
            const tag = await Tags.findOne({ where: { name: name, guild_id: message.guild.id } });

            // Permissions check
            if (!message.member.hasPermission(`MANAGE_MESSAGES`) && !message.member.hasPermission(`ADMINISTRATOR`) && message.author.id != tag.author_id) {
                return message.channel.send(new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> Sorry, ${message.author.username}, you do not have permission to delete that tag`)
                    .setColor(`#FF3838`));
            }

            const affectedRows = await Tags.update({ description: body }, { where: { name: name } });
            if (affectedRows > 0) {
                // Respond with success
                return message.channel.send(new MessageEmbed()
                    .setDescription(`<:check:728881238970073090> Successfully edited tag \`${tag.name}\``)
                    .setFooter(`Editor: ${message.author.tag}`, message.author.avatarURL())
                    .setColor(`#2EC14E`));
            }
        }

        // If displaying tag list
        if (args[0] == `list`) {
            // Fetch all tags
            const tagList = await Tags.findAll({ attributes: ['name', 'guild_id'] });

            // Map tags
            const tagString = tagList.filter(tag => tag.guild_id == message.guild.id).map(t => t.name).join(', ') || 'There are no tags in this server';

            return message.channel.send(new MessageEmbed()
                .setAuthor(`Tags in ${message.guild.name}`, message.guild.iconURL())
                .setDescription(tagString)
                .setColor(`#36393f`));
        }

        if (args[0] == `info`) {
            const tag = await Tags.findOne({ where: { name: args[1], guild_id: message.guild.id } });
            if (tag) {
                return message.channel.send(new MessageEmbed()
                    .setAuthor(`Tag info`)
                    .setDescription(`\`Name:\` ${tag.name}\n\`ID:\` ${tag.id}\n\`Body:\` ${tag.description}\n\`Author username:\` ${tag.author_username}\n\`Author ID:\` ${tag.author_id}\n\`Guild ID:\` ${tag.guild_id}\n\`Times used:\` ${tag.usage_count}`)
                    .setColor(`#36393f`));
            }
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Could not find tag \`${args[1]}\``)
                .setColor(`#FF3838`));
        }

        // If looking for a tag
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
    }
};