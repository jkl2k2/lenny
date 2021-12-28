const { Listener } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class CooldownListener extends Listener {
    constructor() {
        super(`cooldown`, {
            emitter: `commandHandler`,
            event: `cooldown`
        });
    }

    async exec(message, command) {
        let sent = await message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`:stopwatch: Chill out, ${message.author}! Please don't spam \`${command}\`.`)
                    .setColor(`#36393f`)
            ]
        });

        setTimeout(() => {
            return sent.delete();
        }, 10000);
    }
}

module.exports = CooldownListener;