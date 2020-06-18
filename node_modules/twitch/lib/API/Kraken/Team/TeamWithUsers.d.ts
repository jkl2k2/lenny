import Team, { TeamData } from './Team';
import User, { UserData } from '../User/User';
/** @private */
export interface TeamWithUsersData extends TeamData {
    users: UserData[];
}
export default class TeamWithUsers extends Team {
    /** @private */
    protected _data: TeamWithUsersData;
    /**
     * The list of users in the team.
     */
    getUsers(): Promise<User[]>;
}
