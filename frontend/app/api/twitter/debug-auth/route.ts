import { NextRequest, NextResponse } from "next/server";
import twitterService from "@/lib/services/twitterService";

export async function GET(request: NextRequest) {
    try {
        console.log("=== TWITTER DEBUG AUTH ===");

        // Generate Twitter OAuth URL with PKCE
        const { url, codeVerifier, state } = await twitterService.generateAuthUrl();

        return NextResponse.json({
            success: true,
            debug: {
                generatedUrl: url,
                state: state,
                hasCodeVerifier: !!codeVerifier,
                codeVerifierLength: codeVerifier?.length || 0,
                urlComponents: {
                    baseUrl: url.split('?')[0],
                    params: Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
                },
                environment: {
                    clientId: process.env.TWITTER_CLIENT_ID ? "SET" : "MISSING",
                    clientSecret: process.env.TWITTER_CLIENT_SECRET ? "SET" : "MISSING",
                    callbackUrl: process.env.TWITTER_CALLBACK_URL
                }
            },
            instructions: {
                message: "This endpoint shows the OAuth URL that would be generated for Twitter authentication",
                nextStep: "Click the generated URL to test the OAuth flow manually",
                troubleshooting: "Check the URL parameters and compare with your Twitter App settings"
            }
        });

    } catch (error: any) {
        console.error("[Twitter Debug Auth] Error:", error);

        return NextResponse.json({
            success: false,
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            debug: {
                environment: {
                    clientId: process.env.TWITTER_CLIENT_ID ? "SET" : "MISSING",
                    clientSecret: process.env.TWITTER_CLIENT_SECRET ? "SET" : "MISSING",
                    callbackUrl: process.env.TWITTER_CALLBACK_URL
                }
            }
        }, { status: 500 });
    }
}
