"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var HelixBan_1 = require("./HelixBan");
/**
 * The different types a ban event can have.
 */
var HelixBanEventType;
(function (HelixBanEventType) {
    /**
     * Sent when a user gets banned.
     */
    HelixBanEventType["Ban"] = "moderation.user.ban";
    /**
     * Sent when a user gets unbanned.
     */
    HelixBanEventType["Unban"] = "moderation.user.unban";
})(HelixBanEventType = exports.HelixBanEventType || (exports.HelixBanEventType = {}));
/**
 * An event that indicates the change of a ban status, i.e. banning or unbanning a user.
 */
var HelixBanEvent = /** @class */ (function (_super) {
    tslib_1.__extends(HelixBanEvent, _super);
    /** @private */
    function HelixBanEvent(_eventData, client) {
        var _this = _super.call(this, _eventData.event_data, client) || this;
        _this._eventData = _eventData;
        return _this;
    }
    Object.defineProperty(HelixBanEvent.prototype, "eventId", {
        /**
         * The unique ID of the ban event.
         */
        get: function () {
            return this._eventData.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HelixBanEvent.prototype, "eventType", {
        /**
         * The type of the ban event.
         */
        get: function () {
            return this._eventData.event_type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HelixBanEvent.prototype, "eventDate", {
        /**
         * The date of the ban event.
         */
        get: function () {
            return new Date(this._eventData.event_timestamp);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HelixBanEvent.prototype, "eventVersion", {
        /**
         * The version of the ban event.
         */
        get: function () {
            return this._eventData.version;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HelixBanEvent.prototype, "broadcasterId", {
        /**
         * The id of the broadcaster from whose chat the user was banned/unbanned.
         */
        get: function () {
            return this._eventData.event_data.broadcaster_id;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieves more data about the broadcaster.
     */
    HelixBanEvent.prototype.getBroadcaster = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._client.helix.users.getUserById(this._eventData.event_data.broadcaster_id)];
            });
        });
    };
    Object.defineProperty(HelixBanEvent.prototype, "broadcasterName", {
        /**
         * The name of the broadcaster from whose chat the user was banned/unbanned.
         */
        get: function () {
            return this._eventData.event_data.broadcaster_id;
        },
        enumerable: true,
        configurable: true
    });
    return HelixBanEvent;
}(HelixBan_1.default));
exports.default = HelixBanEvent;
//# sourceMappingURL=HelixBanEvent.js.map