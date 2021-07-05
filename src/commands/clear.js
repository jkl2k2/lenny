const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class ClearCommand extends Command {
    constructor() {
        super(`clear`, {
            aliases: [`clear`, `clearqueue`],
            category: `music`,
            description: `Clears out the queue`,
            channel: `guild`
        });
    }

    exec(message) {
        return;
    }
}

module.exports = ClearCommand;