import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/cookies";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully",
    });

    deleteSessionCookie(response);

    return response;
}