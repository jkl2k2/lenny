const { Command } = require(`discord-akairo`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class VolumeCommand extends Command {
    constructor() {
        super(`volume`, {
            aliases: [`volume`, `v`],
            category: `music`,
            description: `Changes the playback volume`,
            channel: `guild` // If guild-only
        });
    }

    exec(message, args) {
        return;
    }

    execSlash(message, args) {
        return;
    }
}

module.exports = VolumeCommand;