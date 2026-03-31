import { getAllMembersWithTeamsRepo } from "@/lib/repositories/membersRepo";

export async function fetchAllMembersService() {
    try {
        const rows = await getAllMembersWithTeamsRepo();

        return rows.map((row: any) => ({
            member_id: row.member_id,
            name: row.name,
            email: row.email,
            mobile: row.mobile,
            branch: row.branch,
            is_leader: row.is_leader,
            team: {
                team_id: row.team_id,
                team_name: row.team_name,
            },
        }));
    } catch (error: any) {
        throw new Error(`SERVICE_FETCH_MEMBERS_FAILED: ${error.message}`);
    }
}
