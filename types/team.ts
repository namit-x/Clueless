export interface TeamMemberInput {
    name: string;
    mobile: string;
    email: string;
    branch: string;
    isLeader: boolean;
}

export interface TeamSignupInput {
    teamName: string;
    password: string;
    teamSize: number;
    members: TeamMemberInput[];
}