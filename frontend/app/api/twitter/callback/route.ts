import { NextRequest, NextResponse } from "next/server";
import twitterService from "@/lib/services/twitterService";
import sessionStore from "@/lib/services/sessionStore";

export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl;
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        // Check for OAuth errors
        if (error) {
            const baseUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL || request.nextUrl.origin;
            const errorUrl = new URL("/twitter-error", baseUrl);
            errorUrl.searchParams.set("error", "oauth_error");
            errorUrl.searchParams.set(
                "message",
                `Twitter OAuth error: ${error}`,
            );
            return NextResponse.redirect(errorUrl.toString());
        }

        // Validate required parameters
        if (!code || !state) {
            const baseUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL || request.nextUrl.origin;
            const errorUrl = new URL("/twitter-error", baseUrl);
            errorUrl.searchParams.set("error", "invalid_callback");
            errorUrl.searchParams.set(
                "message",
                "Missing authorization code or state parameter",
            );
            return NextResponse.redirect(errorUrl.toString());
        }

        // Try to get session from cookie first
        let sessionId = request.cookies.get("session-id")?.value;
        let oauthState: any = null;

        // If we have a session ID from cookie, try to get the OAuth state
        if (sessionId) {
            oauthState = sessionStore.getOAuthState(sessionId);
        }

        // If no OAuth state found via cookie, try to find session by state parameter
        // This handles cases where cookies aren't sent due to cross-origin redirects (ngrok, etc.)
        if (!oauthState) {
            const session = sessionStore.findSessionByOAuthState(state);
            if (session) {
                sessionId = session.id;
                oauthState = session.oauthState;
            }
        }

        // If still no session found, return error
        if (!sessionId || !oauthState) {
            const baseUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL || request.nextUrl.origin;
            const errorUrl = new URL("/twitter-error", baseUrl);
            errorUrl.searchParams.set("error", "invalid_state");
            errorUrl.searchParams.set(
                "message",
                "OAuth state not found. Please try connecting again.",
            );
            return NextResponse.redirect(errorUrl.toString());
        }

        // Validate state parameter (should match if we found by state, but double-check)
        if (oauthState.state !== state) {
            const baseUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL || request.nextUrl.origin;
            const errorUrl = new URL("/twitter-error", baseUrl);
            errorUrl.searchParams.set("error", "state_mismatch");
            errorUrl.searchParams.set(
                "message",
                "Invalid OAuth state. Possible security issue.",
            );
            return NextResponse.redirect(errorUrl.toString());
        }

        // Check if OAuth state is expired (10 minutes)
        const stateAge = Date.now() - oauthState.createdAt;
        if (stateAge > 10 * 60 * 1000) {
            const baseUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL || request.nextUrl.origin;
            const errorUrl = new URL("/twitter-error", baseUrl);
            errorUrl.searchParams.set("error", "state_expired");
            errorUrl.searchParams.set(
                "message",
                "OAuth session expired. Please try connecting again.",
            );
            return NextResponse.redirect(errorUrl.toString());
        }

        // Exchange code for access token
        const tokens = await twitterService.getAccessToken(
            code,
            oauthState.codeVerifier,
        );

        // Store tokens in session
        sessionStore.setTwitterTokens(sessionId, tokens);

        // Try to get user info, but don't fail if rate limited
        let userInfo: any = null;
        let username = "connected";

        try {
            userInfo = await twitterService.getUserInfo(tokens.accessToken);
            username = userInfo.username;

            // Store user info in session
            sessionStore.setTwitterUser(sessionId, {
                id: userInfo.id,
                username: userInfo.username,
                name: userInfo.name,
            });
        } catch (userInfoError: any) {
            // If rate limited (429) or forbidden (403), still consider auth successful
            // User info can be fetched later when rate limit resets
            if (userInfoError.code === 429 || userInfoError.code === 403) {
                // Store placeholder user info
                sessionStore.setTwitterUser(sessionId, {
                    id: "pending",
                    username: "Twitter User",
                    name: "Twitter User",
                });
            } else {
                // For other errors, rethrow
                throw userInfoError;
            }
        }

        // Clear OAuth state as it's no longer needed
        sessionStore.clearOAuthState(sessionId);

        // Redirect to success page
        const baseUrl =
            process.env.NEXT_PUBLIC_FRONTEND_URL || request.nextUrl.origin;
        
        // Handle returnTo if present (e.g. from onboarding)
        let successUrl;
        if (oauthState.returnTo) {
            successUrl = new URL(oauthState.returnTo, baseUrl);
            successUrl.searchParams.set("twitter_connected", "true");
        } else {
            successUrl = new URL("/twitter-connected", baseUrl);
        }
        
        successUrl.searchParams.set("success", "true");
        successUrl.searchParams.set("username", username);

        // Set the session cookie in the response to ensure it's available for future requests
        const response = NextResponse.redirect(successUrl.toString());
        response.cookies.set("session-id", sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;
    } catch (error: any) {
        // Redirect to error page with generic message
        const baseUrl =
            process.env.NEXT_PUBLIC_FRONTEND_URL || request.nextUrl.origin;
        const errorUrl = new URL("/twitter-error", baseUrl);
        errorUrl.searchParams.set("error", "callback_processing_failed");
        errorUrl.searchParams.set(
            "message",
            error.message ||
                "Failed to process Twitter authentication. Please try again.",
        );

        return NextResponse.redirect(errorUrl.toString());
    }
}
