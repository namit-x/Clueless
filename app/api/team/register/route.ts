import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { teamSignupSchema } from "../../../../validators/team";

export async function POST(req: Request) {
  try {
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

    const leaders = members.filter((m) => m.isLeader);

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
      await supabaseAdmin.auth.admin.createUser({
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
    const teamId = crypto.randomUUID();

    const { error: teamError } = await supabaseAdmin.from("teams").insert([
      {
        team_id: teamId,
        team_name: normalizedTeamName,
        team_size: teamSize,
        owner_id: ownerId,
      },
    ]);

    if (teamError) {
      await supabaseAdmin.auth.admin.deleteUser(ownerId);
      return NextResponse.json({ error: teamError.message }, { status: 400 });
    }

    const membersWithTeam = members.map((m) => ({
      member_id: crypto.randomUUID(),
      team_id: teamId,
      name: m.name.trim(),
      mobile: m.mobile.trim(),
      email: m.email.trim().toLowerCase(),
      branch: m.branch.trim(),
      is_leader: m.isLeader,
      role: m.isLeader ? "leader" : "user",
    }));

    const { error: memberError } = await supabaseAdmin
      .from("members")
      .insert(membersWithTeam);

    if (memberError) {
      await supabaseAdmin.from("teams").delete().eq("team_id", teamId);
      await supabaseAdmin.auth.admin.deleteUser(ownerId);
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, teamId, ownerId });
  } catch (err) {
    console.error("SERVER CRASH:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
