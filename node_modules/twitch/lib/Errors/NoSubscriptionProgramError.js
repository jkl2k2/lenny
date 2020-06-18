"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CustomError_1 = require("./CustomError");
/**
 * Thrown whenever you try accessing a subscription-related resource
 * (for example {@ChannelAPI#getChannelSubscriptions})
 * and the given channel does not have a subscription program.
 */
var NoSubscriptionProgramError = /** @class */ (function (_super) {
    tslib_1.__extends(NoSubscriptionProgramError, _super);
    function NoSubscriptionProgramError(channelId) {
        return _super.call(this, "Channel " + channelId + " does not have a subscription program") || this;
    }
    return NoSubscriptionProgramError;
}(CustomError_1.default));
exports.default = NoSubscriptionProgramError;
//# sourceMappingURL=NoSubscriptionProgramError.js.map