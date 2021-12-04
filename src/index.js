// Requires
const result = require(`dotenv`).config();
const Akairo = require(`./akairo`);
const { Collection } = require(`discord.js`);
const winston = require(`winston`);
const winstonRotate = require(`winston-daily-rotate-file`);
const Enmap = require(`enmap`);

// Throw if dotenv error
if (result.error) throw result.error;

//#region Winston logger
winston.addColors({
    error: 'bold white redBG',
    warn: 'bold white yellowBG',
    info: 'black whiteBG',
    debug: 'bold white greenBG',
});

global.logger = winston.createLogger({
    transports: [
        new winstonRotate({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.uncolorize(),
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
            ),
            filename: `../logs/info-%DATE%.log`,
            datePattern: `YYYY-MM-DD`,
            level: `info`
        }),
        new winstonRotate({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.uncolorize(),
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
            ),
            filename: `../logs/error-%DATE%.log`,
            datePattern: `YYYY-MM-DD`,
            level: `error`
        }),
        new winstonRotate({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.uncolorize(),
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
            ),
            filename: `../logs/debug-%DATE%.log`,
            datePattern: `YYYY-MM-DD`,
            level: `debug`
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                // winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.simple()
            ),
            level: `debug`
        })
    ]
});
//#endregion

// Create client
const client = new Akairo();

// Map guild IDs to music subscriptions
client.subscriptions = new Collection();

//#region Initialize enmap
client.settings = new Enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

client.stats = new Enmap({
    name: "stats",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

client.settings.default = {
    prefix: "!",
    modLogEnabled: "false",
    modLogChannel: "mod-log",
    welcomeEnabled: "false",
    welcomeChannel: "welcome",
    welcomeMessage: "Welcome, {{user}}! Enjoy your stay.",
    goodbyeMessage: "Goodbye, {{user}}!"
};

client.stats.default = {
    commandCount: 0,
    musicTime: 0
};

client.casinoUser = new Enmap({
    name: "casinoUser",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

client.casinoUser.default = {
    losingStreak: 0,
    badgeLevel: 0,
    prestigeLevel: 0
};

client.credit = new Enmap({
    name: "credit",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

client.credit.default = {
    socialCredit: 0
};

client.on(`guildDelete`, guild => {
    // Remove deleted guild from Enmap
    client.settings.delete(guild.id);
    client.tags.delete(guild.id);
});
//#endregion

// Log in
client.login(process.env.TOKEN);