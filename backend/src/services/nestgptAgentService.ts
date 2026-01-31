import { GoogleGenerativeAI } from "@google/generative-ai";
import sessionStore, { Session } from "./sessionStore";
import canvasService from "./canvasService";
import { v4 as uuidv4 } from "uuid";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Agent tools configuration - using raw objects that we'll type-cast
const agentToolsConfig = {
    functionDeclarations: [
        {
            name: "ask_question",
            description:
                "Ask the user a question to gather more information about their campaign. Use this when you need specific details like brand name, target audience, campaign goals, budget, channels, etc.",
            parameters: {
                type: "OBJECT",
                properties: {
                    question: {
                        type: "STRING",
                        description: "The question to ask the user",
                    },
                    category: {
                        type: "STRING",
                        enum: [
                            "brand_info",
                            "campaign_goal",
                            "target_audience",
                            "budget",
                            "channels",
                            "timeline",
                            "tone",
                            "content_type",
                        ],
                        description:
                            "The category of information being collected",
                    },
                },
                required: ["question", "category"],
            },
        },
        {
            name: "analyze_analytics",
            description:
                "Analyze current social media analytics data to inform campaign strategy. Returns engagement metrics, best performing content, and audience insights.",
            parameters: {
                type: "OBJECT",
                properties: {
                    platforms: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "Platforms to analyze",
                    },
                    timeframe: {
                        type: "STRING",
                        enum: ["7d", "14d", "30d"],
                        description: "Timeframe for analytics",
                    },
                },
                required: ["platforms"],
            },
        },
        {
            name: "generate_campaign_image",
            description:
                "Generate a campaign image on the canvas. Use this when you have enough information to create visual content for the campaign.",
            parameters: {
                type: "OBJECT",
                properties: {
                    imagePrompt: {
                        type: "STRING",
                        description: "Detailed prompt for the image generation",
                    },
                    canvasName: {
                        type: "STRING",
                        description: "Name for the canvas",
                    },
                    aspectRatio: {
                        type: "STRING",
                        enum: ["1:1", "16:9", "9:16"],
                        description: "Aspect ratio for the image",
                    },
                    brandName: {
                        type: "STRING",
                        description: "Brand name for context",
                    },
                },
                required: ["imagePrompt", "canvasName"],
            },
        },
        {
            name: "create_marketing_plan",
            description:
                "Create a comprehensive marketing plan based on collected information. Use this after gathering sufficient details about the campaign.",
            parameters: {
                type: "OBJECT",
                properties: {
                    campaignName: {
                        type: "STRING",
                        description: "Name of the campaign",
                    },
                    goals: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "Campaign goals",
                    },
                    targetAudience: {
                        type: "STRING",
                        description: "Target audience description",
                    },
                    channels: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "Social media channels to use",
                    },
                    budget: {
                        type: "STRING",
                        description: "Budget level or amount",
                    },
                    duration: {
                        type: "STRING",
                        description: "Campaign duration",
                    },
                    tone: {
                        type: "STRING",
                        description: "Brand voice and tone",
                    },
                },
                required: ["campaignName", "goals", "channels"],
            },
        },
        {
            name: "generate_content_calendar",
            description:
                "Generate a content calendar with specific posts for each day of the campaign.",
            parameters: {
                type: "OBJECT",
                properties: {
                    startDate: {
                        type: "STRING",
                        description: "Campaign start date (YYYY-MM-DD)",
                    },
                    durationWeeks: {
                        type: "NUMBER",
                        description: "Duration in weeks",
                    },
                    channels: { type: "ARRAY", items: { type: "STRING" } },
                    campaignTheme: {
                        type: "STRING",
                        description: "Overall campaign theme",
                    },
                },
                required: ["durationWeeks", "channels", "campaignTheme"],
            },
        },
        {
            name: "save_campaign",
            description: "Save the completed campaign plan to the system.",
            parameters: {
                type: "OBJECT",
                properties: {
                    campaignData: {
                        type: "OBJECT",
                        description: "Complete campaign data to save",
                    },
                },
                required: ["campaignData"],
            },
        },
    ],
};

// Mock analytics data (in real app, fetch from actual sources)
const getAnalyticsData = async (
    platforms: string[],
    timeframe: string = "14d",
) => {
    return {
        summary: {
            totalEngagement: 45230,
            totalReach: 156000,
            avgEngagementRate: "3.2%",
            followerGrowth: "+2.1%",
        },
        platformBreakdown: {
            instagram: {
                followers: 12500,
                avgLikes: 450,
                avgComments: 32,
                topContentType: "carousel",
                bestPostingTime: "11am-1pm",
            },
            linkedin: {
                followers: 5600,
                avgLikes: 120,
                avgComments: 28,
                topContentType: "articles",
                bestPostingTime: "8am-10am",
            },
        },
        audienceInsights: {
            ageGroups: {
                "18-24": "25%",
                "25-34": "35%",
                "35-44": "22%",
                "45+": "18%",
            },
            topLocations: ["United States", "India", "UK", "Canada"],
            interests: [
                "Technology",
                "Business",
                "Marketing",
                "Entrepreneurship",
            ],
        },
        recommendations: [
            "Increase video content - 40% higher engagement",
            "Post consistently at peak times",
            "Engage with comments within first hour",
            "Use trending hashtags strategically",
        ],
    };
};

// Generate content calendar
const generateContentCalendar = async (params: any) => {
    const { durationWeeks, channels, campaignTheme, startDate } = params;
    const calendar: any[] = [];
    const start = startDate ? new Date(startDate) : new Date();

    const contentTypes = [
        {
            type: "Educational",
            description: "Tips, how-tos, industry insights",
        },
        { type: "Promotional", description: "Product/service highlights" },
        {
            type: "Engagement",
            description: "Questions, polls, user-generated content",
        },
        { type: "Behind-the-scenes", description: "Team, process, culture" },
        {
            type: "Social Proof",
            description: "Testimonials, case studies, reviews",
        },
    ];

    for (let week = 1; week <= durationWeeks; week++) {
        const weekPosts: any[] = [];
        const daysToPost = [1, 2, 3, 4, 5]; // Mon-Fri

        for (const day of daysToPost) {
            const postDate = new Date(start);
            postDate.setDate(start.getDate() + (week - 1) * 7 + day);

            const contentType =
                contentTypes[(week + day) % contentTypes.length];
            const channel = channels[(day - 1) % channels.length];

            weekPosts.push({
                date: postDate.toISOString().split("T")[0],
                day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                    postDate.getDay()
                ],
                channel,
                contentType: contentType.type,
                suggestion: `${contentType.type} post about ${campaignTheme}`,
                time:
                    channel === "linkedin"
                        ? "9:00 AM"
                        : channel === "instagram"
                          ? "12:00 PM"
                          : "10:00 AM",
            });
        }

        calendar.push({
            week,
            theme: `Week ${week}: ${week === 1 ? "Launch & Awareness" : week === durationWeeks ? "Call to Action" : "Engagement & Value"}`,
            posts: weekPosts,
        });
    }

    return calendar;
};

// Create marketing plan
const createMarketingPlan = async (params: any) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
    });

    const prompt = `You are a senior marketing strategist. Create a comprehensive, professional marketing plan in clean Markdown format.

## Campaign Details:
- **Campaign Name:** ${params.campaignName || "Marketing Campaign"}
- **Brand:** ${params.brandInfo?.name || "Brand"} - ${params.brandInfo?.description || ""}
- **Industry:** ${params.brandInfo?.industry || "General"}
- **Goals:** ${params.goals?.join(", ") || "Increase brand awareness"}
- **Target Audience:** ${params.targetAudience || "General audience"}
- **Channels:** ${params.channels?.join(", ") || "Social media"}
- **Budget:** ${params.budget || "To be determined"}
- **Duration:** ${params.duration || "4 weeks"}
- **Tone:** ${params.tone || "Professional"}

---

Generate a marketing plan with the following structure. Use proper Markdown formatting with headers (##, ###), bullet points, bold text, tables where appropriate, and clear section breaks:

# 📋 Marketing Plan: [Campaign Name]

## 1. Executive Summary
Write a compelling 2-3 paragraph executive summary that captures the essence of the campaign, key objectives, and expected outcomes.

## 2. Campaign Objectives
Create SMART goals in a clear format:
- **S**pecific: What exactly will be achieved
- **M**easurable: Metrics to track success
- **A**chievable: Realistic targets
- **R**elevant: Alignment with business goals
- **T**ime-bound: Timeline for delivery

## 3. Target Audience Analysis
### Primary Audience
- Demographics
- Psychographics
- Pain points
- Motivations

### Audience Personas
Create 2-3 brief personas with names and characteristics.

## 4. Channel Strategy
For each channel, provide:
| Channel | Strategy | Content Type | Frequency |
|---------|----------|--------------|-----------|

Include specific tactics and best practices.

## 5. Content Pillars
Define 3-4 content themes with:
- Pillar name
- Description
- Example topics
- Content ratio (%)

## 6. Key Messages
- **Primary Message:** Main campaign message
- **Supporting Messages:** 3-4 supporting statements
- **Call to Action:** Clear CTA

## 7. Success Metrics & KPIs
Create a table of metrics:
| Metric | Target | Measurement Tool |
|--------|--------|------------------|

## 8. Budget Allocation
Break down the budget by:
- Channel allocation (%)
- Content creation (%)
- Paid promotion (%)
- Tools & resources (%)

## 9. Timeline & Milestones
Create a week-by-week or phase-by-phase breakdown.

## 10. Risk Mitigation
Identify potential risks and mitigation strategies.

---

Make the output visually appealing and easy to read. Use emojis sparingly for section headers to improve visual hierarchy.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
};

export interface AgentMessage {
    role: "user" | "assistant" | "system" | "thought";
    content: string;
    timestamp: number;
    metadata?: {
        toolCall?: string;
        toolResult?: any;
        canvas?: any;
        contentCalendar?: any;
        marketingPlan?: string;
        analytics?: any;
    };
}

export interface AgentSession extends Session {
    agentMessages: AgentMessage[];
    collectedInfo: {
        brandName?: string;
        brandDescription?: string;
        industry?: string;
        campaignGoal?: string;
        targetAudience?: string;
        budget?: string;
        channels?: string[];
        timeline?: string;
        tone?: string;
        additionalInfo?: string;
    };
    campaignPlan?: any;
    createdCanvases: string[];
    phase: "gathering" | "analyzing" | "planning" | "creating" | "complete";
    questionsAsked: string[];
}

class NestGptAgentService {
    private sessions: Map<string, AgentSession> = new Map();

    private getOrCreateSession(sessionId?: string): AgentSession {
        if (sessionId && this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId)!;
        }

        const baseSession = sessionStore.getOrCreate(sessionId);
        const agentSession: AgentSession = {
            ...baseSession,
            agentMessages: [],
            collectedInfo: {},
            createdCanvases: [],
            phase: "gathering",
            questionsAsked: [],
        };

        this.sessions.set(agentSession.id, agentSession);
        return agentSession;
    }

    private saveSession(session: AgentSession) {
        session.updatedAt = Date.now();
        this.sessions.set(session.id, session);
    }

    async processMessage(
        sessionId: string | undefined,
        userMessage: string,
    ): Promise<{
        reply: string;
        sessionId: string;
        thoughts: string[];
        actions: Array<{ type: string; data: any }>;
        phase: string;
        collectedInfo: any;
    }> {
        const session = this.getOrCreateSession(sessionId);
        const thoughts: string[] = [];
        const actions: Array<{ type: string; data: any }> = [];

        // Extract info from user message FIRST - before processing
        this.extractAndUpdateInfo(session, userMessage);

        // Add user message
        session.agentMessages.push({
            role: "user",
            content: userMessage,
            timestamp: Date.now(),
        });

        // Build conversation context - map 'assistant' to 'model' for Gemini API
        const conversationHistory = session.agentMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
                role: (m.role === "assistant" ? "model" : "user") as
                    | "user"
                    | "model",
                parts: [{ text: m.content }],
            }));

        // Determine if we should force function calling
        const questionsAskedCount = session.questionsAsked.length;
        const hasSubstantialInfo =
            session.collectedInfo.brandName &&
            session.collectedInfo.campaignGoal &&
            session.collectedInfo.targetAudience;
        // Require MINIMUM 3 questions, allow up to 5 maximum
        const shouldForceAction =
            questionsAskedCount >= 5 ||
            (questionsAskedCount >= 3 && hasSubstantialInfo);

        thoughts.push(
            `📋 Session state: ${questionsAskedCount} questions asked, has substantial info: ${hasSubstantialInfo}, force action: ${shouldForceAction}`,
        );

        // Create the agent model with tools - force function calling after enough questions
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            tools: [agentToolsConfig as any],
            toolConfig: shouldForceAction
                ? {
                      functionCallingConfig: {
                          mode: "ANY" as any, // Force function calling
                          allowedFunctionNames: [
                              "create_marketing_plan",
                              "generate_campaign_image",
                              "generate_content_calendar",
                              "analyze_analytics",
                              "save_campaign",
                          ],
                      },
                  }
                : undefined,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
            },
        });

        const systemPrompt = this.buildSystemPrompt(session);

        try {
            // Start chat with system context
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    {
                        role: "model",
                        parts: [
                            {
                                text: "Understood. I'm ready to help create a comprehensive marketing campaign. I'll gather information step by step and use my tools to analyze, create visuals, and build a complete plan.",
                            },
                        ],
                    },
                    ...conversationHistory.slice(0, -1), // All except the latest
                ],
            });

            // Send the latest user message
            const result = await chat.sendMessage(userMessage);
            const response = result.response;

            let finalReply = "";

            // Check for function calls
            const functionCalls = response.functionCalls();

            if (functionCalls && functionCalls.length > 0) {
                for (const functionCall of functionCalls) {
                    const toolName = functionCall.name;
                    const args = functionCall.args as Record<string, any>;

                    thoughts.push(`🔧 Using tool: ${toolName}`);

                    // Execute the tool
                    const toolResult = await this.executeTool(
                        session,
                        toolName,
                        args,
                        thoughts,
                        actions,
                    );

                    // Update session based on tool results
                    if (toolName === "ask_question") {
                        finalReply = args.question;
                        session.questionsAsked.push(args.category);
                    } else if (toolName === "analyze_analytics") {
                        thoughts.push(
                            "📊 Analyzed social media performance data",
                        );
                        actions.push({ type: "analytics", data: toolResult });
                    } else if (toolName === "generate_campaign_image") {
                        thoughts.push(`🎨 Created canvas: ${args.canvasName}`);
                        actions.push({ type: "canvas", data: toolResult });
                        session.createdCanvases.push(
                            toolResult.canvas?.id || "",
                        );
                    } else if (toolName === "create_marketing_plan") {
                        thoughts.push(
                            "📋 Generated comprehensive marketing plan",
                        );
                        session.campaignPlan = toolResult;
                        session.phase = "planning";
                        actions.push({
                            type: "marketingPlan",
                            data: toolResult,
                        });
                    } else if (toolName === "generate_content_calendar") {
                        thoughts.push("📅 Created content calendar");
                        actions.push({
                            type: "contentCalendar",
                            data: toolResult,
                        });
                    } else if (toolName === "save_campaign") {
                        thoughts.push("💾 Campaign saved successfully");
                        session.phase = "complete";
                        actions.push({
                            type: "campaignSaved",
                            data: toolResult,
                        });
                    }

                    // Send tool result back to get natural language response
                    if (toolName !== "ask_question") {
                        const followUp = await chat.sendMessage([
                            {
                                functionResponse: {
                                    name: toolName,
                                    response: {
                                        result: JSON.stringify(
                                            toolResult,
                                        ).slice(0, 1000),
                                    },
                                },
                            },
                        ]);
                        finalReply = followUp.response.text() || "";

                        // If still no reply, generate a contextual response
                        if (!finalReply || finalReply.trim() === "") {
                            finalReply = await this.generateContextualReply(
                                session,
                                toolName,
                                toolResult,
                            );
                        }
                    }
                }
            } else {
                // No function call, regular response
                let textResponse = response.text();

                // If no text response, generate a poster description for canvas studio
                if (!textResponse || textResponse.trim() === "") {
                    textResponse = await this.generatePosterDescription(
                        session,
                        userMessage,
                    );
                }

                finalReply = textResponse;

                // Extract any info from user message and update collected info
                this.extractAndUpdateInfo(session, userMessage);
            }

            // Add assistant response
            session.agentMessages.push({
                role: "assistant",
                content: finalReply,
                timestamp: Date.now(),
                metadata: { toolCall: functionCalls?.[0]?.name },
            });

            // Update phase based on collected info
            this.updatePhase(session);

            this.saveSession(session);

            return {
                reply: finalReply,
                sessionId: session.id,
                thoughts,
                actions,
                phase: session.phase,
                collectedInfo: session.collectedInfo,
            };
        } catch (error: any) {
            console.error("Agent error:", error);

            const errorReply =
                "I apologize, I encountered an issue processing your request. Could you please try again?";

            session.agentMessages.push({
                role: "assistant",
                content: errorReply,
                timestamp: Date.now(),
            });

            this.saveSession(session);

            return {
                reply: errorReply,
                sessionId: session.id,
                thoughts: ["⚠️ Error occurred: " + error.message],
                actions: [],
                phase: session.phase,
                collectedInfo: session.collectedInfo,
            };
        }
    }

    private buildSystemPrompt(session: AgentSession): string {
        const collectedInfoStr = Object.entries(session.collectedInfo)
            .filter(([_, v]) => v)
            .map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n");

        const questionsAskedCount = session.questionsAsked.length;
        const hasEnoughInfo =
            questionsAskedCount >= 5 ||
            (questionsAskedCount >= 3 &&
                session.collectedInfo.brandName &&
                session.collectedInfo.campaignGoal &&
                session.collectedInfo.targetAudience);

        // If we have enough info (3-5 questions asked), move to action
        if (hasEnoughInfo) {
            return `You are NestGPT, an AI marketing strategist. You have collected enough information to proceed (${questionsAskedCount} questions asked).

COLLECTED INFORMATION:
${collectedInfoStr || "User wants a marketing campaign"}

IMPORTANT: DO NOT ask more questions. You have enough information now. Time to create!

YOUR NEXT ACTION - Pick ONE:
1. If no marketing plan created yet → Use create_marketing_plan tool NOW with reasonable assumptions for any missing details
2. If marketing plan exists but no image → Use generate_campaign_image tool to create a campaign visual
3. If plan and image exist but no calendar → Use generate_content_calendar tool
4. Otherwise → Summarize what was created and ask if user wants changes

MAKE ASSUMPTIONS for missing info:
- No channels specified? Assume Instagram, LinkedIn
- No budget? Assume "medium"
- No timeline? Assume 2 weeks
- No audience? Infer from the brand/product description
- No tone? Assume "professional yet friendly"

BE DECISIVE. Take action NOW. Do not ask more questions.`;
        }

        // First interaction or need basic info (still gathering - need 3-5 questions)
        const remainingQuestions = Math.max(0, 3 - questionsAskedCount);
        const maxMoreQuestions = Math.max(0, 5 - questionsAskedCount);

        return `You are NestGPT, an AI marketing strategist for SocialNest. Help users create social media campaigns.

CURRENT STATE:
- Questions asked so far: ${questionsAskedCount}/5
- Minimum questions required: 3
- Maximum questions allowed: 5
- Questions remaining (minimum): ${remainingQuestions}
- Info collected: ${collectedInfoStr || "None yet"}

CRITICAL RULES:
1. You MUST ask at least ${remainingQuestions} more question(s) before taking action
2. You can ask up to ${maxMoreQuestions} more question(s)
3. After 3 questions, if you have brand name, goal, and target audience, you CAN proceed to action
4. After 5 questions, STOP asking and proceed to action with whatever info you have

QUESTIONS TO ASK (pick based on what's missing):
1. BRAND IDENTITY: "Tell me about your brand/company. What's the name and what do you do?"
2. CAMPAIGN GOAL: "What's the main objective for this campaign? (e.g., increase awareness, drive sales, grow followers)"
3. TARGET AUDIENCE: "Who is your target audience? Describe their demographics, interests, or personas."
4. CHANNELS & BUDGET: "Which social media platforms do you want to focus on? And what's your approximate budget?"
5. TIMELINE & TONE: "How long should this campaign run? And what tone/style should the content have?"

Use the ask_question tool to ask ONE question at a time. Make questions conversational and helpful.

AFTER COLLECTING INFO, you will:
1. Create a comprehensive marketing plan
2. Generate campaign visuals/posters for the Canvas Studio
3. Build a content calendar
4. Provide analytics insights

Be friendly, professional, and guide the user step by step.`;
    }

    private getMissingInfo(session: AgentSession): string[] {
        const missing: string[] = [];
        const info = session.collectedInfo;

        if (!info.brandName) missing.push("brand name");
        if (!info.campaignGoal) missing.push("campaign goal");
        if (!info.targetAudience) missing.push("target audience");
        if (!info.channels || info.channels.length === 0)
            missing.push("social channels");

        return missing;
    }

    private async executeTool(
        session: AgentSession,
        toolName: string,
        args: Record<string, any>,
        thoughts: string[],
        actions: Array<{ type: string; data: any }>,
    ): Promise<any> {
        switch (toolName) {
            case "ask_question":
                // Update collected info category
                return { question: args.question, category: args.category };

            case "analyze_analytics":
                const analytics = await getAnalyticsData(
                    args.platforms || ["instagram", "linkedin"],
                    args.timeframe,
                );
                return analytics;

            case "generate_campaign_image":
                try {
                    const canvas = await canvasService.createCanvas({
                        name: args.canvasName,
                        imagePrompt: args.imagePrompt,
                        aspectRatio: args.aspectRatio || "1:1",
                        brandName:
                            args.brandName || session.collectedInfo.brandName,
                    });
                    return { success: true, canvas };
                } catch (err: any) {
                    thoughts.push(`⚠️ Image generation error: ${err.message}`);
                    return { success: false, error: err.message };
                }

            case "create_marketing_plan":
                const plan = await createMarketingPlan({
                    ...args,
                    brandInfo: {
                        name: session.collectedInfo.brandName,
                        description: session.collectedInfo.brandDescription,
                        industry: session.collectedInfo.industry,
                    },
                    targetAudience:
                        args.targetAudience ||
                        session.collectedInfo.targetAudience,
                    budget: args.budget || session.collectedInfo.budget,
                    tone: args.tone || session.collectedInfo.tone,
                });
                return { plan, campaignName: args.campaignName };

            case "generate_content_calendar":
                const calendar = await generateContentCalendar(args);
                return { calendar, weeks: args.durationWeeks };

            case "save_campaign":
                // In production, save to database
                session.campaignPlan = args.campaignData;
                return { saved: true, campaignId: uuidv4() };

            default:
                return { error: "Unknown tool" };
        }
    }

    private extractAndUpdateInfo(session: AgentSession, message: string): void {
        const lowerMessage = message.toLowerCase();

        // More aggressive brand name extraction - get any capitalized words or quoted text
        if (!session.collectedInfo.brandName) {
            // Try quoted brand names first
            const quotedMatch = message.match(/["']([^"']+)["']/);
            if (quotedMatch) {
                session.collectedInfo.brandName = quotedMatch[1].trim();
            } else {
                // Try to find capitalized brand-like words
                const brandMatch = message.match(
                    /\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)\b/,
                );
                if (
                    brandMatch &&
                    ![
                        "I",
                        "The",
                        "A",
                        "We",
                        "My",
                        "Our",
                        "Hi",
                        "Hello",
                        "Hey",
                    ].includes(brandMatch[1])
                ) {
                    session.collectedInfo.brandName = brandMatch[1].trim();
                }
            }
        }

        // Extract product/brand description from the whole message
        if (!session.collectedInfo.brandDescription && message.length > 20) {
            session.collectedInfo.brandDescription = message.slice(0, 200);
        }

        // Channel detection
        const channels: string[] = [];
        if (
            lowerMessage.includes("instagram") ||
            lowerMessage.includes("insta")
        )
            channels.push("instagram");

        if (lowerMessage.includes("linkedin")) channels.push("linkedin");
        if (lowerMessage.includes("facebook") || lowerMessage.includes(" fb "))
            channels.push("facebook");
        if (lowerMessage.includes("tiktok") || lowerMessage.includes("tik tok"))
            channels.push("tiktok");
        if (channels.length > 0) {
            session.collectedInfo.channels = channels;
        }

        // Goal detection - more patterns
        if (
            lowerMessage.includes("awareness") ||
            lowerMessage.includes("visibility") ||
            lowerMessage.includes("reach")
        ) {
            session.collectedInfo.campaignGoal = "brand awareness";
        } else if (
            lowerMessage.includes("launch") ||
            lowerMessage.includes("new product") ||
            lowerMessage.includes("releasing")
        ) {
            session.collectedInfo.campaignGoal = "product launch";
        } else if (
            lowerMessage.includes("engagement") ||
            lowerMessage.includes("followers") ||
            lowerMessage.includes("community")
        ) {
            session.collectedInfo.campaignGoal = "increase engagement";
        } else if (
            lowerMessage.includes("sales") ||
            lowerMessage.includes("conversion") ||
            lowerMessage.includes("revenue") ||
            lowerMessage.includes("sell")
        ) {
            session.collectedInfo.campaignGoal = "drive conversions";
        } else if (
            lowerMessage.includes("promote") ||
            lowerMessage.includes("marketing") ||
            lowerMessage.includes("campaign")
        ) {
            session.collectedInfo.campaignGoal = "promotion";
        }

        // Budget detection
        if (
            lowerMessage.includes("low budget") ||
            lowerMessage.includes("limited") ||
            lowerMessage.includes("small budget") ||
            lowerMessage.includes("tight budget")
        ) {
            session.collectedInfo.budget = "low";
        } else if (
            lowerMessage.includes("medium") ||
            lowerMessage.includes("moderate") ||
            lowerMessage.includes("reasonable")
        ) {
            session.collectedInfo.budget = "medium";
        } else if (
            lowerMessage.includes("high budget") ||
            lowerMessage.includes("large budget") ||
            lowerMessage.includes("big budget") ||
            lowerMessage.includes("unlimited")
        ) {
            session.collectedInfo.budget = "high";
        }

        // Audience detection
        if (!session.collectedInfo.targetAudience) {
            const audiencePatterns = [
                /(?:target|audience|for)\s+([^,.]+)/i,
                /(?:young|old|teen|adult|professional|business|consumer|customer)s?\b/i,
            ];
            for (const pattern of audiencePatterns) {
                const match = message.match(pattern);
                if (match) {
                    session.collectedInfo.targetAudience = match[1] || match[0];
                    break;
                }
            }
        }
    }

    private updatePhase(session: AgentSession): void {
        const info = session.collectedInfo;
        const hasBasicInfo = info.brandName && info.campaignGoal;
        const hasDetailedInfo =
            hasBasicInfo && info.targetAudience && info.channels;

        if (session.campaignPlan) {
            session.phase =
                session.createdCanvases.length > 0 ? "complete" : "creating";
        } else if (hasDetailedInfo) {
            session.phase = "planning";
        } else if (hasBasicInfo) {
            session.phase = "analyzing";
        } else {
            session.phase = "gathering";
        }
    }

    // Generate a contextual reply based on tool results
    private async generateContextualReply(
        session: AgentSession,
        toolName: string,
        toolResult: any,
    ): Promise<string> {
        const brandName = session.collectedInfo.brandName || "your brand";

        switch (toolName) {
            case "create_marketing_plan":
                return `I've created a comprehensive marketing plan for ${brandName}! 📋\n\nThe plan includes your campaign objectives, target audience analysis, channel strategy, content pillars, and success metrics. You can view and download it as a PDF.\n\nWould you like me to also generate some campaign visuals for your social media posts?`;

            case "generate_campaign_image":
                return `I've generated a campaign image for ${brandName}! 🎨\n\nYou can view it in the Canvas Studio. The visual is designed to align with your campaign goals and brand identity.\n\nWould you like me to create more variations or proceed with a content calendar?`;

            case "generate_content_calendar":
                return `I've created a content calendar for your campaign! 📅\n\nThe calendar spans ${toolResult?.weeks || 2} weeks with scheduled posts optimized for engagement across your selected platforms.\n\nWould you like to review the schedule or make any adjustments?`;

            case "analyze_analytics":
                return `I've analyzed your social media analytics! 📊\n\nI found some interesting insights about your audience engagement patterns and content performance. These insights will help optimize your campaign strategy.\n\nShall I incorporate these findings into your marketing plan?`;

            default:
                return `I've completed the ${toolName.replace(/_/g, " ")} for ${brandName}. What would you like me to do next?`;
        }
    }

    // Generate a poster description that can be sent to Canvas Studio
    private async generatePosterDescription(
        session: AgentSession,
        userMessage: string,
    ): Promise<string> {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
        });

        const brandName = session.collectedInfo.brandName || "the brand";
        const goal = session.collectedInfo.campaignGoal || "marketing";
        const audience =
            session.collectedInfo.targetAudience || "general audience";
        const tone = session.collectedInfo.tone || "professional";

        const prompt = `Based on the context, generate a creative description for a marketing poster/visual that can be created in Canvas Studio.

Brand: ${brandName}
Campaign Goal: ${goal}
Target Audience: ${audience}
Tone: ${tone}
User Message: ${userMessage}

Generate a response that:
1. Acknowledges the user's input
2. Provides a detailed visual concept for a poster including:
   - Main headline/tagline idea
   - Visual elements (colors, imagery, style)
   - Call-to-action text
   - Layout suggestions
3. Offers to create this visual using the Canvas Studio

Be enthusiastic and creative. Format nicely with bullet points or sections.`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return text || this.getDefaultPosterResponse(session);
        } catch (error) {
            return this.getDefaultPosterResponse(session);
        }
    }

    private getDefaultPosterResponse(session: AgentSession): string {
        const brandName = session.collectedInfo.brandName || "your brand";
        const goal = session.collectedInfo.campaignGoal || "campaign";

        return `Great! Based on what you've shared about ${brandName}, here's a poster concept for your ${goal}:

🎨 **Visual Concept:**
- **Headline:** "Experience ${brandName} - Your Journey Starts Here"
- **Color Palette:** Bold primary colors with clean white space
- **Imagery:** Modern, lifestyle-focused photography or minimalist graphics
- **Style:** Contemporary and eye-catching

📝 **Call-to-Action:**
"Learn More" or "Get Started Today"

📐 **Layout:**
- Centered composition
- Logo prominently placed at top or bottom
- Clear visual hierarchy

Would you like me to create this visual in the Canvas Studio? I can generate multiple variations in different formats (square for Instagram, landscape for LinkedIn, etc.)`;
    }

    getSession(sessionId: string): AgentSession | undefined {
        return this.sessions.get(sessionId);
    }

    resetSession(sessionId: string): void {
        this.sessions.delete(sessionId);
    }
}

export default new NestGptAgentService();
