const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class TemplateCommand extends Command {
    constructor() {
        super(`template`, {
            aliases: [`alias`],
            category: `category`,
            description: `Description`,
            channel: `guild`
        });
    }

    exec() {
        return;
    }
}

//TODO: Change export
module.exports = TemplateCommand;