"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ChannelPlaceholder_1 = require("./ChannelPlaceholder");
/**
 * A Twitch Channel.
 */
var Channel = /** @class */ (function (_super) {
    tslib_1.__extends(Channel, _super);
    /** @private */
    function Channel(data, client) {
        var _this = _super.call(this, data._id, client) || this;
        _this._data = data;
        return _this;
    }
    // override parent's method so we avoid the API/cache request here if someone wrongly assumes this is a placeholder
    /** @private */
    Channel.prototype.getChannel = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this];
            });
        });
    };
    /**
     * Updates the game, title or delay of a channel or toggles the channel feed.
     */
    Channel.prototype.update = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._client.kraken.channels.updateChannel(this, data)];
            });
        });
    };
    Object.defineProperty(Channel.prototype, "name", {
        /**
         * The name of the channel.
         */
        get: function () {
            return this._data.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "displayName", {
        /**
         * The display name of the channel, with proper capitalization or as Asian script.
         */
        get: function () {
            return this._data.display_name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "broadcasterLanguage", {
        /**
         * The broadcaster's language.
         */
        get: function () {
            return this._data.broadcaster_language;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "broadcasterType", {
        /**
         * The broadcaster's type, i.e. "partner", "affiliate" or "" (empty string, so neither of them).
         */
        get: function () {
            return this._data.broadcaster_type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "creationDate", {
        /**
         * The date when the channel was created.
         */
        get: function () {
            return new Date(this._data.created_at);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "description", {
        /**
         * The description of the channel.
         */
        get: function () {
            return this._data.description;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "followers", {
        /**
         * The number of people following the channel.
         */
        get: function () {
            return this._data.followers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "game", {
        /**
         * The game that is currently being played on the channel (or was played when it was last online).
         */
        get: function () {
            return this._data.game;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "language", {
        /**
         * The language of the channel.
         */
        get: function () {
            return this._data.language;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "logo", {
        /**
         * The URL to the logo of the channel.
         */
        get: function () {
            return this._data.logo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "isMature", {
        /**
         * Whether the channel is flagged as suitable for mature audiences only.
         */
        get: function () {
            return this._data.mature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "isPartner", {
        /**
         * Whether the channel is partnered.
         */
        get: function () {
            return this._data.partner;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "profileBanner", {
        /**
         * The URL to the profile's banner image.
         */
        get: function () {
            return this._data.profile_banner;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "profileBannerBackgroundColor", {
        /**
         * The background color of the profile's banner.
         */
        get: function () {
            return this._data.profile_banner_background_color;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "status", {
        /**
         * The current status message (i.e. the title) of the channel.
         */
        get: function () {
            return this._data.status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "updateDate", {
        /**
         * The date when the channel was last updated.
         */
        get: function () {
            return new Date(this._data.updated_at);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "url", {
        /**
         * The URL to the channel.
         */
        get: function () {
            return this._data.url;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "videoBanner", {
        /**
         * The URL to the channel's video banner, i.e. the offline image.
         */
        get: function () {
            return this._data.video_banner;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "views", {
        /**
         * The total number of views of the channel.
         */
        get: function () {
            return this._data.views;
        },
        enumerable: true,
        configurable: true
    });
    return Channel;
}(ChannelPlaceholder_1.default));
exports.default = Channel;
//# sourceMappingURL=Channel.js.map