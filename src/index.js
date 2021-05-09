// Requires
const result = require(`dotenv`).config();
const Akairo = require(`./akairo`);
const { Structures } = require(`discord.js`);
const winston = require(`winston`);
const winstonRotate = require(`winston-daily-rotate-file`);

// Throw if dotenv error
if (result.error) throw result.error;

//#region Winston logger
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green',
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
            filename: `./logs/info-%DATE%.log`,
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
            filename: `./logs/error-%DATE%.log`,
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
            filename: `./logs/debug-%DATE%.log`,
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

// Extend Guild to support music
Structures.extend('Guild', Guild => {
    class ExtendedGuild extends Guild {
        constructor(client, data) {
            super(client, data);
            this.music = {
                queue: [],
                lastPlayed: undefined,
                lastEmbed: undefined,
                playing: false,
                paused: false,
                repeat: false,
                volume: 1,
                oldVolume: 1,
                dispatcher: undefined,
            };
        }
    }
    return ExtendedGuild;
});

// Create client
const client = new Akairo();

// Log in
client.login(process.env.TOKEN);