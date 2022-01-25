const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const moment = require(`moment`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class DailyCommand extends Command {
    constructor() {
        super(`daily`, {
            aliases: [`daily`],
            category: `economy`,
            description: `Get a daily reward`,
            channel: `guild`
        });
    }

    exec(message) {
        const user = message.client.currency.getUser(message.author.id);
        const dailyLastClaim = user[`dailyLastClaim`];
        const dailyStreak = user[`dailyStreak`];
        const dailyStreakScaling = user[`dailyStreakScaling`];
        const bonusBaseAmount = 500;

        if (message.content.includes(`reset`)) {
            message.client.currency.set(message.author.id, null, `dailyLastClaim`);
            message.client.currency.set(message.author.id, 0, `dailyStreak`);
            return global.logger.debug(`Detected reset`);
        }

        if (!dailyLastClaim || moment().diff(moment(dailyLastClaim), `days`) === 1) {
            // First claim or been 1 day (valid claim)
            if (dailyStreak + 1 === 5) {
                message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`${message.author.tag}'s Daily Bonus`, message.author.avatarURL())
                            .setDescription(`Claimed your daily bonus of ${1 + (0.5 * dailyStreak)} x 500 = **$${bonusBaseAmount + (bonusBaseAmount * (0.5 * dailyStreak))}**!\n\nYou've reached the max bonus!`)
                            .setColor(`#2EC14E`)
                    ]
                });
            } else {
                message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`${message.author.tag}'s Daily Bonus`, message.author.avatarURL())
                            .setDescription(`Claimed your daily bonus of ${1 + (0.5 * dailyStreak)} x 500 = **$${bonusBaseAmount + (bonusBaseAmount * (0.5 * dailyStreak))}**!\n\nNext daily claim streak bonus: \`$${bonusBaseAmount + (bonusBaseAmount * (dailyStreakScaling * (dailyStreak + 1)))}\` (max of \`$${bonusBaseAmount + (bonusBaseAmount * (dailyStreakScaling * 4))})\``)
                            .setColor(`#2EC14E`)
                    ]
                });
            }

            message.client.currency.set(message.author.id, Date.now(), `dailyLastClaim`);
            message.client.currency.set(message.author.id, dailyStreak + 1, `dailyStreak`);
            message.client.currency.add(message.author.id, bonusBaseAmount + (bonusBaseAmount * (0.5 * dailyStreak)));
        } else if (moment().diff(moment(dailyLastClaim), `days`) >= 2) {
            // Lost streak from taking too long
            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`${message.author.tag}'s Daily Bonus`, message.author.avatarURL())
                        .setDescription(`It's been at least 2 days since you claimed your last daily, so your streak has reset!\n\nClaimed your daily bonus of **$${bonusBaseAmount}**!`)
                        .setColor(`#FF3838`)
                ]
            });

            message.client.currency.set(message.author.id, Date.now(), `dailyLastClaim`);
            message.client.currency.set(message.author.id, 1, `dailyStreak`);
            message.client.currency.add(message.author.id, bonusBaseAmount);
        } else if (moment().diff(moment(dailyLastClaim), `days`) < 1) {
            // Hasn't been long enough
            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`${message.author.tag}'s Daily Bonus`, message.author.avatarURL())
                        .setDescription(`Daily resets in ${24 - moment().diff(moment(dailyLastClaim), `hours`)} hours`)
                        .setColor(`#FF3838`)
                ]
            });
        } else {
            message.channel.send(`Catch (you should never see this)`);
        }
    }
}

module.exports = DailyCommand;