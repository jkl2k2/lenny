const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class UnloadCommand extends Command {
    constructor() {
        super(`unload`, {
            aliases: [`unload`],
            args: [
                {
                    id: `commandID`
                }
            ],
            ownerOnly: true,
            category: `owner`,
            description: `Unloads a command module`
        });
    }

    exec(message, args) {
        // "this" refers to the command object
        try {
            this.handler.remove(args.commandID);
        } catch (error) {
            console.debug(error);
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Error unloading command module \`${args.commandID}\`\n\`\`\`${error}\`\`\``)
                .setColor(`#36393f`));
        }
        return message.channel.send(new MessageEmbed()
            .setDescription(`:eject: Unloaded command module \`${args.commandID}\``)
            .setColor(`#36393f`));
    }
}

module.exports = UnloadCommand;