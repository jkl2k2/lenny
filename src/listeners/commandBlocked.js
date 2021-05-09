const { Listener } = require(`discord-akairo`);

class CommandBlockedListener extends Listener {
    constructor() {
        super(`commandBlocked`, {
            emitter: `commandHandler`,
            event: `commandBlocked`
        });
    }

    exec(message, command, reason) {
        global.logger.info(`User "${message.author.tag}" was blocked from using command "${command.id}" because of reason "${reason}"`);
    }
}

module.exports = CommandBlockedListener;