type SessionId = string;

export interface SessionConnection {
    send: (event: string, data?: unknown) => void;
    close: () => void;
}

const connections = new Map<SessionId, SessionConnection>();

export function registerSessionConnection(
    sessionId: SessionId,
    connection: SessionConnection
): void {
    connections.set(sessionId, connection);
}

export function unregisterSessionConnection(sessionId: SessionId): void {
    connections.delete(sessionId);
}

export function sendEventToSession(
    sessionId: SessionId,
    event: string,
    data?: unknown
): void {
    const connection = connections.get(sessionId);

    if (!connection) return;

    try {
        connection.send(event, data);
    } catch (error) {
        console.error("[SessionConnections] Failed to send event:", {
            sessionId,
            event,
            error
        });
        connection.close();
        connections.delete(sessionId);
    }
}

export function broadcastForceLogout(sessionId: SessionId): void {
    sendEventToSession(sessionId, "FORCE_LOGOUT", {
        reason: "MULTIPLE_LOGIN"
    });
}

