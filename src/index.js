// Requires
const result = require(`dotenv`).config();
const Akairo = require(`./akairo`);
const { Collection } = require(`discord.js`);
const winston = require(`winston`);
const winstonRotate = require(`winston-daily-rotate-file`);
const Enmap = require(`enmap`);
const { getFreeClientID, setToken } = require(`play-dl`);

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
    socialCredit: 1000
};

/*
client.on(`guildDelete`, guild => {
    // Remove deleted guild from Enmap
    client.settings.delete(guild.id);
    client.tags.delete(guild.id);
});
*/
//#endregion

getFreeClientID().then((clientID) => {
    setToken({
        soundcloud: {
            client_id: clientID
        },
        useragent: [
            `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36`,
            `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36`,
            `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36`,
            `Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)`,
            `Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)`,
            `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36`,
            `Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko`,
            `Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko`,
            `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134`,
            `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763`,
            `Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; KTXN)`,
            `Mozilla/5.0 (Windows NT 5.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1`,
            `Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)`,
            `Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0`,
            `Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1`,
            `Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36`,
            `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36`
        ]
    });
});

// Log in
client.login(process.env.TOKEN);