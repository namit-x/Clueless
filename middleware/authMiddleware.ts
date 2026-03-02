import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type SessionPayload = {
    teamId?: string;
    teamName?: string;
    adminName?: string;
    role: "admin" | "user";
};

export interface AuthenticatedRequest extends NextRequest {
    user?: SessionPayload;
}

export function verifyToken(
    handler: (req: AuthenticatedRequest) => Promise<Response>
) {
    return async (req: NextRequest) => {
        try {
            const sessionCookie = req.cookies.get("session")?.value;
            const adminCookie = req.cookies.get("admin_session")?.value;

            const token = adminCookie || sessionCookie;

            if (!token) {
                return NextResponse.json(
                    { error: "Unauthorized: No token provided" },
                    { status: 401 }
                );
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as SessionPayload;

            const authReq = req as AuthenticatedRequest;
            authReq.user = decoded; // <-- attach decoded payload

            return handler(authReq);
        } catch (error) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid or expired token" },
                { status: 401 }
            );
        }
    };
}
