import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import bcrypt from "bcrypt"; //added


export async function POST(req: Request) {
  try {

    // Here the data coming from the input is being parsed and stored in the body variable. 
    const body = await req.json();
    console.log("BODY:", body);
    
    // Here the individual properties of the body are being extracted and stored in separate variables. The password is being hashed using bcrypt before being stored in the database.
    const { teamName, teamSize, password, members } = body;
    const hashedPassword = await bcrypt.hash(password, 10); //added

    // Here the team information is being inserted into the "teams" table in the database using the supabaseAdmin client. 
const { data: team, error: teamError } = await supabaseAdmin
  .from("teams")
  .insert([{ teamName, password: hashedPassword, teamSize }]) //changed
  .select()
  .single();

    if (teamError) {
      console.log("TEAM ERROR:", teamError);
      return NextResponse.json({ error: teamError.message }, { status: 400 });
    }

    const membersWithTeam = members.map((m: any) => ({
      ...m,
      team_id: team.team_id,
    }));

    const { error: memberError } = await supabaseAdmin
      .from("members")
      .insert(membersWithTeam);

    if (memberError) {
      console.log("MEMBER ERROR:", memberError);
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("SERVER CRASH:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}