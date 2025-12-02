declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase (New API Key Format - June 2025+)
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
    SUPABASE_SECRET_KEY: string;
    SUPABASE_PROJECT_REF: string;

    // Upstash Redis (Caching Layer)
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;

    // RentCast API (Phase 3)
    RENTCAST_API_KEY?: string;

    // AI Services (Phase 5)
    ANTHROPIC_API_KEY?: string;
    OPENAI_API_KEY?: string;

    // Twilio (Phase 9)
    TWILIO_ACCOUNT_SID?: string;
    TWILIO_AUTH_TOKEN?: string;
    TWILIO_PHONE_NUMBER?: string;

    // SendGrid (Phase 9)
    SENDGRID_API_KEY?: string;

    // App Configuration
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_URL?: string;
  }
}
