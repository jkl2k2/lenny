const { Listener } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class slashErrorListener extends Listener {
    constructor() {
        super(`slashError`, {
            emitter: `commandHandler`,
            event: `slashError`
        });
    }

    async exec(err) {
        global.logger.error(`Slash command errored.\n\n${err}`);
    }
}

module.exports = slashErrorListener;