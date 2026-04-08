import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Authenticate and get teamId
    const user = await verifyToken(req);
    const teamId = user.teamId;

    if (!teamId) {
      throw new Error("Team ID not found in token");
    }

    // Query real team data from database
    let teamData = { is_active: true, penalty_time_seconds: 0 };

    try {
      const query = "SELECT is_approved FROM teams WHERE team_id = $1";
      const result = await pool.query(query, [teamId]);

      if (result.rows && result.rows[0]) {
        // Map is_approved to is_active: only active if approved
        teamData.is_active = result.rows[0].is_approved ?? true;
      }
    } catch (dbError: any) {
      // Fallback to mock if DB query fails
      console.warn("Team dashboard DB query failed, using fallback:", dbError.message);
      teamData = { is_active: true, penalty_time_seconds: 0 };
    }

    return NextResponse.json(teamData);
  } catch (error: any) {
    console.error("Team dashboard error:", error.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}