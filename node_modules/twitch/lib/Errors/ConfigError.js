"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CustomError_1 = require("./CustomError");
/**
 * Thrown whenever you try using invalid values in the client configuration.
 */
var ConfigError = /** @class */ (function (_super) {
    tslib_1.__extends(ConfigError, _super);
    function ConfigError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConfigError;
}(CustomError_1.default));
exports.default = ConfigError;
//# sourceMappingURL=ConfigError.js.map