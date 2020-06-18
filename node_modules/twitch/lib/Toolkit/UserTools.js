"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Extracts the user ID from an argument that is possibly an object containing that ID.
 *
 * @param user The user ID or object.
 */
function extractUserId(user) {
    return typeof user === 'string' ? user : user.id;
}
exports.extractUserId = extractUserId;
/**
 * Extracts the user name from an argument that is possibly an object containing that name.
 *
 * @param user The user name or object.
 */
function extractUserName(user) {
    return typeof user === 'string' ? user : user.name;
}
exports.extractUserName = extractUserName;
//# sourceMappingURL=UserTools.js.map