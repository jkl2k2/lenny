const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class ReloadCommand extends Command {
    constructor() {
        super(`reload`, {
            aliases: [`reload`],
            args: [
                {
                    id: `commandID`
                }
            ],
            ownerOnly: true,
            category: `owner`,
            description: `Reloads a command module`
        });
    }

    exec(message, args) {
        // "this" refers to the command object
        try {
            this.handler.reload(args.commandID);
        } catch (err) {
            global.logger.error(err.message);
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Error reloading command module \`${args.commandID}\`\n\`\`\`${err}\`\`\``)
                .setColor(`#36393f`));
        }

        return message.channel.send(new MessageEmbed()
            .setDescription(`:arrows_counterclockwise: Reloaded command module \`${args.commandID}\``)
            .setColor(`#36393f`));
    }
}

module.exports = ReloadCommand;