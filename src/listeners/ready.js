const { Listener } = require(`discord-akairo`);
const chalk = require(`chalk`);
class ReadyListener extends Listener {
    constructor() {
        super(`ready`, {
            emitter: `client`,
            event: `ready`
        });
    }

    exec() {
        const date = new Date();

        global.logger.info(chalk.whiteBright.bgRed(`————————Bot Initialized————————`));
        if (date.getMinutes() < 10) {
            if (date.getSeconds() < 10) {
                global.logger.info(chalk.whiteBright.bgRed(`Timestamp: ${date.getHours()}:0${date.getMinutes()}:0${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
            } else {
                global.logger.info(chalk.whiteBright.bgRed(`Timestamp: ${date.getHours()}:0${date.getMinutes()}:${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
            }
        } else if (date.getSeconds() < 10) {
            global.logger.info(chalk.whiteBright.bgRed(`Timestamp: ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
        } else {
            global.logger.info(chalk.whiteBright.bgRed(`Timestamp: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
        }
        // global.logger.info(chalk.white.bgRed(`Timestamp: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
        global.logger.info(chalk.whiteBright.bgRed.bold(`———————Awaiting Commands———————`));
    }
}

module.exports = ReadyListener;