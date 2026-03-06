import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export function verifyToken(req: NextRequest) {
    const token = req.cookies.get("session")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded;
    } catch {
        throw new Error("Invalid token");
    }
}