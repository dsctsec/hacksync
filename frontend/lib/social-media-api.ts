// API configuration
import {
    API_ENDPOINTS,
    API_FETCH_OPTIONS,
    API_FETCH_OPTIONS_FORM,
} from "./api-config";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface PostData {
    platform: string;
    content: {
        caption?: string;
        mediaUrl?: string;
        message?: string;
    };
    pageId?: string;
}

export interface PostResponse {
    success: boolean;
    platform?: string;
    data?: any;
    message?: string;
    error?: string;
}

export interface HealthCheckResponse {
    success: boolean;
    integrations: {
        [key: string]: {
            configured: boolean;
            status: string;
        };
    };
}

export interface FacebookPageInfo {
    success: boolean;
    data?: {
        id: string;
        name: string;
        fan_count: number;
    };
    error?: string;
}

class SocialMediaAPI {
    /**
     * Create a post on a social media platform
     */
    async createPost(postData: PostData): Promise<PostResponse> {
        try {
            const response = await fetch(API_ENDPOINTS.social.post, {
                method: "POST",
                ...API_FETCH_OPTIONS,
                body: JSON.stringify(postData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create post");
            }

            return data;
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Check health status of social media integrations
     */
    async checkHealth(): Promise<HealthCheckResponse> {
        try {
            const response = await fetch(
                API_ENDPOINTS.social.health,
                API_FETCH_OPTIONS,
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error("Failed to check health status");
            }

            return data;
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Validate Facebook access token
     */
    async validateFacebookToken(): Promise<{
        success: boolean;
        valid: boolean;
        message: string;
    }> {
        try {
            const response = await fetch(
                API_ENDPOINTS.social.facebook.validate,
                API_FETCH_OPTIONS,
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error("Failed to validate token");
            }

            return data;
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Get Facebook page information
     */
    async getFacebookPageInfo(pageId?: string): Promise<FacebookPageInfo> {
        try {
            const url = pageId
                ? `${API_ENDPOINTS.social.facebook.pageInfo}?pageId=${pageId}`
                : API_ENDPOINTS.social.facebook.pageInfo;

            const response = await fetch(url, API_FETCH_OPTIONS);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get page info");
            }

            return data;
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Post to Facebook specifically
     */
    async postToFacebook(
        caption: string,
        mediaUrl?: string,
    ): Promise<PostResponse> {
        return this.createPost({
            platform: "facebook",
            content: {
                caption,
                mediaUrl,
            },
        });
    }

    /**
     * Post to Twitter directly
     */
    async postToTwitter(
        text: string,
        mediaUrls?: string[],
    ): Promise<PostResponse> {
        try {
            const formData = new FormData();
            formData.append("text", text);

            // Add media URLs to form data for backend to download and upload
            if (mediaUrls && mediaUrls.length > 0) {
                formData.append("mediaUrls", JSON.stringify(mediaUrls));
            }

            const response = await fetch(API_ENDPOINTS.twitter.post, {
                method: "POST",
                ...API_FETCH_OPTIONS_FORM,
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to post to Twitter");
            }

            return {
                success: true,
                platform: "Twitter/X",
                data: data,
            };
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Check Twitter connection status
     */
    async checkTwitterStatus(): Promise<{
        connected: boolean;
        username?: string;
    }> {
        try {
            const response = await fetch(
                API_ENDPOINTS.twitter.status,
                API_FETCH_OPTIONS,
            );
            const data = await response.json();
            return data;
        } catch (error: any) {
            return { connected: false };
        }
    }

    /**
     * Post to Reddit
     */
    async postToReddit(redditData: {
        title: string;
        text?: string;
        url?: string;
        type: "text" | "link";
    }): Promise<PostResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/reddit/post`, {
                method: "POST",
                ...API_FETCH_OPTIONS,
                body: JSON.stringify({
                    subreddit: "Ettara",
                    title: redditData.title,
                    text: redditData.text,
                    url: redditData.url,
                    type: redditData.type,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to post to Reddit");
            }

            return {
                success: true,
                platform: "reddit",
                data: data,
            };
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Post to multiple platforms with enhanced Twitter support
     */
    async postToMultiplePlatforms(
        platforms: string[],
        captions: Record<string, string>,
        mediaUrls?: Record<string, string>,
    ): Promise<
        {
            platform: string;
            result: PostResponse;
            success: boolean;
            error?: string;
        }[]
    > {
        const results = await Promise.allSettled(
            platforms.map(async (platform) => {
                const caption = captions[platform];
                const mediaUrl = mediaUrls?.[platform];

                // Use direct Twitter API for Twitter posts
                if (platform === "twitter") {
                    const result = await this.postToTwitter(
                        caption,
                        mediaUrl ? [mediaUrl] : undefined,
                    );
                    return { platform, result, success: true };
                }

                // Use generic social media API for other platforms
                const result = await this.createPost({
                    platform,
                    content: {
                        caption,
                        mediaUrl,
                    },
                });

                return { platform, result, success: true };
            }),
        );

        return results.map((r) => {
            if (r.status === "fulfilled") {
                return r.value;
            } else {
                return {
                    platform: "unknown",
                    result: { success: false, error: r.reason.message },
                    success: false,
                    error: r.reason.message,
                };
            }
        });
    }
}

export default new SocialMediaAPI();
