import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createSessionToken } from "@/lib/auth";

const loginSchema = z.object({
  teamName: z.string().trim().min(1),
  password: z.string().min(1),
});

const supabaseAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

const ADMIN_USERS = process.env.ADMIN_STRINGS?.split(",") || [];
const ADMIN_PASSWORDS = process.env.ADMIN_PASS?.split(",") || [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamName, password } = loginSchema.parse(body);

    const normalizedTeamName = teamName.trim();

    /* ---------------- ADMIN LOGIN ---------------- */

    const adminIndex = ADMIN_USERS.findIndex(
      (adminName, i) =>
        adminName.trim() === normalizedTeamName &&
        ADMIN_PASSWORDS[i] === password
    );

    if (adminIndex !== -1) {
      const adminName = ADMIN_USERS[adminIndex].trim();

      const token = await createSessionToken({
        role: "admin",
        adminName,
      });

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: `admin_${adminIndex}`,
          name: adminName,
          role: "admin",
        },
        token,
      });

      response.cookies.set({
        name: "session",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    /* ---------------- TEAM LOGIN ---------------- */

    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("team_id, team_name, owner_id")
      .ilike("team_name", normalizedTeamName)
      .maybeSingle();

    if (teamError || !team || !team.owner_id) {
      return NextResponse.json(
        { error: "Invalid team name or password" },
        { status: 401 }
      );
    }

    const { data: ownerData, error: ownerError } =
      await supabaseAdmin.auth.admin.getUserById(team.owner_id);

    const ownerEmail = ownerData?.user?.email;

    if (ownerError || !ownerEmail) {
      return NextResponse.json(
        { error: "Invalid team name or password" },
        { status: 401 }
      );
    }

    const { data: authData, error: authError } =
      await supabaseAuthClient.auth.signInWithPassword({
        email: ownerEmail,
        password,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Invalid team name or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      teamId: team.team_id,
      teamName: team.team_name,
      role: "team",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: team.team_id,
        name: team.team_name,
        role: "team",
      },
      token,
    });

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error("Login Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      return NextResponse.json(
        { error: "Server configuration error: missing JWT secret" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}