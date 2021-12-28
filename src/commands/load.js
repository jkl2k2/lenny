const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
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
        const commandPath = `./commands/${args.commandID}.js`;

        // "this" refers to the command object
        try {
            this.handler.load(commandPath);
        } catch (err) {
            global.logger.error(err);
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Error loading command module \`${args.commandID}\`\n\`\`\`${err}\`\`\``)
                        .setColor(`#36393f`)
                ]
            });
        }

        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`:arrow_right: Loaded command module \`${args.commandID}\``)
                    .setColor(`#36393f`)
            ]
        });
    }
}

module.exports = LoadCommand;