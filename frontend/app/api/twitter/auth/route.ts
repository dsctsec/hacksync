import { NextRequest, NextResponse } from "next/server";
import twitterService from "@/lib/services/twitterService";
import sessionStore from "@/lib/services/sessionStore";

export async function GET(request: NextRequest) {
    try {
        // Get or create session ID from cookies
        let sessionId = request.cookies.get("session-id")?.value;
        let isNewSession = false;

        if (!sessionId) {
            const newSession = sessionStore.getOrCreate();
            sessionId = newSession.id;
            isNewSession = true;
        } else {
            // Ensure session exists in store, create if not
            sessionStore.getOrCreateForced(sessionId);
        }

        // Generate Twitter OAuth URL with PKCE
        const { url, codeVerifier, state } =
            await twitterService.generateAuthUrl();

        // Get returnTo from search params
        const returnTo = request.nextUrl.searchParams.get("returnTo");
        console.log("[Twitter Auth] Return to:", returnTo);

        // Store OAuth state in session
        sessionStore.setOAuthState(sessionId, {
            state,
            codeVerifier,
            provider: "twitter",
            createdAt: Date.now(),
            returnTo: returnTo || undefined,
        });

        // Verify the state was stored correctly
        const storedState = sessionStore.getOAuthState(sessionId);

        // Create response with redirect to Twitter
        const response = NextResponse.redirect(url);

        // Always set/update session cookie for OAuth flows

        response.cookies.set("session-id", sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;
    } catch (error: any) {
        // Redirect to error page with details
        const errorUrl = new URL("/twitter-error", request.url);
        errorUrl.searchParams.set("error", "auth_generation_failed");
        errorUrl.searchParams.set(
            "message",
            error.message || "Failed to generate Twitter authorization URL",
        );

        return NextResponse.redirect(errorUrl.toString());
    }
}
