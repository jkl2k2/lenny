const booste = require(`booste`);
const config = require(`config`);
const GPTKEY = config.get(`Bot.GPTKEY`);
const { MessageEmbed } = require(`discord.js`);

module.exports = {
    name: 'gpt',
    description: 'GPT2 text completion. Processing takes about 30 seconds. Not every response will be good.',
    aliases: ['gpt2'],
    args: true,
    usage: '[text prompt]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'fun',
    async execute(message, args) {
        const client = message.client;

        const sent = await message.channel.send(new MessageEmbed()
            .setDescription(`:arrows_counterclockwise: Processing response...`)
            .setFooter(`Processing takes about 30 seconds on average`)
            .setColor(`#54c3ff`));

        const outList = await booste.gpt2(GPTKEY, args.join(` `), 30);

        sent.edit(new MessageEmbed()
            .setAuthor(`Lenny says:`, client.user.avatarURL())
            .setDescription(`**${args.join(` `)}** ${outList.join(` `)}`)
            .setColor(`#54c3ff`));
    }
};