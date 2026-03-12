import { NextRequest } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import {
    registerSessionConnection,
    unregisterSessionConnection,
    SessionConnection
} from "@/lib/sessionConnections";

function createSseStream(
    sessionId: string
): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const connection: SessionConnection = {
                send: (event: string, data?: unknown) => {
                    let payload = "";
                    if (data !== undefined) {
                        payload = `data: ${JSON.stringify(data)}\n`;
                    }
                    const chunk = encoder.encode(
                        `event: ${event}\n${payload}\n`
                    );
                    controller.enqueue(chunk);
                },
                close: () => {
                    try {
                        controller.close();
                    } catch {
                        // ignore
                    }
                }
            };

            registerSessionConnection(sessionId, connection);

            // Send initial open event so the client knows the stream is alive
            connection.send("CONNECTED");
        },
        cancel() {
            unregisterSessionConnection(sessionId);
        }
    });
}

export async function GET(req: NextRequest) {
    try {
        const user = await verifyToken(req);

        if (!user.sessionId) {
            return new Response(
                JSON.stringify({ error: "SESSION_ID_MISSING_FROM_TOKEN" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const stream = createSseStream(user.sessionId);

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive"
            }
        });
    } catch (error) {
        console.error("[Auth][session/stream] Verification failed:", error);
        return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }
}

