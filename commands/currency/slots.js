const index = require(`../../index.js`);
const { MessageEmbed } = require(`discord.js`);
const currency = index.getCurrencyDB();

function rand() {
    const symbols = [`:green_apple:`, `:apple:`, `:pear:`, `:tangerine:`, `:lemon:`, `:banana:`, `:watermelon:`, `:grapes:`, `:blueberries:`, `:seven:`];

    const rand = Math.floor(Math.random() * (symbols.length));

    const obj = {
        symbol: symbols[rand],
        value: rand
    };

    return obj;
}

function generateSpins() {
    let generated = [];
    for (let i = 0; i < 9; i++) {
        generated.push(rand());
    }
    return generated;
}

module.exports = {
    name: 'slots',
    description: 'Slot machine',
    aliases: ['spin', 'slot'],
    // args: true,
    usage: '[bet]',
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
        // If no args
        if (!args[0]) {
            return message.channel.send(new MessageEmbed()
                .setAuthor(`🎰 Slots!`)
                .setDescription(`**Total of 10 symbols (mostly fruits/vegetables)**\nAll fruits pay the same: \`4x\` for two in a row and \`100x\` for 3 in a row\n\n**BUT sevens exist as well**\nGetting three sevens in a row awards the \`JACKPOT\` (currently \`$${currency.getBalance(`0`)}\`)`)
                .setColor(`#801431`));
        }

        const bet = args[0];

        const previousBalance = currency.getBalance(message.author.id);

        if (args[0] == "coosin" || args[0] == "collin" || args[0] == "cucino") {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Sorry, we do not accept trash as a currency for betting.`)
                .setColor(`#FF3838`));
        }

        if (isNaN(args[0])) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please input a number to bet`)
                .setColor(`#FF3838`));
        }

        if (parseInt(args[0]) == 0) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please bet more than $0`)
                .setColor(`#FF3838`));
        }

        if (parseInt((args[0]) < 1 && parseInt(args[0]) > 0) || (Math.floor(args[0]) != args[0])) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please input a whole number, not a decimal`)
                .setColor(`#FF3838`));
        }

        if (parseInt(args[0]) < 0) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please input a positive number`)
                .setColor(`#FF3838`));
        }

        if (previousBalance < args[0]) {
            return message.channel.send(new MessageEmbed()
                .setDescription("<:cross:729019052571492434> Sorry, you do not have enough money to bet that amount")
                .setColor(`#FF3838`));
        }

        if (bet < 5) {
            return message.channel.send(new MessageEmbed()
                .setAuthor(`🎰 Slots!`)
                .setDescription(`:warning: Sorry, for now please bet at least $5`)
                .setColor(`#801431`));
        }

        let rolls = generateSpins();

        // Initial message
        message.channel.send(new MessageEmbed()
            .setDescription(`**:slot_machine: ${message.author.username}'s Slots Game**
            
            **Current Jackpot:** \`$${currency.getBalance(`0`)}\`

            ${rolls[0].symbol} │ ${rolls[1].symbol} │ ${rolls[2].symbol}

            ${rolls[3].symbol} │ ${rolls[4].symbol} │ ${rolls[5].symbol}\xa0\xa0\xa0\xa0:arrow_left:
            
            ${rolls[6].symbol} │ ${rolls[7].symbol} │ ${rolls[8].symbol}`)
            .setColor(`#801431`)
            .setThumbnail(message.author.avatarURL()))
            .then(m => {
                // Continue "spinning"
                setTimeout(() => {
                    let rolls = generateSpins();

                    m.edit(new MessageEmbed()
                        .setDescription(`**:slot_machine: ${message.author.username}'s Slots Game**
            
                        **Current Jackpot:** \`$${currency.getBalance(`0`)}\`

                        ${rolls[0].symbol} │ ${rolls[1].symbol} │ ${rolls[2].symbol}

                        ${rolls[3].symbol} │ ${rolls[4].symbol} │ ${rolls[5].symbol}\xa0\xa0\xa0\xa0:arrow_left:
            
                        ${rolls[6].symbol} │ ${rolls[7].symbol} │ ${rolls[8].symbol}`)
                        .setColor(`#801431`)
                        .setThumbnail(message.author.avatarURL())
                    );

                    // Final landing spot
                    setTimeout(() => {
                        let rolls = generateSpins();

                        // rolls[3].value == rolls[4].value && rolls[3].value == rolls[5].value

                        if (rolls[3].symbol == `:seven:` && rolls[4].symbol == `:seven:` && rolls[5].symbol == `:seven:`) {
                            // All 3 match and are sevens -> Jackpot

                            // Deduct from player
                            currency.add(message.author.id, -bet);

                            // Add to casino
                            currency.add(`0`, bet);

                            if (message.author.id == ``) {
                                return m.edit(new MessageEmbed()
                                    .setDescription(`**:slot_machine: ${message.author.username}'s Slots Game**
                            
                            **Current Jackpot:** \`$${currency.getBalance(`0`)}\`
                                
                            :apple: │ :banana: │ :peach:

                            :banana: │ :seven: │ :seven:\xa0\xa0\xa0\xa0:arrow_left:
            
                            :apple: │ :pear: │ :peach:

                            *No Matches...*\n\`Sorry, you lost $${bet}!\` 

                            Previous balance: \`$${previousBalance}\`
                            Current balance: \xa0\xa0\`$${currency.getBalance(message.author.id)}\``)
                                    .setColor(`#801431`)
                                    .setThumbnail(message.author.avatarURL())
                                );
                            }

                            // Pay jackpot from casino bank account
                            currency.add(message.author.id, currency.getBalance(`0`));

                            // Deduct from casino
                            currency.add(`0`, -currency.getBalance(`0`));

                            // Edit 
                            m.edit(new MessageEmbed()
                                .setDescription(`**:slot_machine: ${message.author.username}'s Slots Game**
            
                            **Current Jackpot:** \`$${currency.getBalance(`0`)}\`

                            ${rolls[0].symbol} │ ${rolls[1].symbol} │ ${rolls[2].symbol}

                            ${rolls[3].symbol} │ ${rolls[4].symbol} │ ${rolls[5].symbol}\xa0\xa0\xa0\xa0:arrow_left:
            
                            ${rolls[6].symbol} │ ${rolls[7].symbol} │ ${rolls[8].symbol}
                            
                            ***JACKPOT*** ***JACKPOT*** ***JACKPOT*** ***JACKPOT*** ***JACKPOT***
                            ***JACKPOT*** ***JACKPOT*** ***JACKPOT*** ***JACKPOT*** ***JACKPOT*** 

                            \`YOU WON $${currency.getBalance(`0`)}!!!\` 

                            Previous balance: \`$${previousBalance}\`
                            Current balance: \xa0\xa0\`$${currency.getBalance(message.author.id)}\``)
                                .setColor(`#801431`)
                                .setThumbnail(message.author.avatarURL())
                            );

                        } else if (rolls[3].value == rolls[4].value && rolls[3].value == rolls[5].value) {
                            // All 3 match but not sevens

                            // Pay 100x
                            currency.add(message.author.id, bet * 100);

                            // Add to casino jackpot anyway
                            currency.add(`0`, bet * 100);

                            // Edit 
                            m.edit(new MessageEmbed()
                                .setDescription(`**:slot_machine: ${message.author.username}'s Slots Game**
            
                            **Current Jackpot:** \`$${currency.getBalance(`0`)}\`

                            ${rolls[0].symbol} │ ${rolls[1].symbol} │ ${rolls[2].symbol}

                            ${rolls[3].symbol} │ ${rolls[4].symbol} │ ${rolls[5].symbol}\xa0\xa0\xa0\xa0:arrow_left:
            
                            ${rolls[6].symbol} │ ${rolls[7].symbol} │ ${rolls[8].symbol}

                            *3 Matching!!!*\n\`You won $${bet * 100}!\` 

                            Previous balance: \`$${previousBalance}\`
                            Current balance: \xa0\xa0\`$${currency.getBalance(message.author.id)}\``)
                                .setColor(`#801431`)
                                .setThumbnail(message.author.avatarURL())
                            );

                        } else if (rolls[3].value == rolls[4].value || rolls[3].value == rolls[5].value || rolls[4].value == rolls[5].value) {
                            // Two matches

                            // Pay 4x
                            currency.add(message.author.id, bet * 4);

                            // Add to casino jackpot anyway
                            currency.add(`0`, bet * 4);

                            // Edit 
                            m.edit(new MessageEmbed()
                                .setDescription(`**:slot_machine: ${message.author.username}'s Slots Game**
            
                            **Current Jackpot:** \`$${currency.getBalance(`0`)}\`

                            ${rolls[0].symbol} │ ${rolls[1].symbol} │ ${rolls[2].symbol}

                            ${rolls[3].symbol} │ ${rolls[4].symbol} │ ${rolls[5].symbol}\xa0\xa0\xa0\xa0:arrow_left:
            
                            ${rolls[6].symbol} │ ${rolls[7].symbol} │ ${rolls[8].symbol}

                            *2 Matching!*\n\`You won $${bet * 4}!\` 

                            Previous balance: \`$${previousBalance}\`
                            Current balance: \xa0\xa0\`$${currency.getBalance(message.author.id)}\``)
                                .setColor(`#801431`)
                                .setThumbnail(message.author.avatarURL())
                            );
                        } else {
                            // Loss

                            // Deduct from player
                            currency.add(message.author.id, -bet);

                            // Add to casino
                            currency.add(`0`, bet);

                            // Edit 
                            m.edit(new MessageEmbed()
                                .setDescription(`**:slot_machine: ${message.author.username}'s Slots Game**
                            
                            **Current Jackpot:** \`$${currency.getBalance(`0`)}\`
                                
                            ${rolls[0].symbol} │ ${rolls[1].symbol} │ ${rolls[2].symbol}

                            ${rolls[3].symbol} │ ${rolls[4].symbol} │ ${rolls[5].symbol}\xa0\xa0\xa0\xa0:arrow_left:
            
                            ${rolls[6].symbol} │ ${rolls[7].symbol} │ ${rolls[8].symbol}

                            *No Matches...*\n\`Sorry, you lost $${bet}!\` 

                            Previous balance: \`$${previousBalance}\`
                            Current balance: \xa0\xa0\`$${currency.getBalance(message.author.id)}\``)
                                .setColor(`#801431`)
                                .setThumbnail(message.author.avatarURL())
                            );
                        }
                    }, 750);
                }, 750);
            });
    }
};