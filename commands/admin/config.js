const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const Enmap = require(`enmap`);
const client = index.getClient();

module.exports = {
    name: 'config',
    description: 'Center for server-related functionality',
    // aliases: ['aliases'],
    args: true,
    usage: 'view',
    altUsage: 'set [option] [value]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [`ADMINISTRATOR`],
        id: [],
    },
    type: 'admin',
    execute(message, args) {
        const serverConfig = client.settings.ensure(message.guild.id, client.settings.default);

        let action = args.shift();

        const [key, ...value] = args;

        if (action == `view`) {
            // Display server config
            return message.channel.send(new Discord.MessageEmbed()
                .setAuthor(`Dashboard - ${message.guild.name}\nID: ${message.guild.id}`, message.guild.iconURL())
                .addField(`General Settings`, `prefix: \`${serverConfig[`prefix`]}\``)
                .addField(`Mod Log`, `modLogEnabled: \`${serverConfig[`modLogEnabled`]}\`\nmodLogChannel: \`${serverConfig[`modLogChannel`]}\``)
                .addField(`Welcome Message`, `welcomeEnabled: \`${serverConfig[`welcomeEnabled`]}\`\nwelcomeChannel: \`${serverConfig[`welcomeChannel`]}\`\nwelcomeMessage: \`${serverConfig[`welcomeMessage`]}\`\ngoodbyeMessage: \`${serverConfig[`goodbyeMessage`]}\``)
                .setColor(`#0083FF`));

        } else if (action == `set`) {
            // Check for missing setting to change
            if (!key) return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> ${message.author.username}, please provide a setting to change`)
                .setColor(`#FF3838`));

            // Check for missing value to change to
            if (!value) return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> ${message.author.username}, please provide a value to change to`)
                .setColor(`#FF3838`));

            // If key/setting not valid
            if (!client.settings.has(message.guild.id, key)) return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> ${message.author.username}, \`${key}\` is not a valid setting`)
                .setColor(`#FF3838`));

            // Change setting
            client.settings.set(message.guild.id, value.join(" "), key);

            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:check:728881238970073090> Setting \`${key}\` successfully changed to \`${value.join(` `)}\``)
                .setFooter(`Changed by ${message.author.username}`, message.author.avatarURL())
                .setTimestamp()
                .setColor(`#2EC14E`));
        }
    }
};