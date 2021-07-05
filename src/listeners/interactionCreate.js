const { Listener } = require(`discord-akairo`);

class InteractionCreateListener extends Listener {
    constructor() {
        super(`interactionCreate`, {
            emitter: `client`,
            event: `interactionCreate`
        });
    }

    exec(interaction) {
        return;
    }
}

module.exports = InteractionCreateListener;