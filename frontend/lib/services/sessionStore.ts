import { v4 as uuidv4 } from "uuid";

// Extend global types to include our session store
declare global {
    var __socialNestSessions: Map<string, Session> | undefined;
}

declare global {
    namespace globalThis {
        var __socialNestSessions: Map<string, Session> | undefined;
    }
}

export type SessionMode = "conversation" | "campaign";

export interface Session {
    id: string;
    mode: SessionMode;
    messages: { role: "user" | "assistant"; content: string }[];
    extractedIntake?: any;
    confirmedIntake?: any;
    stageOutputs: Record<string, any>;
    createdAt: number;
    updatedAt: number;
    // Twitter OAuth specific fields
    twitterTokens?: {
        accessToken: string;
        refreshToken?: string;
        expiresIn?: number;
    };
    twitterUser?: {
        id: string;
        username: string;
        name: string;
    };
    // OAuth state management
    oauthState?: {
        state: string;
        codeVerifier: string;
        provider: "twitter" | "facebook" | "instagram";
        createdAt: number;
        returnTo?: string;
    };
}

// Global store using process object for true persistence across module reloads
declare global {
    namespace NodeJS {
        interface Global {
            __socialNestSessions?: Map<string, Session>;
        }
    }
}

// Use process.global or global to store sessions
const getGlobalStore = (): Map<string, Session> => {
    if (typeof global !== "undefined") {
        if (!global.__socialNestSessions) {
            global.__socialNestSessions = new Map<string, Session>();
        }
        return global.__socialNestSessions;
    }
    // Fallback for environments without global
    if (!globalThis.__socialNestSessions) {
        globalThis.__socialNestSessions = new Map<string, Session>();
    }
    return globalThis.__socialNestSessions;
};

class SessionStore {
    private store = getGlobalStore();
    private ttlMs = 1000 * 60 * 60 * 2; // 2 hours (longer for OAuth flows)

    constructor() {
        this.store = getGlobalStore();

        // Clean up expired sessions on startup
        this.cleanup();

        // Set up periodic cleanup
        if (typeof window === "undefined") {
            setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
        }
    }

    getOrCreate(id?: string): Session {
        if (id) {
            const s = this.store.get(id);
            if (s && Date.now() - s.updatedAt < this.ttlMs) return s;
        }

        const session: Session = {
            id: uuidv4(),
            mode: "conversation",
            messages: [],
            stageOutputs: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        this.store.set(session.id, session);
        return session;
    }

    get(id: string): Session | undefined {
        const session = this.store.get(id);
        if (session && Date.now() - session.updatedAt < this.ttlMs) {
            return session;
        }
        if (session) {
            this.store.delete(id); // Clean up expired session
        }
        return undefined;
    }

    save(session: Session) {
        session.updatedAt = Date.now();
        this.store.set(session.id, session);
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    // Twitter OAuth specific methods
    getTwitterTokens(sessionId: string): Session["twitterTokens"] | undefined {
        const session = this.store.get(sessionId);
        if (session && Date.now() - session.updatedAt < this.ttlMs) {
            return session?.twitterTokens;
        }
        return undefined;
    }

    // OAuth state management
    setOAuthState(sessionId: string, state: Session["oauthState"]) {
        // Refresh store reference
        this.store = getGlobalStore();

        let session = this.store.get(sessionId);
        if (!session) {
            // Force create session if it doesn't exist
            session = {
                id: sessionId,
                mode: "conversation",
                messages: [],
                stageOutputs: {},
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
        }

        session.oauthState = state;
        session.updatedAt = Date.now();
        this.store.set(sessionId, session);
    }

    getOAuthState(sessionId: string): Session["oauthState"] | undefined {
        // Refresh store reference
        const freshStore = getGlobalStore();
        const storeChanged = this.store !== freshStore;

        if (storeChanged) {
            this.store = freshStore;
        }

        const session = this.store.get(sessionId);
        const isExpired =
            session && Date.now() - session.updatedAt >= this.ttlMs;

        if (isExpired) {
            this.store.delete(sessionId);
        }

        const validSession = isExpired ? null : session;
        return validSession?.oauthState;
    }

    // Find session by OAuth state parameter (for callback when cookies aren't available)
    findSessionByOAuthState(state: string): Session | undefined {
        // Refresh store reference
        this.store = getGlobalStore();

        const now = Date.now();
        for (const [id, session] of this.store.entries()) {
            // Check if session is valid (not expired)
            if (now - session.updatedAt < this.ttlMs) {
                // Check if OAuth state matches
                if (session.oauthState?.state === state) {
                    return session;
                }
            }
        }
        return undefined;
    }

    clearOAuthState(sessionId: string) {
        const session = this.store.get(sessionId);
        if (session) {
            delete session.oauthState;
            session.updatedAt = Date.now();
            this.store.set(sessionId, session);
        }
    }

    // Clean up expired sessions
    cleanup() {
        const now = Date.now();
        for (const [id, session] of this.store.entries()) {
            if (now - session.updatedAt >= this.ttlMs) {
                this.store.delete(id);
            }
        }
    }

    // Get all active sessions
    getAllSessions(): Session[] {
        return Array.from(this.store.values()).filter(
            (session) => Date.now() - session.updatedAt < this.ttlMs,
        );
    }

    // Force create session
    getOrCreateForced(id: string): Session {
        let session = this.store.get(id);
        if (!session) {
            session = {
                id: id,
                mode: "conversation",
                messages: [],
                stageOutputs: {},
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            this.store.set(id, session);
        }
        return session;
    }

    // Enhanced methods for better OAuth state management
    setTwitterTokens(sessionId: string, tokens: Session["twitterTokens"]) {
        let session = this.store.get(sessionId);
        if (!session) {
            session = this.getOrCreateForced(sessionId);
        }
        session.twitterTokens = tokens;
        session.updatedAt = Date.now();
        this.store.set(sessionId, session);
    }

    setTwitterUser(sessionId: string, user: Session["twitterUser"]) {
        let session = this.store.get(sessionId);
        if (!session) {
            session = this.getOrCreateForced(sessionId);
        }
        session.twitterUser = user;
        session.updatedAt = Date.now();
        this.store.set(sessionId, session);
    }

    // Store verification method
    verifyStoreConsistency(): any {
        const globalStore = getGlobalStore();
        const isConsistent = this.store === globalStore;

        return {
            consistent: isConsistent,
            localStoreSize: this.store.size,
            globalStoreSize: globalStore.size,
            storeType: typeof global !== "undefined" ? "global" : "globalThis",
            message: isConsistent
                ? "Store is consistent"
                : "Store reference mismatch detected",
        };
    }
}

export default new SessionStore();
