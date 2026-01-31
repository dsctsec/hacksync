import Snoowrap from 'snoowrap';
import { createRedditClient } from '../config/reddit';

interface PostData {
    title: string;
    text?: string;
    url?: string;
}

// Convert Reddit timestamps to ISO safely to avoid Invalid Date errors
const toIsoDate = (value?: number | string): string => {
    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            value = parsed;
        }
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        const ms = value > 1e12 ? value : value * 1000;
        const date = new Date(ms);
        if (!Number.isNaN(date.getTime())) {
            return date.toISOString();
        }
    }

    return new Date().toISOString();
};

class RedditService {
    private client: Snoowrap | null;

    constructor() {
        this.client = createRedditClient();
    }

    private inferInboxType(item: any): 'dm' | 'mention' | 'comment' {
        const rawType = String(item?.type || item?.subject || '').toLowerCase();

        if (
            rawType.includes('comment') ||
            rawType.includes('post') ||
            rawType.includes('submission') ||
            item?.was_comment ||
            item?.was_post ||
            item?.context ||
            item?.link_title
        ) {
            return 'comment';
        }

        if (rawType.includes('mention') || rawType.includes('username')) {
            return 'mention';
        }

        return 'dm';
    }

    private buildPermalink(item: any): string | undefined {
        const path = item?.context || item?.permalink || '';
        if (!path) return undefined;
        return path.startsWith('http') ? path : `https://reddit.com${path}`;
    }

    /**
     * Check if Reddit client is available
     */
    public isClientAvailable(): boolean {
        return this.client !== null;
    }

    /**
     * Test Reddit authentication by fetching user info
     */
    public testAuthentication(): Promise<any> {
        if (!this.client) {
            throw new Error('Reddit client not initialized. Please check your credentials.');
        }

        try {
            // Try to get the authenticated user's info
            return this.client.getMe().then((me: any) => {
                return {
                    success: true,
                    authenticated: true,
                    username: me.name,
                    linkKarma: me.link_karma,
                    commentKarma: me.comment_karma,
                    accountCreated: toIsoDate(me.created_utc)
                };
            }).catch((error: any) => {
                console.error('❌ Authentication test failed:', {
                    message: error.message,
                    statusCode: error.statusCode,
                    response: error.response?.body || error.response
                });
                return {
                    success: false,
                    authenticated: false,
                    error: error.message,
                    statusCode: error.statusCode,
                    details: error.response?.body || null
                };
            });
        } catch (error: any) {
            console.error('❌ Authentication error:', error);
            return Promise.resolve({
                success: false,
                authenticated: false,
                error: error.message
            });
        }
    }

    /**
     * Submit a text post to a subreddit
     */
    public submitTextPost(subredditName: string, postData: PostData): Promise<any> {
        if (!this.client) {
            throw new Error('Reddit client not initialized. Please check your credentials.');
        }

        try {
            if (!postData.title) {
                throw new Error('Post title is required');
            }

            console.log(`📤 Submitting text post to r/${subredditName}:`, postData.title);

            return this.client.submitSelfpost({
                subredditName: subredditName,
                title: postData.title,
                text: postData.text || ''
            }).then((submission: any) => {
                console.log(`✅ Post submitted successfully: ${submission.id}`);
                return {
                    success: true,
                    postId: submission.id,
                    postUrl: `https://reddit.com${submission.permalink}`,
                    data: {
                        id: submission.id,
                        title: submission.title,
                        url: submission.url,
                        permalink: submission.permalink,
                        author: submission.author?.name || 'unknown',
                        created: toIsoDate(submission.created_utc)
                    }
                };
            }).catch((error: any) => {
                console.error('❌ Reddit API Error:', {
                    message: error.message,
                    statusCode: error.statusCode,
                    response: error.response?.body || error.response,
                    fullError: error
                });
                const errorMsg = error.response?.body?.message || error.response?.body || error.message || 'Unknown error';
                throw new Error(`Failed to submit post: ${error.statusCode || 'Error'} - ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}`);
            });
        } catch (error: any) {
            console.error('Error submitting post to Reddit:', error);
            throw new Error(`Failed to submit post: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Submit a link post to a subreddit
     */
    public submitLinkPost(subredditName: string, postData: PostData): Promise<any> {
        if (!this.client) {
            throw new Error('Reddit client not initialized. Please check your credentials.');
        }

        try {
            if (!postData.title || !postData.url) {
                throw new Error('Post title and URL are required for link posts');
            }

            return this.client.submitLink({
                subredditName: subredditName,
                title: postData.title,
                url: postData.url
            }).then((submission: any) => {
                return {
                    success: true,
                    postId: submission.id,
                    postUrl: `https://reddit.com${submission.permalink}`,
                    data: {
                        id: submission.id,
                        title: submission.title,
                        url: submission.url,
                        permalink: submission.permalink,
                        author: submission.author?.name || 'unknown',
                        created: toIsoDate(submission.created_utc)
                    }
                };
            }).catch((error: any) => {
                console.error('Error submitting link to Reddit:', error);
                throw new Error(`Failed to submit link: ${error.message}`);
            });
        } catch (error: any) {
            console.error('Error submitting link to Reddit:', error);
            throw new Error(`Failed to submit link: ${error.message}`);
        }
    }

    /**
     * Get posts from a subreddit (hot posts by default)
     */
    public async getSubredditPosts(
        subredditName: string, 
        options: { limit?: number; sort?: 'hot' | 'new' | 'top' | 'rising' } = {}
    ): Promise<any> {
        if (!this.client) {
            throw new Error('Reddit client not initialized. Please check your credentials.');
        }

        try {
            const subreddit = this.client.getSubreddit(subredditName);
            const { limit = 25, sort = 'hot' } = options;

            let posts;
            switch (sort) {
                case 'new':
                    posts = await subreddit.getNew({ limit });
                    break;
                case 'top':
                    posts = await subreddit.getTop({ limit, time: 'day' });
                    break;
                case 'rising':
                    posts = await subreddit.getRising({ limit });
                    break;
                case 'hot':
                default:
                    posts = await subreddit.getHot({ limit });
                    break;
            }

            const formattedPosts = posts.map((post: any) => ({
                id: post.id,
                title: post.title,
                author: post.author.name,
                subreddit: post.subreddit.display_name,
                score: post.score,
                upvoteRatio: post.upvote_ratio,
                numComments: post.num_comments,
                url: post.url,
                permalink: `https://reddit.com${post.permalink}`,
                created: toIsoDate(post.created_utc),
                selftext: post.selftext || '',
                isVideo: post.is_video,
                thumbnail: post.thumbnail
            }));

            return {
                success: true,
                subreddit: subredditName,
                count: formattedPosts.length,
                sort,
                posts: formattedPosts
            };
        } catch (error: any) {
            console.error('Error fetching posts from Reddit:', error);
            throw new Error(`Failed to fetch posts: ${error.message}`);
        }
    }

    /**
     * Aggregate subreddit posts into day-level engagement buckets
     */
    public async getSubredditEngagement(
        subredditName: string,
        options: { limit?: number; days?: number; sort?: 'hot' | 'new' | 'top' | 'rising' } = {}
    ): Promise<any> {
        if (!this.client) {
            throw new Error('Reddit client not initialized. Please check your credentials.');
        }

        const { limit = 75, days = 14, sort = 'new' } = options;
        const postsResult = await this.getSubredditPosts(subredditName, { limit, sort });
        const posts = Array.isArray(postsResult.posts) ? postsResult.posts : [];

        const computeTimeline = (cutoff?: number) => {
            const bucketMap = new Map<string, {
                date: string;
                label: string;
                posts: Array<{
                    id: string;
                    title: string;
                    author: string;
                    createdAt: string;
                    permalink: string;
                    score: number;
                    numComments: number;
                }>;
            }>();

            posts.forEach((post: any) => {
                const timestamp = post.created ? new Date(post.created).getTime() : Date.now();
                if (Number.isNaN(timestamp)) {
                    return;
                }
                if (cutoff && timestamp < cutoff) {
                    return;
                }

                const date = new Date(timestamp);
                const dateIso = date.toISOString().split('T')[0];
                const label = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });

                if (!bucketMap.has(dateIso)) {
                    bucketMap.set(dateIso, {
                        date: dateIso,
                        label,
                        posts: [],
                    });
                }

                bucketMap.get(dateIso)!.posts.push({
                    id: post.id,
                    title: post.title,
                    author: post.author,
                    createdAt: post.created,
                    permalink: post.permalink,
                    score: post.score,
                    numComments: post.numComments,
                });
            });

            return Array.from(bucketMap.values()).sort((a, b) =>
                a.date.localeCompare(b.date)
            ).map(bucket => ({
                date: bucket.date,
                label: bucket.label,
                postCount: bucket.posts.length,
                posts: bucket.posts,
            }));
        };

        const cutoff = days && days > 0 ? Date.now() - days * 24 * 60 * 60 * 1000 : undefined;
        let timeline = computeTimeline(cutoff);

        // If the subreddit has been quiet recently, fall back to the raw dataset
        if (!timeline.length) {
            timeline = computeTimeline();
        }

        return {
            success: true,
            subreddit: subredditName,
            totalPosts: timeline.reduce((sum, bucket) => sum + bucket.postCount, 0),
            metadata: {
                requestedDays: days,
                effectiveDays: timeline.length ? timeline.length : 0,
                limit,
                sort,
            },
            timeline,
        };
    }

    /**
     * Get inbox messages from Reddit
     */
    public async getInbox(options: { limit?: number; filter?: string } = {}): Promise<any> {
        if (!this.client) {
            throw new Error('Reddit client not initialized. Please check your credentials.');
        }

        const { limit = 50, filter = 'inbox' } = options;
        const allowedFilters = new Set([
            'inbox',
            'unread',
            'messages',
            'comments',
            'post_replies',
            'username_mentions',
            'sent',
        ]);
        const normalizedFilter = allowedFilters.has(filter) ? filter : 'inbox';

        try {
            const inbox = await (this.client as any).getInbox({ limit, filter: normalizedFilter });
            const messages = inbox.map((item: any) => ({
                id: item?.name || item?.id,
                sourceId: item?.name || item?.id,
                type: this.inferInboxType(item),
                platform: 'reddit',
                sender: {
                    name: item?.author?.name || 'unknown',
                    username: item?.author?.name || 'unknown',
                },
                content: item?.body || item?.subject || '',
                timestamp: toIsoDate(item?.created_utc),
                status: item?.new ? 'unread' : 'read',
                postContent: item?.link_title || item?.context || undefined,
                subreddit: item?.subreddit?.display_name || item?.subreddit_name_prefixed || undefined,
                permalink: this.buildPermalink(item),
            }));

            return {
                success: true,
                count: messages.length,
                messages,
            };
        } catch (error: any) {
            console.error('Error fetching Reddit inbox:', error);
            throw new Error(`Failed to fetch inbox: ${error.message}`);
        }
    }

    /**
     * Reply to an inbox item (DM, comment, mention)
     */
    public async replyToInboxItem(thingId: string, text: string): Promise<any> {
        if (!this.client) {
            throw new Error('Reddit client not initialized. Please check your credentials.');
        }

        if (!thingId || !text) {
            throw new Error('thingId and text are required');
        }

        const normalized = thingId.trim();
        const prefix = normalized.includes('_') ? normalized.split('_')[0] : '';

        try {
            let replyResult: any;

            if (prefix === 't4') {
                replyResult = await (this.client as any).getMessage(normalized).reply(text);
            } else if (prefix === 't1') {
                replyResult = await (this.client as any).getComment(normalized).reply(text);
            } else if (prefix === 't3') {
                replyResult = await (this.client as any).getSubmission(normalized).reply(text);
            } else {
                try {
                    replyResult = await (this.client as any).getMessage(normalized).reply(text);
                } catch (inner) {
                    try {
                        replyResult = await (this.client as any).getComment(normalized).reply(text);
                    } catch {
                        replyResult = await (this.client as any).getSubmission(normalized).reply(text);
                    }
                }
            }

            return {
                success: true,
                thingId: normalized,
                replyId: replyResult?.id,
                replyFullname: replyResult?.name,
            };
        } catch (error: any) {
            console.error('Error replying to Reddit inbox item:', error);
            throw new Error(`Failed to send reply: ${error.message}`);
        }
    }

    /**
     * Get comments from a specific post
     */
    getPostComments(postId: string, options: { limit?: number } = {}): Promise<any> {
        if (!this.client) {
            throw new Error('Reddit client not initialized. Please check your credentials.');
        }

        try {
            const submission = this.client.getSubmission(postId);
            const { limit = 50 } = options;

            // Expand comment replies
            return submission.expandReplies({ limit, depth: 2 }).then((expandedSubmission: any) => {
                const comments = expandedSubmission.comments;

                const formattedComments = comments.map((comment: any) => ({
                    id: comment.id,
                    author: comment.author?.name || '[deleted]',
                    body: comment.body,
                    score: comment.score,
                    created: toIsoDate(comment.created_utc),
                    permalink: `https://reddit.com${comment.permalink}`,
                    parentId: comment.parent_id,
                    depth: comment.depth
                }));

                return {
                    success: true,
                    postId,
                    count: formattedComments.length,
                    comments: formattedComments
                };
            }).catch((error: any) => {
                console.error('Error fetching comments from Reddit:', error);
                throw new Error(`Failed to fetch comments: ${error.message}`);
            });
        } catch (error: any) {
            console.error('Error fetching comments from Reddit:', error);
            throw new Error(`Failed to fetch comments: ${error.message}`);
        }
    }
}

export default new RedditService();
