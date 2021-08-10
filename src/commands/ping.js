const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
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
        const sent = await message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`\n:clock3: **Reply Time**\n\`Testing...\`\n\n:heartbeat: **API Ping**\n\`${Math.round(message.client.ws.ping)} ms\``)
                    .setColor(`#36393f`)
            ]
        });

        let description = ``;

        if ((sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt) > 300) {
            // High reply time
            description += `:clock3: **Reply Time** - :warning: \`High\`\n\`${(sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt)} ms\`\n\n`;
        } else {
            // Normal reply time
            description += `:clock3: **Reply Time** - <:check:728881238970073090> \`Normal\`\n\`${(sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt)} ms\`\n\n`;
        }

        if (Math.round(message.client.ws.ping) > 100) {
            // High heartbeat ping
            description += `:heartbeat: **API Ping:** - :warning: \`High\`\n\`${Math.round(message.client.ws.ping)}\``;
        } else {
            // Normal heartbeat ping
            description += `:heartbeat: **API Ping:** - <:check:728881238970073090> \`Normal\`\n\`${Math.round(message.client.ws.ping)}\``;
        }

        return sent.edit(
            {
                embeds: [
                    new MessageEmbed()
                        .setDescription(description)
                        .setColor(`#36393f`)
                ],
            }
        );
    }
}

module.exports = PingCommand;