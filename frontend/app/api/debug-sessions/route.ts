import { NextRequest, NextResponse } from "next/server";
import sessionStore from "@/lib/services/sessionStore";

export async function GET(request: NextRequest) {
    try {
        const sessionId = request.cookies.get("session-id")?.value;

        const debugInfo = {
            request: {
                sessionIdFromCookie: sessionId || null,
                cookieString: request.cookies.toString(),
                userAgent: request.headers.get("user-agent"),
                timestamp: new Date().toISOString()
            },
            sessionStore: sessionStore.debugSessions(),
            specificSession: sessionId ? {
                exists: !!sessionStore.get(sessionId),
                hasOAuthState: !!sessionStore.getOAuthState(sessionId),
                hasTwitterTokens: !!sessionStore.getTwitterTokens(sessionId),
                oauthState: sessionStore.getOAuthState(sessionId)
            } : null
        };

        return NextResponse.json({
            success: true,
            debug: debugInfo,
            summary: {
                totalActiveSessions: debugInfo.sessionStore.totalSessions,
                requestHasSessionCookie: !!sessionId,
                requestSessionExists: sessionId ? !!sessionStore.get(sessionId) : false,
                message: "Session store debug information"
            }
        });

    } catch (error: any) {
        console.error("[Debug Sessions] Error:", error);

        return NextResponse.json({
            success: false,
            error: {
                message: error.message,
                stack: error.stack
            }
        }, { status: 500 });
    }
}
