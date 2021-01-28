const booste = require(`booste`);
const config = require(`config`);
const GPTKEY = config.get(`Bot.GPTKEY`);
const { MessageEmbed } = require(`discord.js`);

function reactionHandler(sent, message, args) {
    const client = message.client;

    const filter = (reaction, user) => {
        return ['🔄'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    sent.react(`🔄`)
        .catch(() => console.error(`One of the emojis failed to react.`));

    sent.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(async collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === `🔄`) {
                sent.delete();

                const newSent = await message.channel.send(new MessageEmbed()
                    .setDescription(`:arrows_counterclockwise: Processing response...`)
                    .setFooter(`Processing time depends on your input length`)
                    .setColor(`#54c3ff`));

                const outList = await booste.gpt2(GPTKEY, args.join(` `), 30, 0.8, 30 + args.length);

                console.log(outList.join(` `));

                newSent.edit(new MessageEmbed()
                    .setAuthor(`Response to ${message.author.username}`, message.author.avatarURL())
                    .setDescription(`**${args.join(` `)}** ${outList.join(` `)}`)
                    .setColor(`#54c3ff`));

                return reactionHandler(newSent, message, args);
            }
        })
        .catch(async collected => {
            sent.reactions.removeAll();
        });
}

module.exports = {
    name: 'gpt',
    description: 'GPT2 text completion. Processing takes about 15-20 seconds. Not every response will be good.',
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
            .setFooter(`Processing time depends on your input length`)
            .setColor(`#54c3ff`));

        const outList = await booste.gpt2(GPTKEY, args.join(` `), 30, 0.8, 30 + args.length);

        sent.edit(new MessageEmbed()
            .setAuthor(`Response to ${message.author.username}`, message.author.avatarURL())
            .setDescription(`**${args.join(` `)}** ${outList.join(` `)}`)
            .setColor(`#54c3ff`));

        reactionHandler(sent, message, args);
    }
};