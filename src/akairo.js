const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require(`discord-akairo`);

module.exports = class Akairo extends AkairoClient {
    constructor() {
        super({
            ownerID: `125109015632936960`,
            partials: [`MESSAGE`, `CHANNEL`, `REACTION`],
            intents: [`GUILDS`, `GUILD_MESSAGES`, `GUILD_VOICE_STATES`],
        }, {
            disableMentions: `everyone`,
            partials: [`MESSAGE`, `CHANNEL`, `REACTION`],
            intents: [`GUILDS`, `GUILD_MESSAGES`, `GUILD_VOICE_STATES`],
        });

        // Define commandHandler
        this.commandHandler = new CommandHandler(this, {
            directory: `./commands`,
            prefix: message => {
                if (message.guild) {
                    const serverConfig = this.settings.ensure(message.guild.id, this.settings.default);
                    return serverConfig[`prefix`];
                } else {
                    return "!";
                }
            },
            defaultCooldown: 3000,
            allowMention: true,
            autoDefer: false,
            autoRegisterSlashCommands: true,
            execSlash: true
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