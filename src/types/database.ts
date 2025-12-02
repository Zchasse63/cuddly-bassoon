/**
 * Database types for Supabase.
 *
 * This file will be auto-generated using the Supabase CLI:
 * npx supabase gen types typescript --project-id qhqztlvxudvsmxeqdyfp > src/types/database.ts
 *
 * For now, we provide a minimal placeholder that will be replaced
 * once the database schema is created.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      // Tables will be generated here after schema creation
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: unknown[];
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Relationships: unknown[];
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: Record<string, unknown>;
    };
  };
}
