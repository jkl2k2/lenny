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
        global.logger.error(`Slash command ${command} errored.\n\nMessage that errored: "${message.content}"\n\nError text: "${err.message}"`);

        if (message.interaction.replied || message.interaction.deferred) {
            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Command errored.\n\n:inbox_tray: **Input**\n\`\`\`${message.content}\`\`\`\n:outbox_tray: **Output**\n\`\`\`${err}\`\`\``)
                        .setColor(`#FF3838`)
                ]
            });
        } else {
            message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Command errored.\n\n:inbox_tray: **Input**\n\`\`\`${message.content}\`\`\`\n:outbox_tray: **Output**\n\`\`\`${err}\`\`\``)
                        .setColor(`#FF3838`)
                ]
            });
        }
    }
}

module.exports = slashErrorListener;