const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
// Any 'require'

module.exports = {
    name: 'choose',
    description: 'Chooses between two options',
    // aliases: ['aliases'],
    args: true,
    usage: '[option 1] [option 2] [...]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    /*
    restrictions: {
        resolvable: [],
        id: [],
    },
    */
    type: 'fun',
    execute(message, args) {
        if (args.indexOf("or") != -1) {
            var option1 = args.slice(0, args.indexOf("or"));
            var option2 = args.slice(args.indexOf("or") + 1);

            var rand = Math.floor(Math.random() * 2) + 1;

            if (rand == 1) {
                // Option 1
                return message.channel.send(option1.join(" "));
            } else {
                // Option 2
                return message.channel.send(option2.join(" "));
            }
        } else if (args.length >= 2) {
            let rand = Math.floor(Math.random() * args.length);

            return message.channel.send(args[rand]);
        }
    }
};