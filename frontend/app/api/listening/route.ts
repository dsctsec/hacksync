import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY_LISTENING;

interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created: string;
  permalink: string;
  parentId: string;
  depth: number;
}

interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  permalink: string;
  created: string;
  selftext: string;
}

interface AnalyzedMention {
  id: string;
  platform: string;
  author: string;
  content: string;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: string;
  permalink: string;
  topics: string[];
  score: number;
}

interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
}

interface KeyInsight {
  category: string;
  insight: string;
  importance: "high" | "medium" | "low";
}

interface AnalysisResult {
  mentions: AnalyzedMention[];
  sentiment: SentimentAnalysis;
  keyInsights: KeyInsight[];
  topTopics: { topic: string; count: number }[];
  totalComments: number;
}

// Fetch all posts from subreddit
async function fetchSubredditPosts(subreddit: string): Promise<RedditPost[]> {
  const response = await fetch(
    `${BACKEND_URL}/reddit/posts/${subreddit}?limit=50&sort=new`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.posts || [];
}

// Fetch comments for a specific post
async function fetchPostComments(postId: string): Promise<RedditComment[]> {
  const response = await fetch(
    `${BACKEND_URL}/reddit/comments/${postId}?limit=100`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.comments || [];
}

// Analyze comments using Gemini API
async function analyzeWithGemini(comments: RedditComment[], posts: RedditPost[]): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY_LISTENING is not configured");
  }

  // Initialize the Gemini client
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // Prepare the data for analysis
  const commentsText = comments.slice(0, 50).map(c => ({
    author: c.author,
    content: c.body,
    score: c.score,
    id: c.id
  }));

  const prompt = `You are a social listening analyst. Analyze the following Reddit comments from the "ettara" subreddit (a coffee shop community).

Comments data:
${JSON.stringify(commentsText, null, 2)}

Analyze these comments and return a JSON response with the following structure:
{
  "mentions": [
    {
      "id": "comment_id",
      "author": "username",
      "content": "the comment text",
      "sentiment": "positive" | "negative" | "neutral",
      "topics": ["topic1", "topic2"],
      "score": number
    }
  ],
  "sentiment": {
    "positive": percentage (0-100),
    "neutral": percentage (0-100),
    "negative": percentage (0-100)
  },
  "keyInsights": [
    {
      "category": "Customer Feedback" | "Product Quality" | "Service" | "Ambiance" | "Pricing" | "Suggestions" | "General",
      "insight": "A key insight extracted from the comments",
      "importance": "high" | "medium" | "low"
    }
  ],
  "topTopics": [
    {
      "topic": "topic name",
      "count": number of mentions
    }
  ]
}

Focus on:
1. Sentiment analysis of each comment (positive, negative, neutral)
2. Key topics being discussed (coffee quality, service, ambiance, prices, etc.)
3. Important insights about customer feedback
4. Overall sentiment distribution

Return ONLY valid JSON, no markdown or explanation.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textContent = response.text();

    if (!textContent) {
      throw new Error("No response from Gemini API");
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanedText = textContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysisResult = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", textContent);
      throw new Error("Failed to parse analysis results");
    }

    // Map the analyzed mentions with original data
    const analyzedMentions: AnalyzedMention[] = analysisResult.mentions.map((m: any) => {
      const originalComment = comments.find(c => c.id === m.id);
      return {
        id: m.id,
        platform: "reddit",
        author: m.author || originalComment?.author || "unknown",
        content: m.content || originalComment?.body || "",
        sentiment: m.sentiment || "neutral",
        timestamp: originalComment?.created || new Date().toISOString(),
        permalink: originalComment?.permalink || "",
        topics: m.topics || [],
        score: m.score ?? originalComment?.score ?? 0,
      };
    });

    return {
      mentions: analyzedMentions,
      sentiment: analysisResult.sentiment || { positive: 33, neutral: 34, negative: 33 },
      keyInsights: analysisResult.keyInsights || [],
      topTopics: analysisResult.topTopics || [],
      totalComments: comments.length,
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(`Gemini API error: ${error.message || "Unknown error"}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const subreddit = "ettara";
    
    // Fetch all posts from the subreddit
    const posts = await fetchSubredditPosts(subreddit);
    
    // Fetch comments from all posts
    const allComments: RedditComment[] = [];
    
    for (const post of posts) {
      try {
        const comments = await fetchPostComments(post.id);
        allComments.push(...comments);
      } catch (error) {
        console.error(`Failed to fetch comments for post ${post.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      subreddit,
      posts: posts.length,
      comments: allComments,
      totalComments: allComments.length,
    });
  } catch (error: any) {
    console.error("Error fetching Reddit data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Reddit data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { comments, posts } = body;

    if (!comments || !Array.isArray(comments)) {
      return NextResponse.json(
        {
          success: false,
          error: "Comments data is required",
        },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini API key is not configured. Please set GEMINI_API_KEY_LISTENING environment variable.",
        },
        { status: 500 }
      );
    }

    // Analyze comments with Gemini
    const analysis = await analyzeWithGemini(comments, posts || []);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Error analyzing comments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze comments",
      },
      { status: 500 }
    );
  }
}
