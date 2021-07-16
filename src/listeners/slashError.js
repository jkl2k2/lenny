const { Listener } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class slashErrorListener extends Listener {
    constructor() {
        super(`slashError`, {
            emitter: `commandHandler`,
            event: `slashError`
        });
    }

    async exec(err, message, command) {
        global.logger.error(`Slash command ${command} errored.\n\nMessage that errored: "${message.content}"\n\nError text: "${err}"`);
    }
}

module.exports = slashErrorListener;