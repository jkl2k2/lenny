const index = require(`../index.js`);
// Any 'require'

module.exports = {
    name: 'cool',
    description: 'Cool story bro, have you told mom yet?',
    // aliases: ['aliases'],
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    execute(message, args) {
        message.channel.send(`Woah bro...**for real???**

That is absolutely **INSANE!!!** How in the world did you pull that off? Like, isn't that **IMPOSSIBLE???**
I'm honestly amazed. Seriously. I'm actually shaking right now to be in your presence.
I bet you're literally the coolest kid in school, aren't you? Yeah, figured.
I am literally **shaking** behind my Node.JS server. My Discord-approved websocket is **crying** in the corner.

**You're just that awesome.**

I'm scared to know how badass you are in real life. You can probably bench 8 elephants with your ***PINKY***.
Are your accomplishments always as **badass** as that one? Are you seriously **THAT** amazing???

Keep going kid. You've got a bright future ahead of you.
                              `)
    }
}