const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

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
        await message.interaction.deferReply();

        message.interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                    .setDescription(args.input)
                    .setColor(`#36393f`),
                new MessageEmbed()
                    .setAuthor({ name: `ChatGPT`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/768px-ChatGPT_logo.svg.png` })
                    .setDescription(`<a:loading:1171011239418273853> Generating...`)
                    .setColor(`#74AA9C`)
            ]
        });

        try {
            this.client.gptAPI.sendMessage(args.input).then(msg => {
                return message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                            .setDescription(args.input)
                            .setColor(`#36393f`),
                        new MessageEmbed()
                            .setAuthor({ name: `ChatGPT`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/768px-ChatGPT_logo.svg.png` })
                            .setDescription(msg.text)
                            .setColor(`#74AA9C`)
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