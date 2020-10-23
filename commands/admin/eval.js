const index = require(`../../index.js`);
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);
const Discord = require(`discord.js`);
const currency = index.getCurrencyDB();

function clean(text) {
	if (typeof (text) === "string")
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	else
		return text;
}

module.exports = {
	name: 'eval',
	description: 'Executes JavaScript code - ONLY OWNER CAN ACCESS THIS',
	aliases: ['e'],
	// usage: '[command]',
	// cooldown: 5,
	// guildOnly: true,
	enabled: true,
	restrictions: {
		id: [ownerID],
	},
	type: 'admin',
	async execute(message, args) {
		try {
			const code = args.join(" ");
			let evaled = await eval(code);

			if (typeof evaled !== "string")
				evaled = require("util").inspect(evaled);

			console.log(clean(evaled));

			message.channel.send(clean(evaled), { code: "xl" });
		} catch (err) {
			message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}
	}
};