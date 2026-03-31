import { fetchAllMembersService } from "@/services/adminMembersService";

export async function getAllMembersController() {
    try {
        const members = await fetchAllMembersService();

        return members;
    } catch (error: any) {
        throw new Error(`CONTROLLER_FETCH_MEMBERS_FAILED: ${error.message}`);
    }
}
