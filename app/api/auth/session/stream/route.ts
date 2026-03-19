import { NextRequest } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import {
    registerSessionConnection,
    unregisterSessionConnection,
    SessionConnection
} from "@/lib/sessionConnections";

function createSseStream(sessionId: string): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            console.log("[SSE] Registering session:", sessionId);

            const connection: SessionConnection = {
                send: (event: string, data?: unknown) => {
                    let payload = "";

                    if (data !== undefined) {
                        payload = `data: ${JSON.stringify(data)}\n`;
                    }

                    // ✅ IMPORTANT: double newline required for SSE
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

            // ✅ Register connection with sessionId
            registerSessionConnection(sessionId, connection);

            // ✅ Initial handshake
            connection.send("CONNECTED");

            // ✅ Heartbeat (prevents connection drop)
            const interval = setInterval(() => {
                try {
                    connection.send("PING");
                } catch {
                    clearInterval(interval);
                    unregisterSessionConnection(sessionId);
                }
            }, 15000);

            // Cleanup when stream closes
            const cleanup = () => {
                console.log("[SSE] Cleaning up session:", sessionId);
                clearInterval(interval);
                unregisterSessionConnection(sessionId);
            };

            // If client disconnects
            controller.signal?.addEventListener("abort", cleanup);
        },

        cancel() {
            console.log("[SSE] Cancelled session:", sessionId);
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
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        console.log("[SSE] Incoming connection for session:", user.sessionId);

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
            {
                status: 401,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}