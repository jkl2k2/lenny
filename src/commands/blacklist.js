const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class BlacklistCommand extends Command {
    constructor() {
        super(`blacklist`, {
            aliases: [`blacklist`],
            category: `admin`,
            slashOptions: [
                {
                    name: `action`,
                    type: `STRING`,
                    description: `Action to take on the blacklist. Options: "add", "remove", "view"`,
                    required: true,
                },
                {
                    name: `user`,
                    type: `MEMBER`,
                    description: `Target user`,
                    required: false,
                }
            ],
            description: `Add/remove/view the server bot blacklist`,
            channel: `guild`,
            userPermissions: [`MANAGE_GUILD`]
        });
    }

    exec() {
        return;
    }

    execSlash(message, args) {
        const blacklist = message.client.blacklist.ensure(message.guild.id, message.client.blacklist.default);

        switch (args.action.value) {
            case `add`:
                if (!args.user.value) return;
                if (blacklist[message.guild.id].indexOf(args.user.id) !== -1) {
                    return message.interaction.reply(`${args.user.tag} is already blacklisted on this server.`);
                }
                blacklist[message.guild.id].push(args.user.value.id);
                return message.interaction.reply(`${args.user.tag} has been blacklisted on this server.`);
            case `remove`:
                if (!args.user.value) return;
                if (blacklist[message.guild.id].indexOf(args.user.id) === -1) {
                    return message.interaction.reply(`${args.user.tag} is not blacklisted on this server.`);
                }
                blacklist[message.guild.id].splice(blacklist.indexOf(args.user.id), 1);
                return message.interaction.reply(`${args.user.tag} has been removed from the blacklist on this server.`);
            case `view`:
                if (blacklist[message.guild.id].length === 0) {
                    return message.interaction.reply(`The blacklist is empty on this server.`);
                }
                const embed = new MessageEmbed();
                embed.setTitle(`Blacklist on ${message.guild.name}`);
                blacklist[message.guild.id].forEach((id) => {
                    const member = message.guild.members.get(id);
                    if (member) {
                        embed.addField(`${member.tag}`, `${member.id}`);
                    }
                });
                return message.interaction.reply({ embed });
        }
    }
}

module.exports = BlacklistCommand;