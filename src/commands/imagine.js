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
                    .setAuthor({ name: `DALL·E 3`, iconURL: `https://lirp.cdn-website.com/df735c7c/dms3rep/multi/opt/MicrosoftTeams-image+%28123%29-640w.png` })
                    .setDescription(`<a:loading:1171011239418273853> Generating...`)
                    .setImage(`https://www.solidbackgrounds.com/images/1024x1024/1024x1024-white-solid-color-background.jpg`)
                    .setColor(`#000000`)
            ]
        });

        try {
            this.client.aiClient.images.generate({
                model: "dall-e-3",
                prompt: args.input,
                n: 1,
                size: "1024x1024",
            }).then(response => {
                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                            .setDescription(args.input)
                            .setColor(`#36393f`),
                        new MessageEmbed()
                            .setAuthor({ name: `DALL·E 3`, iconURL: `https://lirp.cdn-website.com/df735c7c/dms3rep/multi/opt/MicrosoftTeams-image+%28123%29-640w.png` })
                            .setDescription(`Generated!`)
                            .setImage(response.data[0].url)
                            .setColor(`#000000`)
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
                            .setAuthor({ name: `DALL·E 3`, iconURL: `https://lirp.cdn-website.com/df735c7c/dms3rep/multi/opt/MicrosoftTeams-image+%28123%29-640w.png` })
                            .setDescription(`<:cross:729019052571492434> **OpenAI Error**\n${reason}`)
                            .setColor(`#000000`)
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
                        .setAuthor({ name: `DALL·E 3`, iconURL: `https://lirp.cdn-website.com/df735c7c/dms3rep/multi/opt/MicrosoftTeams-image+%28123%29-640w.png` })
                        .setDescription(`<:cross:729019052571492434> **OpenAI Error**\n${reason}`)
                        .setColor(`#000000`)
                ]
            });
        }
    }
}

module.exports = ImagineCommand;