import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

type JwtPayload = {
    teamId?: string;
    role?: string;
    iat?: number;
    exp?: number;
};

export function verifyToken(req: NextRequest): JwtPayload {
    const token = req.cookies.get("session")?.value;

    if (!token) {
        console.error("[Auth][verifyToken] Missing session cookie");
        throw new Error("Unauthorized");
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        if (!decoded) {
            console.error("[Auth][verifyToken] JWT decoded payload is empty");
            throw new Error("Invalid token");
        }

        return decoded;
    } catch (error: any) {
        console.error("[Auth][verifyToken] JWT verification failed:", error.message);
        throw new Error("Invalid token");
    }
}