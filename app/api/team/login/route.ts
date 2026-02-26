import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createSessionToken } from "@/lib/auth";

const loginSchema = z.object({
  teamName: z.string(),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    // ✅ Parse & validate
    const body = await req.json();
    const { teamName, password } = loginSchema.parse(body);

    console.log("LOGIN BODY:", body);

    // ✅ Fetch team from Supabase
    const { data: team, error } = await supabaseAdmin
      .from("teams")
      .select("*")
      .ilike("teamName", teamName) // case-insensitive match
      .single();

    if (error || !team) {
      return NextResponse.json(
        { error: "Invalid team name or password" },
        { status: 401 }
      );
    }

    // ✅ Compare password
    const validPassword = await bcrypt.compare(
      password,
      team.password // change to team.password_hash if that's your column
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid team name or password" },
        { status: 401 }
      );
    }

    // ✅ Create session token
    const token = await createSessionToken({
      teamId: team.team_id,
      teamName: team.teamName,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      team: {
        id: team.team_id,
        name: team.teamName,
      },
    });

    // ✅ Secure cookie
    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error: any) {
    console.error("Login Error:", error);

    if (error.name === "ZodError") {
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
