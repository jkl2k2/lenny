const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const chatgpt = import('chatgpt');

const gptApiKey = process.env.GPT;

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
        const api = new (await chatgpt).ChatGPTAPI({
            apiKey: gptApiKey
        });

        const response = await api.sendMessage(args.input);

        return message.interaction.reply(response);
    }
}

module.exports = GptCommand;