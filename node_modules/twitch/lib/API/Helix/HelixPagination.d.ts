/**
 * Base forward pagination parameters for Helix requests.
 */
export interface HelixForwardPagination {
    /**
     * The number of results per page.
     */
    limit?: string;
    /**
     * A cursor to get the following page of.
     */
    after?: string;
}
/**
 * Base pagination parameters for Helix requests.
 *
 * @inheritDoc
 */
export default interface HelixPagination extends HelixForwardPagination {
    /**
     * A cursor to get the previous page of.
     */
    before?: string;
}
/** @private */
export declare function makePaginationQuery({ after, before, limit }?: HelixPagination): {
    after: string | undefined;
    before: string | undefined;
    first: string | undefined;
};
