import { NextRequest, NextResponse } from "next/server";
import sessionStore from "@/lib/services/sessionStore";

export async function GET(request: NextRequest) {
    try {
        // Get session from cookie
        const sessionId = request.cookies.get("session-id")?.value;

        console.log(
            "[Twitter Status] Session ID from cookie:",
            sessionId || "NONE",
        );
        console.log(
            "[Twitter Status] All sessions:",
            sessionStore.getAllSessions().map((s) => ({
                id: s.id,
                hasTokens: !!s.twitterTokens,
                hasUser: !!s.twitterUser,
            })),
        );

        if (!sessionId) {
            // Try to find any session with Twitter tokens as fallback
            const allSessions = sessionStore.getAllSessions();
            const sessionWithTwitter = allSessions.find(
                (s) => s.twitterTokens?.accessToken,
            );

            if (sessionWithTwitter) {
                console.log(
                    "[Twitter Status] Found session with Twitter tokens:",
                    sessionWithTwitter.id,
                );
                const twitterUser = sessionWithTwitter.twitterUser;

                // Set the cookie for future requests
                const response = NextResponse.json({
                    connected: true,
                    user: twitterUser || {
                        id: "unknown",
                        username: "Twitter User",
                        name: "Twitter User",
                    },
                    message: "Twitter account connected successfully",
                    connectedAt: sessionWithTwitter.updatedAt,
                });

                response.cookies.set("session-id", sessionWithTwitter.id, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 60 * 60 * 24,
                    path: "/",
                });

                return response;
            }

            return NextResponse.json({
                connected: false,
                message: "No session found",
            });
        }

        // Get session data
        const session = sessionStore.get(sessionId);
        console.log("[Twitter Status] Session found:", !!session);

        if (!session) {
            return NextResponse.json({
                connected: false,
                message: "Session expired",
            });
        }

        // Check if Twitter tokens exist
        const twitterTokens = session.twitterTokens;
        console.log(
            "[Twitter Status] Has Twitter tokens:",
            !!twitterTokens?.accessToken,
        );

        if (!twitterTokens || !twitterTokens.accessToken) {
            return NextResponse.json({
                connected: false,
                message: "Twitter account not connected",
            });
        }

        // Use stored user info instead of calling Twitter API every time
        // This prevents rate limiting issues
        const twitterUser = session.twitterUser;

        return NextResponse.json({
            connected: true,
            user: twitterUser || {
                id: "unknown",
                username: "Twitter User",
                name: "Twitter User",
            },
            message: "Twitter account connected successfully",
            connectedAt: session.updatedAt,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                connected: false,
                error: error.message || "Failed to check Twitter status",
            },
            { status: 500 },
        );
    }
}
