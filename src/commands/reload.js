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
            category: `owner`
        });
    }

    exec(message, args) {
        // "this" refers to the command object
        this.handler.reload(args.commandID);
        return message.channel.send(new MessageEmbed()
            .setDescription(`:arrows_counterclockwise: Reloaded command module \`${args.commandID}\``)
            .setColor(`#36393f`));
    }
}

module.exports = ReloadCommand;