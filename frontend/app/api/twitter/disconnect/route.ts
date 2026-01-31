import { NextRequest, NextResponse } from "next/server";

// Get backend URL from environment or default to localhost
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
    try {
        const backendUrl = `${BACKEND_URL}/api/twitter/disconnect`;

        // Get cookies from request to forward to backend
        const cookieHeader = request.headers.get("cookie");

        // Prepare headers for backend request
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // Add ngrok header if backend URL contains ngrok
        if (BACKEND_URL.includes("ngrok")) {
            headers["ngrok-skip-browser-warning"] = "true";
        }

        // Forward cookies if they exist
        if (cookieHeader) {
            headers["Cookie"] = cookieHeader;
        }

        // Get request body if any
        let body = null;
        try {
            const contentType = request.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                body = JSON.stringify(await request.json());
            }
        } catch (e) {
            // No body or invalid JSON, continue without body
        }

        // Make request to backend
        const response = await fetch(backendUrl, {
            method: "POST",
            headers,
            credentials: "include",
            body,
        });

        // Get response data
        const data = await response.json();

        // Create Next.js response
        const nextResponse = NextResponse.json(data, {
            status: response.status,
            statusText: response.statusText,
        });

        // Forward Set-Cookie headers from backend if any
        const setCookieHeaders = response.headers.getSetCookie();
        setCookieHeaders.forEach((cookie) => {
            nextResponse.headers.append("Set-Cookie", cookie);
        });

        return nextResponse;
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to disconnect Twitter account",
            },
            { status: 500 },
        );
    }
}
