const { Inhibitor } = require(`discord-akairo`);

class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super(`blacklist`, {
            reason: `User is on blacklist`
        });
    }

    exec(message) {
        // Put user ID's to blacklist in array
        const blacklist = [``];
        return blacklist.includes(message.author.id);
    }
}

module.exports = BlacklistInhibitor;