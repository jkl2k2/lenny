const { Command } = require(`discord-akairo`);

class PingCommand extends Command {
    constructor() {
        super(`ping`, {
            aliases: [`ping`, `test`],
            category: `general`
        });
    }

    exec(message) {
        return message.channel.send(`API Ping: \`${Math.round(message.client.ws.ping)} ms\``);
    }
}

module.exports = PingCommand;