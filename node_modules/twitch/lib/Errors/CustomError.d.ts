/** @private */
export default class CustomError extends Error {
    constructor(...params: [string, string?, string?]);
    get name(): string;
}
