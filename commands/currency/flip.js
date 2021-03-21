const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const { Users, CurrencyShop } = require('../../dbObjects');
const { Op } = require('sequelize');
const currency = index.getCurrencyDB();
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);
const MersenneTwister = require('mersenne-twister');
const generator = new MersenneTwister();

module.exports = {
    name: 'flip',
    description: 'A simple coin flip: Heads to win double your bet, tails to lose your bet.',
    aliases: ['coin', 'coinflip', 'flipcoin'],
    args: true,
    usage: '[h/t] [bet] --or-- [bet] [h/t]',
    altUsage: '[bet]',
    cooldown: 2,
    // guildOnly: true,
    enabled: true,
    type: 'currency',
    execute(message, args) {
        if (message.channel.id == "471193210102743042") return;

        const client = message.client;

        let originalBalance = currency.getBalance(message.author.id);

        const casinoUser = client.casinoUser.ensure(message.author.id, client.casinoUser.default);

        let bet;
        let sideArg;
        let side;

        if (isNaN(args[0]) && !isNaN(args[1])) {
            // if second argument is bet
            bet = args[1];
            sideArg = args[0];
        } else if (!isNaN(args[0]) && isNaN(args[1])) {
            // if first argument is bet
            bet = args[0];
            sideArg = args[1];
        } else {
            // catch
            bet = "catch";
        }

        if (sideArg && (sideArg.toLowerCase() == "heads" || sideArg.toLowerCase() == "h")) {
            // if heads provided
            side = "heads";
        } else if (sideArg && (sideArg.toLowerCase() == "tails" || sideArg.toLowerCase() == "t")) {
            // if tails provided
            side = "tails";
        } else {
            // default to heads
            side = "heads";
        }

        let rand = 0;

        if (side == "heads") {
            rand = Math.round(generator.random_incl() + (casinoUser[`losingStreak`] * 0.05));
        } else {
            rand = Math.round(generator.random_incl() - (casinoUser[`losingStreak`] * 0.05));
        }

        // // console.log(rand);

        if (bet == "coosin" || bet == "collin" || bet == "cucino") {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Sorry, we do not accept trash as a currency for betting.`)
                .setColor(`#FF3838`));
        }

        if (isNaN(bet)) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please input a number to bet`)
                .setColor(`#FF3838`));
        }

        if (parseInt(bet) == 0) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please bet more than $0`)
                .setColor(`#FF3838`));
        }

        if (parseInt((bet) < 1 && parseInt(bet) > 0) || (Math.floor(bet) != bet)) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please input a whole number, not a decimal`)
                .setColor(`#FF3838`));
        }

        if (parseInt(bet) < 0) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please input a positive number`)
                .setColor(`#FF3838`));
        }

        if (originalBalance < bet) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription("<:cross:729019052571492434> Sorry, you do not have enough money to bet that amount")
                .setColor(`#FF3838`));
        }

        let getBonus = false;
        let getSaved = false;

        if (Math.random() < (0.05 * casinoUser[`badgeLevel`]))
            getBonus = true;

        if (Math.random() < (0.03 * casinoUser[`badgeLevel`]))
            getSaved = true;

        // 1 is heads
        // 0 is tails
        if (rand == 1) {
            // Heads
            if (side == "heads") {
                // Win

                // Add winnings to account
                currency.add(message.author.id, parseInt(bet));

                // Deduct from casino profits
                // currency.add("0", -parseInt(bet));

                // Add to casinoUser losingStreak
                client.casinoUser.set(message.author.id, 0, `losingStreak`);

                // console.log(casinoUser[`losingStreak`]);

                // Win message
                if (getBonus) {
                    // Add bonus
                    currency.add(message.author.id, parseInt(Math.ceil(bet / 4)));

                    // Bonus win message
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`:game_die: You flipped: \`Heads\`\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\n:tada: **BONUS!** Won an extra **$${Math.ceil(bet / 4)}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                        .setThumbnail(message.author.avatarURL())
                        .setColor(`#801431`));
                } else {
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`:game_die: You flipped: \`Heads\`\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                        .setThumbnail(message.author.avatarURL())
                        .setColor(`#801431`));
                }
            } else {
                // Loss

                // Deduct loss from account
                currency.add(message.author.id, -parseInt(bet));

                // Add to casino profits
                // currency.add("0", parseInt(bet));

                // Add to casinoUser losingStreak
                client.casinoUser.set(message.author.id, casinoUser[`losingStreak`] + 1, `losingStreak`);

                // console.log(casinoUser[`losingStreak`]);

                // Loss message
                if (getSaved) {
                    // Refund loss
                    currency.add(message.author.id, parseInt(bet));

                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`:game_die: You flipped: \`Heads\`\n\nSorry, ${message.author.username}! You **lost** your bet of **$${bet}**.\n\n:angel: **You've been saved!** Your loss has been refunded.\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                        .setThumbnail(message.author.avatarURL())
                        .setColor(`#801431`));
                } else {
                    // Refund loss
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`:game_die: You flipped: \`Heads\`\n\nSorry, ${message.author.username}! You **lost** your bet of **$${bet}**.\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                        .setThumbnail(message.author.avatarURL())
                        .setColor(`#801431`));
                }

            }
        } else {
            // Tails
            if (side == "heads") {
                // Loss

                // Deduct loss from account
                currency.add(message.author.id, -parseInt(bet));

                // Add to casino profits
                // currency.add("0", parseInt(bet));

                // Add to casinoUser losingStreak
                client.casinoUser.set(message.author.id, casinoUser[`losingStreak`] + 1, `losingStreak`);

                // console.log(casinoUser[`losingStreak`]);

                // Loss message
                if (getSaved) {
                    // Refund loss
                    currency.add(message.author.id, parseInt(bet));

                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`:game_die: You flipped: \`Tails\`\n\nSorry, ${message.author.username}! You **lost** your bet of **$${bet}**.\n\n:angel: **You've been saved!** Your loss has been refunded.\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                        .setThumbnail(message.author.avatarURL())
                        .setColor(`#801431`));
                } else {
                    // Refund loss
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`:game_die: You flipped: \`Tails\`\n\nSorry, ${message.author.username}! You **lost** your bet of **$${bet}**.\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                        .setThumbnail(message.author.avatarURL())
                        .setColor(`#801431`));
                }
            } else {
                // Win

                // Add winnings to account
                currency.add(message.author.id, parseInt(bet));

                // Deduct from casino profits
                // currency.add("0", -parseInt(bet));

                // Add to casinoUser losingStreak
                client.casinoUser.set(message.author.id, 0, `losingStreak`);

                // console.log(casinoUser[`losingStreak`]);

                // Win message
                if (getBonus) {
                    // Add bonus
                    currency.add(message.author.id, parseInt(Math.ceil(bet / 4)));

                    // Bonus win message
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`:game_die: You flipped: \`Tails\`\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\n:tada: **BONUS!** Won an extra **$${Math.ceil(bet / 4)}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                        .setThumbnail(message.author.avatarURL())
                        .setColor(`#801431`));
                } else {
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`:game_die: You flipped: \`Tails\`\n\nCongrats, ${message.author.username}! You **won** your bet of **$${bet}**!\n\nPrevious balance: **$${originalBalance}**\nNew balance: **$${currency.getBalance(message.author.id)}**`)
                        .setThumbnail(message.author.avatarURL())
                        .setColor(`#801431`));
                }
            }
        }
    }
};