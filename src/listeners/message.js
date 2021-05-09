const { Listener } = require(`discord-akairo`);

class MessageListener extends Listener {
    constructor() {
        super(`message`, {
            emitter: `client`,
            event: `message`
        });
    }

    exec(message) {
        if (message.content.toLowerCase().includes(`no cap`)) {
            message.react('<:nocap:816621845229994014>');
        } else if (message.content.toLowerCase().includes(`cap`)) {
            message.react('🧢');
        }

        /*
        if (message.content.toLowerCase().includes(`amogus`))
            message.react('<:amogus:814325340289761300>');
        */

        if (message.content.toLowerCase().includes("banana") && message.channel.id != `713235946019094549`) {
            message.react('🍌')
                .then(() => (message.react('🇴')))
                .then(() => (message.react('🇼'))
                    .then(() => message.react('🅾️')));
        }
    }
}

//! Remember to change export
module.exports = MessageListener;