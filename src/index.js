// Requires
const result = require(`dotenv`).config();
const Akairo = require(`./akairo`);
const { Structures } = require(`discord.js`);

// Throw if dotenv error
if (result.error) throw result.error;

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