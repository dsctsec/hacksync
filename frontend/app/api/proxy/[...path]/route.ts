import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://b0x456pd-3000.inc1.devtunnels.ms";

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } },
) {
    return handleRequest(request, params, "GET");
}

export async function POST(
    request: NextRequest,
    { params }: { params: { path: string[] } },
) {
    return handleRequest(request, params, "POST");
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { path: string[] } },
) {
    return handleRequest(request, params, "PUT");
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { path: string[] } },
) {
    return handleRequest(request, params, "DELETE");
}

async function handleRequest(
    request: NextRequest,
    params: { path: string[] },
    method: string,
) {
    try {
        const derivedPath = request.nextUrl.pathname.replace(
            /^\/api\/proxy\/?/,
            "",
        );
        const path = params?.path?.join("/") || derivedPath;
        if (!path) {
            return NextResponse.json(
                { success: false, error: "Missing proxy path" },
                { status: 400 },
            );
        }
        const searchParams = request.nextUrl.searchParams.toString();
        const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ""}`;

        // Get cookies from request
        const cookieHeader = request.headers.get("cookie");

        // Prepare headers
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        };

        // Forward cookies if they exist
        if (cookieHeader) {
            headers["Cookie"] = cookieHeader;
        }

        // Prepare request options
        const options: RequestInit = {
            method,
            headers,
            credentials: "include",
        };

        // Add body for POST/PUT requests
        if (method === "POST" || method === "PUT") {
            const contentType = request.headers.get("content-type");

            if (contentType?.includes("application/json")) {
                const body = await request.json();
                options.body = JSON.stringify(body);
            } else if (contentType?.includes("multipart/form-data")) {
                const formData = await request.formData();
                options.body = formData as any;
                delete (headers as any)["Content-Type"]; // Let browser set it
            } else {
                const body = await request.text();
                options.body = body;
            }
        }

        // Make the request to backend
        const response = await fetch(url, options);

        // Get response data
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType?.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Create response
        const nextResponse = NextResponse.json(data, {
            status: response.status,
            statusText: response.statusText,
        });

        // Forward Set-Cookie headers from backend
        const setCookieHeaders = response.headers.getSetCookie();
        setCookieHeaders.forEach((cookie) => {
            nextResponse.headers.append("Set-Cookie", cookie);
        });

        // Copy other important headers
        const headersToForward = ["content-type", "cache-control", "etag"];
        headersToForward.forEach((header) => {
            const value = response.headers.get(header);
            if (value) {
                nextResponse.headers.set(header, value);
            }
        });

        return nextResponse;
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Proxy request failed",
            },
            { status: 500 },
        );
    }
}
