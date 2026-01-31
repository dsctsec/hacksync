import { Express, Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import conversationController from "../controllers/conversationController";
import conversationalAIController from "../controllers/conversationalAIController";
import redditController from "../controllers/redditController";
import socialMediaController from "../controllers/socialMediaController";

import canvasController from "../controllers/canvasController";
import veoController from "../controllers/veoController";
import strategistController from "../controllers/strategistController";
import chatController from "../controllers/chatController";
import nestgptController from "../controllers/nestgptController";
import marketingPlanController from "../controllers/marketingPlanController";
import antiCampaignController from "../controllers/antiCampaignController";
import adDataController from "../controllers/adDataController";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (
            file.mimetype.startsWith("image/") ||
            file.mimetype.startsWith("video/")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only image and video files are allowed"));
        }
    },
});

// CSV upload configuration for ad data
const csvUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for CSV files
    },
    fileFilter: (req, file, cb) => {
        // Accept CSV files
        if (
            file.mimetype === "text/csv" ||
            file.mimetype === "application/vnd.ms-excel" ||
            file.originalname.endsWith(".csv")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"));
        }
    },
});

const router = Router();

// Health check
router.get("/health", conversationalAIController.healthCheck);
router.get("/calls/:callSid/transcript", conversationalAIController.getCallTranscript);

// Social Media Integration endpoints
router.post("/social/post", socialMediaController.createPost);
router.get("/social/facebook/validate", socialMediaController.validateFacebookToken);
router.get("/social/facebook/page-info", socialMediaController.getFacebookPageInfo);
router.get("/social/health", socialMediaController.healthCheck);

// NEW: Conversational AI endpoints (Deepgram + Gemini)
router.post("/webhook/conversational", conversationalAIController.handleIncomingCall);
router.post("/make-call", conversationalAIController.makeCall);

// Sales pitch call endpoint (Etarra Coffee Shop)
router.post("/sales-call", conversationController.makeCall);

// Reddit API endpoints
router.get("/reddit/health", redditController.healthCheck);
router.get("/reddit/test-auth", redditController.testAuth);
router.post("/reddit/post", redditController.submitPost);
router.get("/reddit/posts/:subreddit", redditController.getSubredditPosts);
router.get("/reddit/comments/:postId", redditController.getPostComments);
router.get("/reddit/inbox", redditController.getInbox);
router.post("/reddit/inbox/reply", redditController.replyToInbox);
router.get("/reddit/subreddits/:subreddit/engagement", redditController.getSubredditEngagement);

// BRANDPULSE strategist endpoints
// router.get('/strategist/metrics', strategistController.getMetrics);
router.post("/strategist/generate", strategistController.generateStrategy);
router.post("/strategist/chat", chatController.chat);

// Dedicated NestGPT Agent chat (separate from Twilio sales flows)
router.post("/nestgpt/chat", nestgptController.chat);
router.get("/nestgpt/session/:sessionId", nestgptController.getSession);
router.delete("/nestgpt/session/:sessionId", nestgptController.resetSession);

// Legacy: Twilio webhook endpoints for voice calls (TwiML-based)
router.post("/webhook/voice", conversationController.handleIncomingCall);
router.post("/webhook/voice/gather", conversationController.handleGather);

// Legacy: Twilio webhook endpoints for outbound sales pitch
router.post("/webhook/sales-pitch", conversationController.handleSalesPitch);
router.post("/webhook/pitch/response",conversationController.handlePitchResponse);
router.post("/webhook/pitch/demo", conversationController.handleDemoRequest);

// Canvas endpoints - Structured visual canvas system for brand posters
router.post("/canvas/create", canvasController.createCanvas);
router.post("/canvas/create-with-image", upload.single("image"), canvasController.createCanvasWithImage);
router.get("/canvas/list", canvasController.listCanvases);
router.get("/canvas/:id", canvasController.getCanvas);
router.put("/canvas/:canvasId/layer/:layerId", canvasController.updateLayer);
router.post("/canvas/:canvasId/add-layer", canvasController.addLayer);
router.delete("/canvas/:canvasId/layer/:layerId", canvasController.deleteLayer);
router.post("/canvas/:canvasId/layer/:layerId/generate", canvasController.generateLayerImage);
router.post("/canvas/regenerate-layer", canvasController.regenerateLayer);
router.post("/canvas/generate-text", canvasController.generateText);
router.post("/canvas/:canvasId/generate-element", canvasController.generateElement);
router.get("/canvas/:id/export", canvasController.exportCanvas);
router.post("/canvas/import", canvasController.importCanvas);
router.delete("/canvas/:id", canvasController.deleteCanvas);

// Veo 3 video generation endpoints
router.post("/veo/tune", veoController.tunePrompt);
router.post("/veo/generate", veoController.generateVideo);

// Marketing Plans endpoints
router.post("/marketing-plans", marketingPlanController.savePlan);
router.get("/marketing-plans", marketingPlanController.getAllPlans);
router.get("/marketing-plans/:id", marketingPlanController.getPlan);
router.delete("/marketing-plans/:id", marketingPlanController.deletePlan);

// Anti-Campaign Generator endpoints
router.post("/anti-campaign/analyze", antiCampaignController.analyzeCampaign);

// Ad Data Management endpoints
router.post("/ads/upload", csvUpload.single("csv"), adDataController.uploadCSV);
router.get("/ads/report", adDataController.getReport);
router.get("/ads/data", adDataController.getAdData);
router.delete("/ads/data", adDataController.deleteAllAdData);

// Video proxy endpoint with CORS headers
router.get("/veo/video/:filename", (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const videoPath = path.resolve(process.cwd(), "public", "veo", filename);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      res.status(404).json({ error: "Video not found" });
      return;
    }
    
    // Set CORS headers
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Stream the video file
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error serving video:', error);
    res.status(500).json({ error: 'Failed to serve video' });
  }
});

export const setRoutes = (app: Express): void => {
    // Session middleware is now configured in app.ts before routes
    app.use("/api", router);

    // Root endpoint
    app.get("/", (req, res) => {
        res.json({
            message:
                "SocialNest API - Conversational AI & Social Media Platform",
            features: {
                conversational_ai: "Real-time AI Conversation",
                social_media:
                    "Multi-platform posting (Facebook, Instagram, LinkedIn)",
            },
            tech_stack: {
                speech_to_text: "Deepgram",
                ai_model: "Google Gemini",
                voice_platform: "Twilio Media Streams",
                social_media: "Reddit Integration",
                social_platforms: "Facebook Graph API (+ more coming)",
            },
            endpoints: {
                health: "GET /api/health",
                social_health: "GET /api/social/health",
                create_post: "POST /api/social/post",
                validate_facebook: "GET /api/social/facebook/validate",
                facebook_page_info: "GET /api/social/facebook/page-info",
                makeCall: 'POST /api/make-call { "to": "+1234567890" }',
                conversationalWebhook:
                    "POST /api/webhook/conversational (for Twilio)",
                mediaStream: "WS /media-stream (WebSocket for audio)",
            },
            version: "1.0.0",
        });
    });
};
