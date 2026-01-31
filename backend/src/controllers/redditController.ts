import { Request, Response } from 'express';
import redditService from '../services/redditService';

class RedditController {
    /**
     * Health check for Reddit integration
     */
    public async healthCheck(req: Request, res: Response): Promise<void> {
        try {
            const isAvailable = redditService.isClientAvailable();
            
            res.json({
                success: true,
                redditEnabled: isAvailable,
                message: isAvailable 
                    ? 'Reddit client is configured and ready' 
                    : 'Reddit client not configured. Please set environment variables.'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Test Reddit authentication
     * GET /api/reddit/test-auth
     */
    public async testAuth(req: Request, res: Response): Promise<void> {
        try {
            const result = await redditService.testAuthentication();
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * POST /api/reddit/post
     * Submit a post to a subreddit
     * Body: { subreddit: string, title: string, text?: string, url?: string, type: 'text' | 'link' }
     */
    public async submitPost(req: Request, res: Response): Promise<void> {
        try {
            const { subreddit, title, text, url, type = 'text' } = req.body;

            // Validation
            if (!subreddit) {
                res.status(400).json({
                    success: false,
                    error: 'Subreddit name is required'
                });
                return;
            }

            if (!title) {
                res.status(400).json({
                    success: false,
                    error: 'Post title is required'
                });
                return;
            }

            let result;
            if (type === 'link') {
                if (!url) {
                    res.status(400).json({
                        success: false,
                        error: 'URL is required for link posts'
                    });
                    return;
                }
                result = await redditService.submitLinkPost(subreddit, { title, url });
            } else {
                result = await redditService.submitTextPost(subreddit, { title, text });
            }

            res.status(201).json(result);
        } catch (error: any) {
            console.error('Error in submitPost:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to submit post'
            });
        }
    }

    /**
     * GET /api/reddit/posts/:subreddit
     * Get posts from a subreddit
     * Query params: limit (number), sort ('hot' | 'new' | 'top' | 'rising')
     */
    public async getSubredditPosts(req: Request, res: Response): Promise<void> {
        try {
            const { subreddit } = req.params;
            const { limit, sort } = req.query;

            if (!subreddit) {
                res.status(400).json({
                    success: false,
                    error: 'Subreddit name is required'
                });
                return;
            }

            const options: any = {};
            if (limit) {
                options.limit = parseInt(limit as string, 10);
            }
            if (sort) {
                options.sort = sort as 'hot' | 'new' | 'top' | 'rising';
            }

            const result = await redditService.getSubredditPosts(subreddit, options);
            console.log(result);
            res.json(result);

            
        } catch (error: any) {
            console.error('Error in getSubredditPosts:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch posts'
            });
        }
    }

    /**
     * GET /api/reddit/comments/:postId
     * Get comments from a specific post
     * Query params: limit (number)
     */
    public async getPostComments(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const { limit } = req.query;

            if (!postId) {
                res.status(400).json({
                    success: false,
                    error: 'Post ID is required'
                });
                return;
            }

            const options: any = {};
            if (limit) {
                options.limit = parseInt(limit as string, 10);
            }

            const result = await redditService.getPostComments(postId, options);
            res.json(result);
        } catch (error: any) {
            console.error('Error in getPostComments:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch comments'
            });
        }
    }

    /**
     * GET /api/reddit/inbox
     * Get inbox messages from Reddit
     * Query params: limit (number), filter (string)
     */
    public async getInbox(req: Request, res: Response): Promise<void> {
        try {
            const { limit, filter } = req.query;

            const options: any = {};
            if (limit) {
                options.limit = parseInt(limit as string, 10);
            }
            if (filter) {
                options.filter = String(filter);
            }

            const result = await redditService.getInbox(options);
            res.json(result);
        } catch (error: any) {
            console.error('Error in getInbox:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch inbox'
            });
        }
    }

    /**
     * POST /api/reddit/inbox/reply
     * Reply to a Reddit inbox item
     * Body: { thingId: string, text: string }
     */
    public async replyToInbox(req: Request, res: Response): Promise<void> {
        try {
            const { thingId, text } = req.body || {};

            if (!thingId || !text) {
                res.status(400).json({
                    success: false,
                    error: 'thingId and text are required'
                });
                return;
            }

            const result = await redditService.replyToInboxItem(thingId, text);
            res.json(result);
        } catch (error: any) {
            console.error('Error in replyToInbox:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to send reply'
            });
        }
    }

    /**
     * GET /api/reddit/subreddits/:subreddit/engagement
     * Aggregate subreddit posts into engagement timeline
     */
    public async getSubredditEngagement(req: Request, res: Response): Promise<void> {
        try {
            const { subreddit } = req.params;
            const { limit, days, sort } = req.query;

            if (!subreddit) {
                res.status(400).json({
                    success: false,
                    error: 'Subreddit name is required'
                });
                return;
            }

            const options: any = {};
            if (limit) {
                options.limit = parseInt(limit as string, 10);
            }
            if (days) {
                options.days = parseInt(days as string, 10);
            }
            if (sort) {
                options.sort = sort as 'hot' | 'new' | 'top' | 'rising';
            }

            const result = await redditService.getSubredditEngagement(subreddit, options);
            res.json(result);

        } catch (error: any) {
            console.error('Error in getSubredditEngagement:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to build engagement timeline'
            });
        }
    }
}

export default new RedditController();
