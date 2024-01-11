const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class ImagineCommand extends Command {
    constructor() {
        super(`imagine`, {
            aliases: [`imagine`],
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
                    description: `Type your input to OpenAI's DALL-E 3`,
                    required: true
                }
            ],
            category: `fun`,
            description: `Imagine images with DALL-E 3`
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
                    .setAuthor({ name: `DALL-E 3`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/768px-ChatGPT_logo.svg.png` })
                    .setDescription(`<a:loading:1171011239418273853> Generating...`)
                    .setImage(`https://www.solidbackgrounds.com/images/1024x1024/1024x1024-white-solid-color-background.jpg`)
                    .setColor(`#74AA9C`)
            ]
        });

        try {
            this.client.aiClient.images.generate({
                model: "dall-e-3",
                prompt: args.input,
                n: 1,
                size: "1024x1024",
            }).then(response => {
                console.log(response);

                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                            .setDescription(args.input)
                            .setColor(`#36393f`),
                        new MessageEmbed()
                            .setAuthor({ name: `DALL-E 3`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/768px-ChatGPT_logo.svg.png` })
                            .setDescription(`Generated!`)
                            .setImage(response.data[0].url)
                            .setColor(`#74AA9C`)
                    ]
                });
            }).catch(reason => {
                global.logger.error(reason);

                return message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                            .setDescription(args.input)
                            .setColor(`#36393f`),
                        new MessageEmbed()
                            .setAuthor({ name: `ChatGPT`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/768px-ChatGPT_logo.svg.png` })
                            .setDescription(`<:cross:729019052571492434> **ChatGPT Error**\n${reason.statusCode} - ${reason.statusText}`)
                            .setColor(`#74AA9C`)
                    ]
                });
            });
        } catch (reason) {
            global.logger.error(reason);

            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                        .setDescription(args.input)
                        .setColor(`#36393f`),
                    new MessageEmbed()
                        .setAuthor({ name: `DALL-E 3`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/768px-ChatGPT_logo.svg.png` })
                        .setDescription(`<:cross:729019052571492434> **OpenAI Error**\n${reason.statusCode} - ${reason.statusText}`)
                        .setColor(`#74AA9C`)
                ]
            });
        }
    }
}

module.exports = ImagineCommand;