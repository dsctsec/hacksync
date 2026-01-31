import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID ? "SET" : "MISSING",
            TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET ? "SET" : "MISSING",
            TWITTER_CALLBACK_URL: process.env.TWITTER_CALLBACK_URL,
            NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        },
        debug: {
            timestamp: new Date().toISOString(),
            message: "Environment variables debug endpoint"
        }
    });
}
