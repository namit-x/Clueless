import { NextResponse } from "next/server";

export function deleteSessionCookie(response: NextResponse) {
    response.cookies.set({
        name: "session",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0), // forces deletion
    });

    return response;
}