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

        let first = false;

        this.client.user.setActivity(`updating...`, { type: `PLAYING` });
        this.client.user.setStatus(`dnd`);

        const updatingMessage = setInterval(() => {
            if (first) {
                this.client.user.setActivity(`updating...`, { type: `PLAYING` });
                this.client.user.setStatus(`dnd`);

                first = false;
            } else {
                this.client.user.setActivity(`commands may not work...`, { type: `PLAYING` });

                first = true;
            }
        }, 15000);

        setTimeout(() => {
            clearInterval(updatingMessage);

            let totalMusicTimeMs = 0;

            for (const guild of this.client.guilds.cache.array()) {
                // Ensure serverStats exist
                const serverStats = this.client.stats.ensure(guild.id, this.client.stats.default);
                totalMusicTimeMs += serverStats[`musicTime`];
            }

            setInterval(() => {
                if (first) {
                    this.client.user.setActivity(`music for ${Math.floor(totalMusicTimeMs / 1000 / 60 / 60)} hours`, { type: `LISTENING` });
                    this.client.user.setStatus(`online`);

                    first = false;
                } else {
                    this.client.user.setActivity(`music with ${this.client.users.cache.size} users`, { type: `LISTENING` });
                    this.client.user.setStatus(`online`);

                    first = true;
                }
            }, 30000);
        }, 605000);
    }
}

module.exports = ReadyListener;