import { TwitterApi } from "twitter-api-v2";
import axios from "axios";

interface TwitterTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

interface TwitterPostOptions {
    text: string;
    mediaUrls?: string[];
    mediaFiles?: Buffer[];
}

class TwitterService {
    private clientId: string;
    private clientSecret: string;
    private callbackUrl: string;

    constructor() {
        this.clientId = process.env.TWITTER_CLIENT_ID!;
        this.clientSecret = process.env.TWITTER_CLIENT_SECRET!;
        this.callbackUrl =
            process.env.TWITTER_CALLBACK_URL ||
            "http://localhost:3000/api/twitter/callback";
    }

    // Generate OAuth 2.0 authorization URL
    async generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }> {
        if (!this.clientId) {
            throw new Error(
                "Twitter API instance is not initialized with client ID. You can find your client ID in Twitter Developer Portal. Please build an instance with: new TwitterApi({ clientId: '<yourClientId>' })",
            );
        }

        if (!this.clientSecret) {
            throw new Error(
                "Twitter API instance is not initialized with client secret. Please check your environment variables.",
            );
        }

        const client = new TwitterApi({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
        });

        const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
            this.callbackUrl,
            {
                scope: [
                    "tweet.read",
                    "tweet.write",
                    "users.read",
                    "offline.access",
                ],
            },
        );

        return { url, codeVerifier, state };
    }

    // Exchange authorization code for access token
    async getAccessToken(
        code: string,
        codeVerifier: string,
    ): Promise<TwitterTokens> {
        const client = new TwitterApi({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
        });

        const { accessToken, refreshToken, expiresIn } =
            await client.loginWithOAuth2({
                code,
                codeVerifier,
                redirectUri: this.callbackUrl,
            });

        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
    }

    // Create client with user's access token
    getClientForUser(accessToken: string): TwitterApi {
        return new TwitterApi(accessToken);
    }

    // Post tweet on behalf of user with enhanced media support
    async postTweet(
        accessToken: string,
        text: string,
        mediaIds?: string[],
    ): Promise<any> {
        try {
            const client = this.getClientForUser(accessToken);

            // Validate text length
            if (text.length > 280) {
                throw new Error("Tweet text exceeds 280 character limit");
            }

            const tweetOptions: any = {
                text: text.trim(),
            };

            if (mediaIds && mediaIds.length > 0) {
                tweetOptions.media = {
                    media_ids: mediaIds,
                };
            }

            const tweet = await client.v2.tweet(tweetOptions);

            return {
                success: true,
                data: tweet.data,
                message: "Tweet posted successfully!",
                tweetUrl: `https://twitter.com/i/status/${tweet.data.id}`,
            };
        } catch (error: any) {
            // Handle specific Twitter API errors
            let errorMessage = "Failed to post tweet";
            if (error.code === 429) {
                errorMessage = "Rate limit exceeded. Please try again later.";
            } else if (error.code === 401) {
                errorMessage =
                    "Twitter authentication expired. Please reconnect your account.";
            } else if (error.code === 403) {
                errorMessage =
                    "Tweet rejected by Twitter. Check content guidelines.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                error: errorMessage,
                details: error.data || error,
                code: error.code,
            };
        }
    }

    // Upload media with better error handling and support for URLs
    async uploadMedia(
        accessToken: string,
        buffer: Buffer,
        mimeType: string,
    ): Promise<string> {
        try {
            const client = this.getClientForUser(accessToken);

            // Validate file size (Twitter limit: 5MB for images, 512MB for videos)
            const maxSize = mimeType.startsWith("image/")
                ? 5 * 1024 * 1024
                : 512 * 1024 * 1024;
            if (buffer.length > maxSize) {
                throw new Error(
                    `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
                );
            }

            const mediaId = await client.v1.uploadMedia(buffer, {
                mimeType: mimeType as any,
            });

            return mediaId;
        } catch (error: any) {
            throw new Error(`Failed to upload media: ${error.message}`);
        }
    }

    // Upload media from URL
    async uploadMediaFromUrl(
        accessToken: string,
        mediaUrl: string,
    ): Promise<string> {
        try {
            // Download the media
            const response = await axios.get(mediaUrl, {
                responseType: "arraybuffer",
                timeout: 30000, // 30 second timeout
            });

            const buffer = Buffer.from(response.data);
            const mimeType = response.headers["content-type"] || "image/jpeg";

            return await this.uploadMedia(accessToken, buffer, mimeType);
        } catch (error: any) {
            throw new Error(
                `Failed to upload media from URL: ${error.message}`,
            );
        }
    }

    // Enhanced post tweet with media URL support
    async postTweetWithMedia(
        accessToken: string,
        text: string,
        mediaUrls?: string[],
    ): Promise<any> {
        try {
            let mediaIds: string[] = [];

            if (mediaUrls && mediaUrls.length > 0) {
                for (const url of mediaUrls) {
                    try {
                        const mediaId = await this.uploadMediaFromUrl(
                            accessToken,
                            url,
                        );
                        mediaIds.push(mediaId);
                    } catch (error: any) {
                        // Continue with other media files, don't fail entire post
                    }
                }
            }

            return await this.postTweet(accessToken, text, mediaIds);
        } catch (error: any) {
            throw error;
        }
    }

    // Get user info
    async getUserInfo(accessToken: string): Promise<any> {
        try {
            const client = this.getClientForUser(accessToken);
            const user = await client.v2.me();
            return user.data;
        } catch (error: any) {
            throw error;
        }
    }
}

export default new TwitterService();
