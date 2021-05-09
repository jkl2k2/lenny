const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class PingCommand extends Command {
    constructor() {
        super(`ping`, {
            aliases: [`ping`, `test`],
            category: `general`,
            description: `Displays the Discord websocket heartbeat ping`,
            ratelimit: 2
        });

    }

    async exec(message) {
        const sent = await message.channel.send(new MessageEmbed()
            .setDescription(`:ping_pong: Pong \nReply Time: \`Testing...\`\nAPI Ping: \`${Math.round(message.client.ws.ping)} ms\``)
            .setColor(`#36393f`));
        return sent.edit(new MessageEmbed()
            .setDescription(`:ping_pong: Pong \n Reply Time: \`${(sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt)} ms\`\nAPI Ping: \`${Math.round(message.client.ws.ping)} ms\``)
            .setColor(`#36393f`));
    }
}

module.exports = PingCommand;