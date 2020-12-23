const index = require(`../../index.js`);
const { MessageEmbed } = require(`discord.js`);
const { sub } = require("ffmpeg-static");
const currency = index.getCurrencyDB();

function readableNum(number) {
    return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function levelToRank(level) {
    if (level == 0) {
        return `Unranked`;
    }

    const ranks = [`Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`, `How do you have this`];
    const subRanks = [`I`, `II`, `III`];

    let determinedSub = 0;

    for (let i = 0; i < level; i++) {
        if (i % 3 == 0) {
            determinedSub = 0;
        } else {
            determinedSub++;
        }
    }

    let determinedRank = 0;

    for (let i = 0; i < level; i++) {
        if (i % 3 == 0 && i != 0) {
            determinedRank++;
        }
    }

    return `${ranks[determinedRank]} ${subRanks[determinedSub]}`;
}

module.exports = {
    name: 'badge',
    description: 'Buy badges and get perks. Use !badge upgrade to rank up once or use !badge max to go as high as possible.',
    aliases: ['badges'],
    // args: true,
    usage: '[optional: upgrade]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'currency',
    execute(message, args) {
        const client = message.client;
        const casinoUser = client.casinoUser.ensure(message.author.id, client.casinoUser.default);

        if (args.length == 0) {
            // If no args provided
            return message.channel.send(new MessageEmbed()
                .setAuthor(message.author.username, message.author.avatarURL())
                .addField(`Badge rank`, `\`${levelToRank(casinoUser[`badgeLevel`])}\``, true)
                // .addField(`Prestige level`, `\`Prestige ${casinoUser[`prestigeLevel`]}\``, true)
                .addField(`Next rank`, `\`${levelToRank(casinoUser[`badgeLevel`] + 1)}\` (**$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`]))}**)`)
                .setDescription(`*Use \`!badge upgrade\` or \`!badge max\` to rank up*`)
                .setColor(`#36393f`));
        } else if (args[0] == `upgrade`) {
            // If user wants to upgrade
            // Check if user can afford upgrade
            if (currency.getBalance(message.author.id) >= Math.pow(10, 4 + casinoUser[`badgeLevel`])) {
                // Show upgrade info
                message.channel.send(new MessageEmbed()
                    .setDescription(`<:check:728881238970073090> You can afford to upgrade your badge to \`${levelToRank(casinoUser[`badgeLevel`] + 1)}\` for \`$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`]))}\`\n\nCurrent balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\nBalance after: \`$${readableNum(currency.getBalance(message.author.id) - Math.pow(10, 4 + casinoUser[`badgeLevel`]))}\`\n\nWould you like to upgrade? **(Y/N)**`)
                    .setColor(`#2EC14E`));

                // Listen for response
                const filter = response => response.author.id == message.author.id && (response.content.toLowerCase() == `y` || response.content.toLowerCase() == `n` || response.content.toLowerCase() == `yes` || response.content.toLowerCase() == `no`);

                const collector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                collector.on(`collect`, async response => {
                    const userResponse = response.content.toLowerCase();

                    if (userResponse == `y` || userResponse == `yes`) {
                        // Store old balance
                        const oldBalance = currency.getBalance(message.author.id);

                        // Collect payment
                        currency.add(message.author.id, -Math.pow(10, 4 + casinoUser[`badgeLevel`]));

                        // Increase badge level
                        client.casinoUser.set(message.author.id, casinoUser[`badgeLevel`] + 1, `badgeLevel`);

                        // Show confirmation of upgrade
                        return message.channel.send(new MessageEmbed()
                            .setDescription(`:tada: You have now reached \`${levelToRank(casinoUser[`badgeLevel`] + 1)}\`!\n\nPrevious balance: \`$${readableNum(oldBalance)}\`\nNew balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\n\nNext up is \`${levelToRank(casinoUser[`badgeLevel`] + 2)}\` (\`$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`] + 1))}\`)`)
                            .setColor(`#2EC14E`));

                    } else if (userResponse == `n` || userResponse == `no`) {
                        return message.channel.send(new MessageEmbed()
                            .setDescription(`:information_source: Canceled badge upgrade`)
                            .setColor(`#0083FF`));
                    }
                });
                collector.on('end', collected => {
                    // Name entry timed out
                    if (!collected.size) return message.channel.send(new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Badge upgrade response timed out`)
                        .setColor(`#FF3838`));
                });
            } else {
                // User cannot afford badge upgrade
                message.channel.send(new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> You cannot afford to upgrade your badge to \`${levelToRank(casinoUser[`badgeLevel`] + 1)}\`\n\nCurrent balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\nBadge costs: \`$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`]))}\``)
                    .setColor(`#FF3838`));
            }
        } else if (args[0] == `max`) {
            // If user wants to upgrade
            // Check if user can afford upgrade
            let totalCost = 0;
            let upgradeCount = 4;

            for (let i = Math.pow(10, 4 + casinoUser[`badgeLevel`]); i < currency.getBalance(message.author.id); i += Math.pow(10, upgradeCount)) {
                console.log(i);
                totalCost = i;
                upgradeCount++;
            }

            if (currency.getBalance(message.author.id) >= totalCost) {
                // Show upgrade info
                message.channel.send(new MessageEmbed()
                    .setDescription(`<:check:728881238970073090> You can afford to upgrade your badge **${upgradeCount - 4} times** to \`${levelToRank(casinoUser[`badgeLevel`] + (upgradeCount - 4))}\` for \`$${readableNum(totalCost)}\`\n\nCurrent balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\nBalance after: \`$${readableNum(currency.getBalance(message.author.id) - totalCost)}\`\n\nWould you like to upgrade? **(Y/N)**`)
                    .setColor(`#2EC14E`));

                // Listen for response
                const filter = response => response.author.id == message.author.id && (response.content.toLowerCase() == `y` || response.content.toLowerCase() == `n` || response.content.toLowerCase() == `yes` || response.content.toLowerCase() == `no`);

                const collector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                collector.on(`collect`, async response => {
                    const userResponse = response.content.toLowerCase();

                    if (userResponse == `y` || userResponse == `yes`) {
                        // Store old balance
                        const oldBalance = currency.getBalance(message.author.id);

                        // Collect payment
                        currency.add(message.author.id, -totalCost);

                        // Increase badge level
                        client.casinoUser.set(message.author.id, casinoUser[`badgeLevel`] + (upgradeCount - 4), `badgeLevel`);

                        // Show confirmation of upgrade
                        return message.channel.send(new MessageEmbed()
                            .setDescription(`:tada: You have now reached \`${levelToRank(casinoUser[`badgeLevel`] + (upgradeCount - 4))}\`!\n\nPrevious balance: \`$${readableNum(oldBalance)}\`\nNew balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\n\nNext up is \`${levelToRank(casinoUser[`badgeLevel`] + 1 + (upgradeCount - 4))}\` (\`$${readableNum(Math.pow(10, casinoUser[`badgeLevel`] + upgradeCount))}\`)`)
                            .setColor(`#2EC14E`));

                    } else if (userResponse == `n` || userResponse == `no`) {
                        return message.channel.send(new MessageEmbed()
                            .setDescription(`:information_source: Canceled badge upgrade`)
                            .setColor(`#0083FF`));
                    }
                });
                collector.on('end', collected => {
                    // Name entry timed out
                    if (!collected.size) return message.channel.send(new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Badge upgrade response timed out`)
                        .setColor(`#FF3838`));
                });
            } else {
                // User cannot afford badge upgrade
                message.channel.send(new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> You cannot afford to upgrade your badge\n\nCurrent balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\nNext badge costs: \`$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`]))}\``)
                    .setColor(`#FF3838`));
            }
        }
    }
};