import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
import { teamSignupSchema } from "@/validators/team";
import { isRegistrationEnabled } from "@/lib/repositories/settingsRepo";
import { createTeamWithMembersRepo } from "@/lib/repositories/teamsRepo";

export async function POST(req: Request) {
  try {
    // Check if registration is open before processing
    const regOpen = await isRegistrationEnabled();
    if (!regOpen) {
      return NextResponse.json(
        { error: "Registrations are currently closed." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = teamSignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { teamName, teamSize, password, members } = parsed.data;

    if (members.length !== teamSize) {
      return NextResponse.json(
        { error: "Team size does not match number of members" },
        { status: 400 }
      );
    }

    const leaders = members.filter((m:any) => m.isLeader);

    if (leaders.length !== 1) {
      return NextResponse.json(
        { error: "Exactly one team leader must be selected" },
        { status: 400 }
      );
    }

    const leader = leaders[0];
    const ownerEmail = leader.email.trim().toLowerCase();
    const normalizedTeamName = teamName.trim();

    const { data: authData, error: authError } =
      await supabaseAdmin().auth.admin.createUser({
        email: ownerEmail,
        password,
        email_confirm: true,
        user_metadata: {
          team_name: normalizedTeamName,
        },
      });

    if (authError || !authData.user) {
      const authMessage =
        authError?.message?.includes("already") ||
          authError?.message?.includes("registered")
          ? "Leader email is already registered"
          : authError?.message || "Unable to create auth account";
      return NextResponse.json({ error: authMessage }, { status: 400 });
    }

    const ownerId = authData.user.id;

    try {
      const team = await createTeamWithMembersRepo(normalizedTeamName, teamSize, ownerId, members);
      return NextResponse.json({ success: true, teamId: team.team_id, ownerId });
    } catch (dbError: any) {
      await supabaseAdmin().auth.admin.deleteUser(ownerId);
      return NextResponse.json({ error: dbError.message || "Failed to create team" }, { status: 400 });
    }

  } catch (err) {
    console.error("SERVER CRASH:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
