import User from '../API/Kraken/User/User';
import ChannelPlaceholder from '../API/Kraken/Channel/ChannelPlaceholder';
import Channel from '../API/Kraken/Channel/Channel';
import HelixUser from '../API/Helix/User/HelixUser';
export declare type UserIdResolvable = string | User | ChannelPlaceholder | HelixUser;
export declare type UserNameResolvable = string | User | Channel | HelixUser;
/**
 * Extracts the user ID from an argument that is possibly an object containing that ID.
 *
 * @param user The user ID or object.
 */
export declare function extractUserId(user: UserIdResolvable): string;
/**
 * Extracts the user name from an argument that is possibly an object containing that name.
 *
 * @param user The user name or object.
 */
export declare function extractUserName(user: UserNameResolvable): string;
