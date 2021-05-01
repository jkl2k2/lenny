// Requires
const result = require(`dotenv`).config();
const Akairo = require(`./akairo`);

// Throw if dotenv error
if (result.error) throw result.error;

// Create client
const client = new Akairo();

// Log in
client.login(process.env.TOKEN);