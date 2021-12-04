const { Listener } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const chalk = require(`chalk`);

class MessageCreateListener extends Listener {
    constructor() {
        super(`messageCreate`, {
            emitter: `client`,
            event: `messageCreate`
        });
    }

    async exec(message) {
        // Bing chilling reaction
        if (message.content.toLowerCase().includes(`bing chilling`)) {
            message.react(`🥶`)
                .then(message.react(`🍦`));
        }

        // Cap reaction
        if (message.content.toLowerCase().includes(`no cap`)) {
            message.react('<:nocap:816621845229994014>');
        } else if (message.content.toLowerCase().includes(`cap`)) {
            message.react('🧢');
        }

        /*
        if (message.content.toLowerCase().includes(`amogus`))
            message.react('<:amogus:814325340289761300>');
        */

        // Banana reaction
        if (message.content.toLowerCase().includes(`banana`) && message.channel.id != `713235946019094549`) {
            message.react('🍌')
                .then(() => (message.react('🇴')))
                .then(() => (message.react('🇼'))
                    .then(() => message.react('🅾️')));
        }

        // Down bad Rem reaction
        if (message.content.toLowerCase().includes(`down bad`) && message.channel.id != `713235946019094549`) {
            message.react(`<:RemBanana:717156806127779930>`);
        }

        // Ignore bots
        if (message.author.bot) return;

        const serverConfig = message.client.settings.ensure(message.guild.id, message.client.settings.default);

        // If message is only bot mention, show prefix
        if (message.content == `<@!${message.client.user.id}>`) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: The prefix for the server \`${message.guild.name}\` is currently \`${serverConfig[`prefix`]}\``)
                        .setColor(`#36393f`)
                ]
            });
        }

        // Social credit
        if (message.reference && message.reference.messageId && message.content.toLowerCase().includes(`social credit`) && (message.content[0] === `+` || message.content[0] === `-`)) {
            let amountToChange = ``;

            for (let i = 1; i < message.content.length; i++) {
                if (message.content[i] === ` `) break;

                amountToChange += message.content[i];
            }

            if (message.content[0] === `+`) {
                // adding social credit
                const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                const userCredit = this.client.credit.ensure(repliedMessage.author.id, this.client.credit.default);

                if (userCredit[`socialCredit`] + amountToChange > 999999999) {
                    return message.channel.send(`${repliedMessage.author.username} cannot have more than 999,999,999 social credit!`);
                }

                this.client.credit.set(repliedMessage.author.id, userCredit[`socialCredit`] + parseInt(amountToChange), `socialCredit`);

                message.react(`<:comrade:916528736801812530>`);
            } else {
                // subtracting social credit
                const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                const userCredit = this.client.credit.ensure(repliedMessage.author.id, this.client.credit.default);

                if (userCredit[`socialCredit`] - amountToChange < 999999999) {
                    return message.channel.send(`${repliedMessage.author.username} cannot have less than -999,999,999 social credit!`);
                }

                this.client.credit.set(repliedMessage.author.id, userCredit[`socialCredit`] - parseInt(amountToChange), `socialCredit`);

                message.react(`<:holyshit:916528747837018153>`);
            }
        }

        if (message.content.substring(0, serverConfig[`prefix`].length) !== serverConfig[`prefix`]) return;

        // Put args into array
        const args = message.content.slice(serverConfig[`prefix`].length).split(/ +/);

        // Extract command name
        const commandName = args.shift().toLowerCase();

        // Search for command
        const command = message.client.commandHandler.modules.find(c => c.aliases && c.aliases.includes(commandName));

        if (!command) return;

        global.logger.info(`${chalk.cyanBright(message.author.tag)} -> ${chalk.black.bgWhiteBright(`!${command.id}`)} ${chalk.greenBright(args.join(` `))}`);
    }
}

module.exports = MessageCreateListener;