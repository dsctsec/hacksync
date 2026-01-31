import axios from 'axios';

interface FacebookPhotoPostRequest {
    url: string;
    caption?: string;
    pageId?: string;
}

interface FacebookPhotoPostResponse {
    id: string;
    post_id: string;
}

class FacebookService {
    private accessToken: string;
    private defaultPageId: string;
    private apiVersion: string = 'v24.0';
    private baseUrl: string;

    constructor() {
        this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
        this.defaultPageId = process.env.FACEBOOK_PAGE_ID || '';
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

        if (!this.accessToken) {
            console.warn('⚠️  FACEBOOK_ACCESS_TOKEN is not set in environment variables');
        }
        if (!this.defaultPageId) {
            console.warn('⚠️  FACEBOOK_PAGE_ID is not set in environment variables');
        }
    }

    /**
     * Post a photo to Facebook page
     * @param photoData - Contains photo URL and optional caption
     * @returns Facebook post response with post ID
     */
    async postPhoto(photoData: FacebookPhotoPostRequest): Promise<FacebookPhotoPostResponse> {
        const pageId = photoData.pageId || this.defaultPageId;

        if (!pageId) {
            throw new Error('Facebook Page ID is required');
        }

        if (!this.accessToken) {
            throw new Error('Facebook Access Token is not configured');
        }

        const url = `${this.baseUrl}/${pageId}/photos`;

        try {
            const params = new URLSearchParams({
                url: photoData.url,
                access_token: this.accessToken
            });

            if (photoData.caption) {
                params.append('caption', photoData.caption);
            }

            const response = await axios.post(url, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('✅ Successfully posted photo to Facebook:', response.data);
            return response.data as FacebookPhotoPostResponse;
        } catch (error: any) {
            console.error('❌ Error posting photo to Facebook:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error?.message || 
                'Failed to post photo to Facebook'
            );
        }
    }

    /**
     * Post text-only status update to Facebook page
     * @param message - The text message to post
     * @param pageId - Optional page ID (uses default if not provided)
     * @returns Facebook post response
     */
    async postText(message: string, pageId?: string): Promise<any> {
        const targetPageId = pageId || this.defaultPageId;

        if (!targetPageId) {
            throw new Error('Facebook Page ID is required');
        }

        if (!this.accessToken) {
            throw new Error('Facebook Access Token is not configured');
        }

        const url = `${this.baseUrl}/${targetPageId}/feed`;

        try {
            const params = new URLSearchParams({
                message: message,
                access_token: this.accessToken
            });

            const response = await axios.post(url, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('✅ Successfully posted text to Facebook:', response.data);
            return response.data as any;
        } catch (error: any) {
            console.error('❌ Error posting text to Facebook:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error?.message || 
                'Failed to post text to Facebook'
            );
        }
    }

    /**
     * Validate if the access token is valid
     * @returns Boolean indicating token validity
     */
    async validateAccessToken(): Promise<boolean> {
        if (!this.accessToken) {
            return false;
        }

        try {
            const url = `${this.baseUrl}/me?access_token=${this.accessToken}`;
            await axios.get(url);
            return true;
        } catch (error) {
            console.error('❌ Invalid Facebook Access Token');
            return false;
        }
    }

    /**
     * Get page information
     * @param pageId - Optional page ID
     * @returns Page information
     */
    async getPageInfo(pageId?: string): Promise<any> {
        const targetPageId = pageId || this.defaultPageId;

        if (!targetPageId) {
            throw new Error('Facebook Page ID is required');
        }

        try {
            const url = `${this.baseUrl}/${targetPageId}?fields=id,name,fan_count,access_token&access_token=${this.accessToken}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error fetching page info:', error.response?.data || error.message);
            throw new Error('Failed to fetch Facebook page information');
        }
    }
}

export default new FacebookService();
