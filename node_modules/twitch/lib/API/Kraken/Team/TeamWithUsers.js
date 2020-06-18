"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Team_1 = require("./Team");
var User_1 = require("../User/User");
var TeamWithUsers = /** @class */ (function (_super) {
    tslib_1.__extends(TeamWithUsers, _super);
    function TeamWithUsers() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * The list of users in the team.
     */
    TeamWithUsers.prototype.getUsers = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._data.users.map(function (data) { return new User_1.default(data, _this._client); })];
            });
        });
    };
    return TeamWithUsers;
}(Team_1.default));
exports.default = TeamWithUsers;
//# sourceMappingURL=TeamWithUsers.js.map