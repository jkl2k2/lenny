// Requires
const result = require(`dotenv`).config();
const Akairo = require(`./akairo`);
const { Collection } = require(`discord.js`);
const winston = require(`winston`);
const winstonRotate = require(`winston-daily-rotate-file`);
const Enmap = require(`enmap`);
const { getFreeClientID, setToken } = require(`play-dl`);
const gpt = import(`chatgpt`);

// Throw if dotenv error
if (result.error) throw result.error;

process.env.LEAGUE_API_PLATFORM_ID = 'na1';

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

client.userPlaylists = new Enmap({
    name: `userPlaylists`,
    fetchAll: false,
    autoFetch: true,
    cloneLevel: `deep`
});

client.userPlaylists.default = {
    savedPlaylists: []
};

client.currency = new Enmap({
    name: `currency`,
    fetchAll: false,
    autoFetch: true,
    cloneLevel: `deep`
});

client.currency.default = {
    balance: 0,
    dailyStreak: 0,
    dailyLastClaim: null,
    dailyStreakScaling: 0.5
};

/**
 * Adds/subtracts an integer amount from a user's balance
 * @param {Integer} userID The ID of the user to affect 
 * @param {Integer} amount The amount of money to add/subtract
 * @returns A boolean representing success/failure
 */
client.currency.add = (userID, amount) => {
    const userCurrency = client.currency.ensure(userID, client.currency.default);
    if (isNaN(parseInt(amount))) {
        return false;
    } else {
        if (amount < 0 && userCurrency[`balance`] + parseInt(amount) < 0) {
            // Protect against negative balance
            client.currency.set(userID, 0, `balance`);
        } else if (userCurrency[`balance`] + parseInt(amount) > 999999999999) {
            // Protect against ridiculously high amounts of money
            client.currency.set(userID, 999999999999, `balance`);
        } else {
            client.currency.set(userID, parseInt(userCurrency[`balance`]) + parseInt(amount), `balance`);
        }
        return true;
    }
};

/**
 * Returns the Enmap database entry for a user
 * @param {Integer} userID The ID of the user to look up 
 * @returns The Enmap entry for the user
 */
client.currency.getUser = (userID) => {
    return client.currency.ensure(userID, client.currency.default);
};

/**
 * Returns the user's current balance
 * @param {Integer} userID 
 * @returns The user's current balance
 */
client.currency.getBalance = (userID) => {
    const userCurrency = client.currency.ensure(userID, client.currency.default);
    return userCurrency[`balance`];
};

/*
client.on(`guildDelete`, guild => {
    // Remove deleted guild from Enmap
    client.settings.delete(guild.id);
    client.tags.delete(guild.id);
});
*/
//#endregion

gpt.then(gpt => {
    client.gptAPI = new gpt.ChatGPTAPI({
        apiKey: process.env.GPT_API
    });
});

getFreeClientID().then((clientID) => {
    setToken({
        soundcloud: {
            client_id: clientID
        }
    });
});

// Log in
client.login(process.env.TOKEN);