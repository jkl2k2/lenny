"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CustomError_1 = require("./CustomError");
/**
 * Thrown whenever a HTTP error occurs. Some HTTP errors are handled in the library when they're expected.
 */
var HTTPStatusCodeError = /** @class */ (function (_super) {
    tslib_1.__extends(HTTPStatusCodeError, _super);
    /** @private */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function HTTPStatusCodeError(statusCode, statusText, body) {
        var _this = _super.call(this, "Encountered HTTP status code " + statusCode + ": " + statusText + "\n\nBody:\n" + JSON.stringify(body, null, 2)) || this;
        _this._statusCode = statusCode;
        _this._body = body;
        return _this;
    }
    Object.defineProperty(HTTPStatusCodeError.prototype, "statusCode", {
        get: function () {
            return this._statusCode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPStatusCodeError.prototype, "body", {
        get: function () {
            return this._body;
        },
        enumerable: true,
        configurable: true
    });
    return HTTPStatusCodeError;
}(CustomError_1.default));
exports.default = HTTPStatusCodeError;
//# sourceMappingURL=HTTPStatusCodeError.js.map