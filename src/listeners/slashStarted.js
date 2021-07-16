const { Listener } = require(`discord-akairo`);
const chalk = require(`chalk`);

class slashStartedListener extends Listener {
    constructor() {
        super(`slashStarted`, {
            emitter: `commandHandler`,
            event: `slashStarted`
        });
    }

    async exec(message, args, command) {
        global.logger.info(`${chalk.cyanBright(message.author.tag)} -> ${chalk.greenBright(message.content)}`);
    }
}

module.exports = slashStartedListener;