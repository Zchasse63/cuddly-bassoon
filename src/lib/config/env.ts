import { z } from 'zod';

/**
 * Environment variable schema with Zod validation.
 * Validates all required environment variables at runtime.
 */
const envSchema = z.object({
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .startsWith('sb_publishable_', 'Must be a publishable key'),
  SUPABASE_SECRET_KEY: z.string().startsWith('sb_secret_', 'Must be a secret key'),
  SUPABASE_PROJECT_REF: z.string().min(1, 'Project ref required'),

  // Upstash Redis (Required)
  UPSTASH_REDIS_REST_URL: z.string().url('Invalid Upstash Redis URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Redis token required'),

  // External APIs (Optional - validate when present)
  RENTCAST_API_KEY: z.string().optional(),
  SHOVELS_API_KEY: z.string().optional(),
  SHOVELS_API_BASE_URL: z.string().url().optional().default('https://api.shovels.ai/v2'),

  // AI/LLM (Optional)
  XAI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Communication Services (Optional - Phase 9)
  // Twilio for SMS/Voice
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  // SendGrid for Email
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().optional(),
  // Webhook verification secrets
  TWILIO_WEBHOOK_SECRET: z.string().optional(),
  SENDGRID_WEBHOOK_SECRET: z.string().optional(),

  // Application Settings
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment configuration.
 * Throws an error if required variables are missing or invalid.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check your .env.local file.');
  }

  return parsed.data;
}

/**
 * Type-safe environment configuration.
 * Access environment variables through this object.
 */
export const env = validateEnv();

/**
 * Check if the app is running in development mode.
 */
export const isDev = env.NODE_ENV === 'development';

/**
 * Check if the app is running in production mode.
 */
export const isProd = env.NODE_ENV === 'production';

/**
 * Check if the app is running in test mode.
 */
export const isTest = env.NODE_ENV === 'test';
