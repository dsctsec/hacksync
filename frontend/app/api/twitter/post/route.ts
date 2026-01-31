import { NextRequest, NextResponse } from "next/server";
import twitterService from "@/lib/services/twitterService";
import sessionStore from "@/lib/services/sessionStore";

export async function POST(request: NextRequest) {
    try {
        // Get session from cookie
        const sessionId = request.cookies.get("session-id")?.value;
        if (!sessionId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No session found. Please connect your Twitter account first.",
                },
                { status: 401 },
            );
        }

        // Get session data
        const session = sessionStore.get(sessionId);
        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Session expired. Please reconnect your Twitter account.",
                },
                { status: 401 },
            );
        }

        // Check if Twitter tokens exist
        const twitterTokens = session.twitterTokens;
        if (!twitterTokens || !twitterTokens.accessToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Twitter account not connected. Please connect your account first.",
                },
                { status: 401 },
            );
        }

        // Parse request body
        let body: any;
        let mediaFiles: File[] = [];

        const contentType = request.headers.get("content-type");

        if (contentType?.includes("multipart/form-data")) {
            // Handle form data with potential media uploads
            const formData = await request.formData();

            const text = formData.get("text") as string;
            if (!text) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Tweet text is required",
                    },
                    { status: 400 },
                );
            }

            body = { text: text.trim() };

            // Extract media files
            const files = formData.getAll("media");
            for (const file of files) {
                if (file instanceof File) {
                    mediaFiles.push(file);
                }
            }

            // Extract media URLs if provided
            const mediaUrls = formData.get("mediaUrls");
            if (mediaUrls && typeof mediaUrls === "string") {
                try {
                    body.mediaUrls = JSON.parse(mediaUrls);
                } catch (e) {
                    // Failed to parse mediaUrls
                }
            }
        } else {
            // Handle JSON request
            body = await request.json();
        }

        // Validate request body
        if (!body.text || typeof body.text !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tweet text is required and must be a string",
                },
                { status: 400 },
            );
        }

        const tweetText = body.text.trim();
        if (tweetText.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tweet text cannot be empty",
                },
                { status: 400 },
            );
        }

        if (tweetText.length > 280) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tweet text exceeds 280 character limit",
                },
                { status: 400 },
            );
        }

        let mediaIds: string[] = [];

        try {
            // Upload media files if any
            if (mediaFiles.length > 0) {
                for (const file of mediaFiles) {
                    if (file.size > 5 * 1024 * 1024) {
                        // 5MB limit for images - skip large files
                        continue;
                    }

                    try {
                        const buffer = Buffer.from(await file.arrayBuffer());
                        const mediaId = await twitterService.uploadMedia(
                            twitterTokens.accessToken,
                            buffer,
                            file.type,
                        );
                        mediaIds.push(mediaId);
                    } catch (uploadError: any) {
                        // Continue with other files, don't fail entire post
                    }
                }
            }

            // Upload media from URLs if any
            if (body.mediaUrls && Array.isArray(body.mediaUrls)) {
                for (const url of body.mediaUrls) {
                    try {
                        const mediaId = await twitterService.uploadMediaFromUrl(
                            twitterTokens.accessToken,
                            url,
                        );
                        mediaIds.push(mediaId);
                    } catch (uploadError: any) {
                        // Continue with other media, don't fail entire post
                    }
                }
            }

            // Post the tweet
            const result = await twitterService.postTweet(
                twitterTokens.accessToken,
                tweetText,
                mediaIds.length > 0 ? mediaIds : undefined,
            );

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    data: {
                        id: result.data?.id,
                        text: result.data?.text,
                        url: result.tweetUrl,
                        mediaCount: mediaIds.length,
                    },
                    message: result.message,
                });
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error: result.error,
                        code: result.code,
                    },
                    { status: result.code === 401 ? 401 : 400 },
                );
            }
        } catch (mediaError: any) {
            // Try to post tweet without media if media processing fails
            try {
                const result = await twitterService.postTweet(
                    twitterTokens.accessToken,
                    tweetText,
                );

                if (result.success) {
                    return NextResponse.json({
                        success: true,
                        data: {
                            id: result.data?.id,
                            text: result.data?.text,
                            url: result.tweetUrl,
                            mediaCount: 0,
                        },
                        message: `${result.message} (Media upload failed but text was posted)`,
                        warning: `Media upload failed: ${mediaError.message}`,
                    });
                } else {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Both media upload and tweet posting failed: ${result.error}`,
                        },
                        { status: 400 },
                    );
                }
            } catch (tweetError: any) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Media upload failed and tweet posting also failed: ${tweetError.message}`,
                    },
                    { status: 400 },
                );
            }
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to post tweet",
            },
            { status: 500 },
        );
    }
}
