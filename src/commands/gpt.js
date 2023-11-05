const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const gpt = import(`chatgpt`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class GptCommand extends Command {
    constructor() {
        super(`gpt`, {
            aliases: [`gpt`],
            args: [
                {
                    name: `input`,
                    type: `content`
                }
            ],
            slash: true,
            slashOptions: [
                {
                    name: `input`,
                    type: `STRING`,
                    description: `Type your input to ChatGPT`,
                    required: true
                }
            ],
            category: `fun`,
            description: `Talk with OpenAI's ChatGPT`
        });
    }

    exec() {
        return;
    }

    async execSlash(message, args) {
        const api = new (await gpt).ChatGPTUnofficialProxyAPI({
            accessToken: process.env.GPT,
            apiReverseProxyUrl: 'http://localhost:3000/v1/chat'
        });

        await message.interaction.deferReply();

        try {
            api.sendMessage(args.input).then(msg => {
                return message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                            .setDescription(args.input)
                            .setColor(`#36393f`),
                        new MessageEmbed()
                            .setAuthor({ name: `ChatGPT`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/768px-ChatGPT_logo.svg.png` })
                            .setDescription(msg.text)
                            .setColor(`#36393f`)
                    ]
                });
            }).catch(reason => {
                global.logger.error(reason);
            });
        } catch (err) {
            global.logger.error(err);
        }
    }
}

module.exports = GptCommand;