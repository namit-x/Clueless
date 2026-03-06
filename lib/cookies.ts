import { NextResponse } from "next/server";

export function deleteSessionCookie(response: NextResponse) {
    response.cookies.set({
        name: "session",
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(0), // forces deletion
    });

    return response;
}