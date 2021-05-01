const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class PingCommand extends Command {
    constructor() {
        super(`ping`, {
            aliases: [`ping`, `test`],
            category: `general`
        });
    }

    exec(message) {
        return message.channel.send(new MessageEmbed()
            .setDescription(`:ping_pong: API Ping: \`${Math.round(message.client.ws.ping)} ms\``)
            .setColor(`#36393f`));
    }
}

module.exports = PingCommand;