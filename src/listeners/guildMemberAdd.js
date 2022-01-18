const { Listener } = require(`discord-akairo`);

class guildMemberAddListener extends Listener {
    constructor() {
        super(`guildMemberAdd`, {
            emitter: `client`,
            event: `guildMemberAdd`
        });
    }

    exec(message, member) {
        if (!member) return;

        // Ensure settings exist
        message.client.settings.ensure(member.guild.id, client.settings.default);

        // Return if disabled
        if (JSON.parse(message.client.settings.get(member.guild.id, `welcomeEnabled`)) != true) return;

        // Get welcome message
        let welcomeMessage = message.client.settings.get(member.guild.id, "welcomeMessage");

        // Fill placeholders
        welcomeMessage = welcomeMessage.replace(`{{user}}`, member.user);
        welcomeMessage = welcomeMessage.replace(`{{server}}`, member.guild.name);

        // Find welcome channel
        let channel = member.guild.channels.cache.find(channel => channel.name == message.client.settings.get(member.guild.id, "welcomeChannel"));

        if (channel == undefined) {
            global.logger.warn(`Welcome messages enabled, but no welcome channel found\nServer Name: ${member.guild.name}\nServer ID: ${member.guild.id}`);
        }

        // Send message
        channel.send(welcomeMessage);
    }
}

//! Remember to change export
module.exports = guildMemberAddListener;