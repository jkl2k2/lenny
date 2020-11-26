const config = require(`config`);
const api = config.get(`Bot.api2`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const prettyMs = require(`pretty-ms`);
const iheart = require(`iheart`);

// #region YTVideo
class YTVideo {
    constructor(video, requester) {
        this.video = video;
        this.requester = requester;
    }
    getTitle() {
        var unformatted = this.video.title;
        var formatted = ``;

        for (var i = 0; i < unformatted.length; i++) {
            if (unformatted.substring(i, i + 1) == `*` || unformatted.substring(i, i + 1) == `_`) {
                formatted += `\\`;
                formatted += unformatted.substring(i, i + 1);
                // i++;
            } else {
                formatted += unformatted.substring(i, i + 1);
            }
        }

        return formatted;
    }
    getURL() {
        return this.video.url;
    }
    getRequester() {
        return this.requester;
    }
    getRequesterName() {
        return this.requester.user.username;
    }
    getRequesterAvatar() {
        return this.requester.user.avatarURL();
    }
    getType() {
        if (!this.video.duration) {
            return "video";
        } else if (this.video.duration.hours == 0 && this.video.duration.minutes == 0 && this.video.duration.seconds == 0) {
            return "livestream";
        } else {
            return "video";
        }
    }
    getThumbnail() {
        if (this.video.maxRes) {
            return this.video.maxRes.url;
        } else {
            return ``;
        }
    }
    async getChannelThumbnail() {
        let fullChannel = await this.video.channel.fetch();
        return fullChannel.thumbnails.default.url;
    }
    getChannelName() {
        return this.video.channel.title;
    }
    getChannelURL() {
        return this.video.channel.url;
    }
    async getLength() {
        if ((!this.video.duration) || this.video.duration.hours == 0 && this.video.duration.minutes == 0 && this.video.duration.seconds == 0) {
            var fullVideo = await youtube.getVideo(this.video.url);
            if (fullVideo.duration.hours == 0) {
                if (fullVideo.duration.seconds < 10) {
                    return `${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
                } else {
                    return `${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
                }
            } else {
                if (fullVideo.duration.seconds < 10) {
                    if (fullVideo.duration.minutes < 10) {
                        return `${fullVideo.duration.hours}:0${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
                    } else {
                        return `${fullVideo.duration.hours}:${fullVideo.duration.minutes}:0${fullVideo.duration.seconds}`;
                    }
                } else {
                    if (fullVideo.duration.minutes < 10) {
                        return `${fullVideo.duration.hours}:0${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
                    } else {
                        return `${fullVideo.duration.hours}:${fullVideo.duration.minutes}:${fullVideo.duration.seconds}`;
                    }
                }
            }
        }

        if (this.video.duration.hours == 0) {
            if (this.video.duration.seconds < 10) {
                return `${this.video.duration.minutes}:0${this.video.duration.seconds}`;
            } else {
                return `${this.video.duration.minutes}:${this.video.duration.seconds}`;
            }
        } else {
            if (this.video.duration.seconds < 10) {
                if (this.video.duration.minutes < 10) {
                    return `${this.video.duration.hours}:0${this.video.duration.minutes}:0${this.video.duration.seconds}`;
                } else {
                    return `${this.video.duration.hours}:${this.video.duration.minutes}:0${this.video.duration.seconds}`;
                }
            } else {
                if (this.video.duration.minutes < 10) {
                    return `${this.video.duration.hours}:0${this.video.duration.minutes}:${this.video.duration.seconds}`;
                } else {
                    return `${this.video.duration.hours}:${this.video.duration.minutes}:${this.video.duration.seconds}`;
                }
            }
        }
    }
    getPosition() {
        // let queue = index.getQueue(this.requester.guild.id);
        let queue = this.requester.guild.music.queue;
        if (queue.indexOf(this) == -1) {
            return 1;
        } else {
            return queue.indexOf(this) + 1;
        }
    }
    getVideo() {
        return this.video;
    }
    async getFullVideo() {
        return await youtube.getVideo(this.video.url);
    }
}
//#endregion

//#region SCSong
class SCSong {
    constructor(requester, info) {
        this.requester = requester;
        this.info = info;
    }
    getURL() {
        return this.info.permalink_url;
    }
    getType() {
        return "soundcloud";
    }
    getTitle() {
        var unformatted = this.info.title;
        var formatted = ``;

        for (var i = 0; i < unformatted.length; i++) {
            if (unformatted.substring(i, i + 1) == `*` || unformatted.substring(i, i + 1) == `_`) {
                formatted += `\\`;
                formatted += unformatted.substring(i, i + 1);
            } else {
                formatted += unformatted.substring(i, i + 1);
            }
        }

        return formatted;
    }
    getChannelName() {
        return this.info.user.username;
    }
    getChannelThumbnail() {
        return this.info.user.avatar_url;
    }
    getChannelURL() {
        return this.info.user.permalink_url;
    }
    getRequester() {
        return this.requester;
    }
    getRequesterName() {
        return this.requester.user.username;
    }
    getRequesterAvatar() {
        return this.requester.user.avatarURL();
    }
    getLength() {
        return prettyMs(this.info.duration, { colonNotation: true, secondsDecimalDigits: 0 });
    }
    getThumbnail() {
        return this.info.artwork_url;
    }
    getPosition() {
        // let queue = index.getQueue(this.requester.guild.id);
        let queue = this.requester.guild.music.queue;
        if (queue.indexOf(this) == -1) {
            return 1;
        } else {
            return queue.indexOf(this) + 1;
        }
    }
}
//#endregion

//#region RadioStation
class RadioStation {
    constructor(station, requester) {
        this.station = station;
        this.requester = requester;
    }
    getStation() {
        return this.station;
    }
    getTitle() {
        var unformatted = this.station.name;
        var formatted = ``;

        for (var i = 0; i < unformatted.length; i++) {
            if (unformatted.substring(i, i + 1) == `*` || unformatted.substring(i, i + 1) == `_`) {
                formatted += `\\`;
                formatted += unformatted.substring(i, i + 1);
                // i++;
            } else {
                formatted += unformatted.substring(i, i + 1);
            }
        }

        return formatted;
    }
    getURL() {
        iheart.streamURL(this.station)
            .then(stream => {
                return stream;
            });
    }
    getRequester() {
        return this.requester;
    }
    getRequesterName() {
        return this.requester.user.username;
    }
    getRequesterAvatar() {
        return this.requester.user.avatarURL();
    }
    getType() {
        return `radio`;
    }
    getThumbnail() {
        return this.station.logo || this.station.newlogo || `https://images.squarespace-cdn.com/content/v1/54becebee4b05d09416fe7e4/1475621818576-WDFS5E94KQTCUOKQQFMS/ke17ZwdGBToddI8pDm48kPatQlumu_Sh_yEKNNtje2NZw-zPPgdn4jUwVcJE1ZvWhcwhEtWJXoshNdA9f1qD7aXK0t8ahyzoOLFEHArbPTIvsJ8ZBSuac1iGVlJVssK0Dume1Xhlc5QUWr24itNJvQ/iHR_primary_Darkjpg?format=300w`;
    }
    async getChannelThumbnail() {
        return `https://images.squarespace-cdn.com/content/v1/54becebee4b05d09416fe7e4/1475621818576-WDFS5E94KQTCUOKQQFMS/ke17ZwdGBToddI8pDm48kPatQlumu_Sh_yEKNNtje2NZw-zPPgdn4jUwVcJE1ZvWhcwhEtWJXoshNdA9f1qD7aXK0t8ahyzoOLFEHArbPTIvsJ8ZBSuac1iGVlJVssK0Dume1Xhlc5QUWr24itNJvQ/iHR_primary_Darkjpg?format=300w`;
    }
    getChannelName() {
        return `iHeartRadio`;
    }
    getChannelURL() {
        return `https://www.iheart.com/`;
    }
    getLength() {
        return `indefinite`;
    }
}
//#endregion

//#region Exports
exports.constructVideo = (input, member) => {
    return new YTVideo(input, member);
};

exports.constructSC = (input, member) => {
    return new SCSong(input, member);
};

exports.constructRadio = (input, member) => {
    return new RadioStation(input, member);
};
//#endregion