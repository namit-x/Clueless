import { NextResponse } from "next/server";

/**
 * Clears the browser session cookie on the provided NextResponse by setting it to an empty value and forcing its expiration.
 *
 * @param response - The NextResponse instance whose cookies will be updated.
 * @returns The same `NextResponse` instance with the `session` cookie cleared (empty value and expired).
 */
export function deleteSessionCookie(response: NextResponse) {
    response.cookies.set({
        name: "session",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: new Date(0), // forces deletion
    });

    return response;
}