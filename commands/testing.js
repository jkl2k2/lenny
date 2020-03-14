const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
    name: 'testing',
    description: 'Testing',
    aliases: ['t'],
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    execute(message, args) {
        var dispatcher = index.getDispatcher();
        var playing = index.getPlayingVideo().getVideo();
        var playingObj = index.getPlayingVideo();

        var minsToSec = playing.duration.minutes * 60;
        var total = playing.duration.seconds + minsToSec;

        var formattedTotal = index.getPlayingVideo().getLength();
        
        var minsPlaying = Math.trunc((dispatcher.time / 1000) / 60);
        var secondsPlaying = Math.trunc((dispatcher.time / 1000) - (minsPlaying * 60));

        var formattedPlaying = ``;

        if (minsPlaying < 1) {
            if (secondsPlaying < 10) {
                formattedPlaying = `0:0${secondsPlaying}`;
            } else {
                formattedPlaying = `0:${secondsPlaying}`;
            }
        } else {
            if (secondsPlaying < 10) {
                formattedPlaying = `${minsPlaying}:0${secondsPlaying}`;
            } else {
                formattedPlaying = `${minsPlaying}:${secondsPlaying}`;
            }
        }

        var frac = (dispatcher.time / 1000) / total;

        var progressBar = ``;

        if (frac >= 0.9) {
            progressBar = (`\`<----------🔘> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0.8) {
            progressBar = (`\`<---------🔘-> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0.7) {
            progressBar = (`\`<--------🔘--> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0.7) {
            progressBar = (`\`<-------🔘---> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0.6) {
            progressBar = (`\`<------🔘----> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0.5) {
            progressBar = (`\`<-----🔘-----> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0.4) {
            progressBar = (`\`<----🔘------> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0.3) {
            progressBar = (`\`<---🔘-------> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0.2) {
            progressBar = (`\`<--🔘--------> (${formattedPlaying}/${formattedTotal})\``)
        } else if (frac >= 0.1) {
            progressBar = (`\`<-🔘---------> (${formattedPlaying}/${formattedTotal})\``);
        } else if (frac >= 0) {
            progressBar = (`\`<🔘----------> (${formattedPlaying}/${formattedTotal})\``);
        }

        var embed = index.getPlaying();

        embed.setDescription(`**[${playingObj.getTitle()}](${playingObj.getURL()})**\n${progressBar}`);

        message.channel.send(embed);
    }
}