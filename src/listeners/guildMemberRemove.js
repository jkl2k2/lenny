const { Listener } = require(`discord-akairo`);

class guildMemberRemoveListener extends Listener {
    constructor() {
        super(`guildMemberRemove`, {
            emitter: `client`,
            event: `guildMemberRemove`
        });
    }

    exec(message, member) {
        // Ensure settings exist
        message.client.settings.ensure(member.guild.id, client.settings.default);

        // Return if disabled
        if (JSON.parse(message.client.settings.get(member.guild.id, `welcomeEnabled`)) != true) return;

        // Get goodbye message
        let goodbyeMessage = message.client.settings.get(member.guild.id, "goodbyeMessage");

        // Fill placeholders
        goodbyeMessage = goodbyeMessage.replace(`{{user}}`, member.user.username);
        goodbyeMessage = goodbyeMessage.replace(`{{server}}`, member.guild.name);

        // Find welcome channel
        let channel = member.guild.channels.cache.find(channel => channel.name == message.client.settings.get(member.guild.id, "welcomeChannel"));

        if (channel == undefined) {
            global.logger.warn(`Welcome messages enabled, but no welcome channel found\nServer Name: ${member.guild.name}\nServer ID: ${member.guild.id}`);
        }

        // Send message
        channel.send(goodbyeMessage);
    }
}

//! Remember to change export
module.exports = guildMemberRemoveListener;