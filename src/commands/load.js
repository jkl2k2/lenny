const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class LoadCommand extends Command {
    constructor() {
        super(`load`, {
            aliases: [`load`],
            args: [
                {
                    id: `commandID`
                }
            ],
            ownerOnly: true,
            category: `owner`,
            description: `Loads a command module`
        });
    }

    exec(message, args) {
        // Really should not be doing this but I can't figure any other way out
        const commandPath = `C:\\Users\\Joshua\\Desktop\\Bots\\Lenny Akairo\\src\\commands\\${args.commandID}.js`;

        // "this" refers to the command object
        try {
            this.handler.load(commandPath);
        } catch (err) {
            global.logger.error(err);
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Error loading command module \`${args.commandID}\`\n\`\`\`${err}\`\`\``)
                .setColor(`#36393f`));
        }

        return message.channel.send(new MessageEmbed()
            .setDescription(`:arrow_right: Loaded command module \`${args.commandID}\``)
            .setColor(`#36393f`));
    }
}

module.exports = LoadCommand;