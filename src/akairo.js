const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require(`discord-akairo`);

module.exports = class Akairo extends AkairoClient {
    constructor() {
        super({
            ownerID: `125109015632936960`
        }, {
            disableMentions: `everyone`
        });

        // Define commandHandler
        this.commandHandler = new CommandHandler(this, {
            directory: `./commands`,
            prefix: msg => {
                // Get prefix specific to server

                // Placeholder
                let prefix = `!`;
                return prefix;
            },
            defaultCooldown: 1000,
            allowMention: true
        });

        // Define inhibitorHandler
        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: `./inhibitors`
        });

        // Define listenerHandler
        this.listenerHandler = new ListenerHandler(this, {
            directory: `./listeners`
        });

        // Load commands
        this.commandHandler.loadAll();

        // Load inhibitor handler
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.inhibitorHandler.loadAll();

        // Load listener handler
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });
        this.listenerHandler.loadAll();
    }
};