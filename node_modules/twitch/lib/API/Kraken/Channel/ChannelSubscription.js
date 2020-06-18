"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Subscription_1 = require("../Subscription");
var User_1 = require("../User/User");
/**
 * A relation of a user subscribing to a previously given channel.
 */
var ChannelSubscription = /** @class */ (function (_super) {
    tslib_1.__extends(ChannelSubscription, _super);
    function ChannelSubscription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ChannelSubscription.prototype, "user", {
        /**
         * The user subscribing to the given channel.
         */
        get: function () {
            return new User_1.default(this._data.user, this._client);
        },
        enumerable: true,
        configurable: true
    });
    return ChannelSubscription;
}(Subscription_1.default));
exports.default = ChannelSubscription;
//# sourceMappingURL=ChannelSubscription.js.map