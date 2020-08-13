const uwu = require(`uwuifier`);

module.exports = {
    name: 'uwufy',
    description: 'uwu',
    aliases: ['uwu'],
    args: true,
    usage: '[text]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'fun',
    execute(message, args) {
        let processed = ``;

        for (const word of args) {
            processed += uwu.uwuifyWord(word);
            if (word != "." && word != "," && word != "!")
                processed += " ";
        }

        return message.channel.send(processed + uwu.uwuFace());
    }
};