const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const client = index.getClient();

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
    type: 'admin',
    execute(message, args) {
        switch (message.member.roles.some(role => role.name === `The Owners :D` || `Trusted`)) {
            case true:
                const theMessage = `I only wish to rights wrongs and seek justice, no matter what. I will do what needs to be done to make sure this place experiences a change, a good change. Im not a hero, Im just someone who wants the world to be a better place, whatever it takes. Even if I have to sacrifice myself in the process. I'll be okay knowing what I did what's right, because for me, its not about winning, its not cause I want to beat someone, to kill someone, to make them feel bad, and its not cause it works because it rarely ever does, I do what I'm doing because its right, because its decent, and above all, its kind. That's it, its just kind..... But maybe this won't work, maybe more things will happen, y'know, maybe there's no point in doing this, but I cannot allow myself to stand by and watch as others suffer. Its the best I can do, so Im going to do it. I will stand right here, right now, because I believe in this cause, please, stand with me. At least give it a try, give it a chance, regardless if this works, because at least, I can say I tried to make a different. All I need is for you to lend me a hand, Mods. I believe, deep within my heart, that Life Will Change. I'll wait for your decision. Feel free to dm me about this. And perhaps soon, this'll all be behind us. I do not regret my choice.`;

                const target = message.mentions.members.first();

                target.send(theMessage)
                    .then(() => {
                        // var kickTarget = client.users.get(target);
                        message.channel.send(`User has been banned.`);
                        return target.ban("User banned with the !ban command");
                    })
                    .catch(error => {
                        console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                        message.channel.send("User has DMs disabled, unable to send message");
                    });

                break;
            case false:
                message.channel.send("Sorry, only admins can use this command");
        }
    }
};