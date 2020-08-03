const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const client = index.getClient();
const config = require(`config`);

module.exports = {
    name: 'ban',
    description: 'Bans a user from the server',
    // aliases: ['aliases'],
    args: true,
    usage: '[user to kick]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: ['ADMINISTRATOR'],
    },
    type: 'admin',
    execute(message, args) {
        const target = message.mentions.members.first();
        args.shift();
        if (args.length > 0) {
            return target.ban({ reason: `User banned by ${message.author.tag} for reason: "${args.join(" ")}"` })
                .catch(error => {
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Ban failed: \`${error}\``)
                        .setColor(`#FF3838`));
                });
        } else {
            return target.ban({ reason: `User banned by ${message.author.tag} for reason: **Reason not provided**` })
                .catch(error => {
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Ban failed: \`${error}\``)
                        .setColor(`#FF3838`));
                });
        }
    }
};