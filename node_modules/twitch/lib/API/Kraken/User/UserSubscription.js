"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Subscription_1 = require("../Subscription");
var Channel_1 = require("../Channel/Channel");
/**
 * A relation of a previously given user subscribing to a channel.
 */
var UserSubscription = /** @class */ (function (_super) {
    tslib_1.__extends(UserSubscription, _super);
    function UserSubscription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(UserSubscription.prototype, "channel", {
        /**
         * The subscribed channel.
         */
        get: function () {
            return new Channel_1.default(this._data.channel, this._client);
        },
        enumerable: true,
        configurable: true
    });
    return UserSubscription;
}(Subscription_1.default));
exports.default = UserSubscription;
//# sourceMappingURL=UserSubscription.js.map