const index = require(`../../index.js`);

module.exports = {
    name: 'ban',
    description: 'Bans a user from the server and DMs them a glorious paragraph',
    // aliases: ['aliases'],
    args: true,
    usage: '[user to kick]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: ['ADMINISTRATOR'],
    },
    type: 'admin',
    execute(message, args) {
        const theMessage = `I only wish to rights wrongs and seek justice, no matter what. I will do what needs to be done to make sure this place experiences a change, a good change. Im not a hero, Im just someone who wants the world to be a better place, whatever it takes. Even if I have to sacrifice myself in the process. I'll be okay knowing what I did what's right, because for me, its not about winning, its not cause I want to beat someone, to kill someone, to make them feel bad, and its not cause it works because it rarely ever does, I do what I'm doing because its right, because its decent, and above all, its kind. That's it, its just kind..... But maybe this won't work, maybe more things will happen, y'know, maybe there's no point in doing this, but I cannot allow myself to stand by and watch as others suffer. Its the best I can do, so Im going to do it. I will stand right here, right now, because I believe in this cause, please, stand with me. At least give it a try, give it a chance, regardless if this works, because at least, I can say I tried to make a different. All I need is for you to lend me a hand, Mods. I believe, deep within my heart, that Life Will Change. I'll wait for your decision. Feel free to dm me about this. And perhaps soon, this'll all be behind us. I do not regret my choice.`;

        const target = message.mentions.members.first();

        target.send(theMessage)
            .then(() => {
                target.ban("User banned with the !ban command")
                    .then(() => {
                        message.channel.send(`User has been banned.`);
                    })
                    .catch(error => {
                        message.channel.send("Failed to ban user (permissions conflict?)");
                    });
            })
            .catch(error => {
                console.error(`Ban of ${message.author.tag} failed.\n`, error);
                message.channel.send("Failed to DM user");
            });
    }
};