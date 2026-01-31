import Snoowrap from 'snoowrap';

// Reddit API configuration
// Choose authentication method: 'password' or 'token'
const authMethod = process.env.REDDIT_AUTH_METHOD || 'password'; // Change to 'token' if using refresh token

const redditConfig = authMethod === 'token' 
    ? {
        // Token-based authentication (for web apps) - uses refresh token only
        userAgent: `web:SocialNest:v1.0.0 (by /u/${process.env.REDDIT_USERNAME || 'unknown'})`,
        clientId: process.env.REDDIT_CLIENT_ID || '',
        clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
        refreshToken: process.env.REDDIT_REFRESH_TOKEN || ''
    }
    : {
        // Password-based authentication (for script apps)
        userAgent: `web:SocialNest:v1.0.0 (by /u/${process.env.REDDIT_USERNAME || 'unknown'})`,
        clientId: process.env.REDDIT_CLIENT_ID || '',
        clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
        username: process.env.REDDIT_USERNAME || '',
        password: process.env.REDDIT_PASSWORD || ''
    };

// Validate Reddit configuration
const validateRedditConfig = (): boolean => {
    const requiredFields = authMethod === 'token'
        ? ['clientId', 'clientSecret', 'refreshToken']
        : ['clientId', 'clientSecret', 'username', 'password'];
    
    const missingFields = requiredFields.filter(field => !redditConfig[field as keyof typeof redditConfig]);
    
    if (missingFields.length > 0) {
        console.warn(`⚠️  Reddit configuration missing: ${missingFields.join(', ')}`);
        return false;
    }
    
    console.log('✅ Reddit configuration validated');
    console.log('   - Auth Method:', authMethod);
    console.log('   - Client ID:', redditConfig.clientId.substring(0, 8) + '...');
    if (authMethod === 'password') {
        console.log('   - Username:', (redditConfig as any).username);
    }
    console.log('   - User Agent:', redditConfig.userAgent);
    
    return true;
};

// Create Reddit client instance
export const createRedditClient = (): Snoowrap | null => {
    if (!validateRedditConfig()) {
        return null;
    }
    
    try {
        const client = new Snoowrap(redditConfig as any);
        
        // Configure request delay to avoid rate limiting
        client.config({ requestDelay: 1000, continueAfterRatelimitError: true });
        
        console.log('✅ Reddit client initialized successfully');
        return client;
    } catch (error) {
        console.error('❌ Failed to initialize Reddit client:', error);
        return null;
    }
};

export default redditConfig;
