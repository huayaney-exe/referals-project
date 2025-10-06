import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Client for public operations (with RLS)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database types (will be auto-generated later with `supabase gen types`)
export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          category: string | null;
          reward_structure: {
            stamps_required: number;
            reward_description: string;
          };
          logo_url: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          version: number;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone?: string | null;
          category?: string | null;
          reward_structure: {
            stamps_required: number;
            reward_description: string;
          };
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          version?: number;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          category?: string | null;
          reward_structure?: {
            stamps_required: number;
            reward_description: string;
          };
          logo_url?: string | null;
          updated_at?: string;
          is_active?: boolean;
          version?: number;
        };
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          phone: string;
          name: string;
          stamps_count: number;
          total_rewards_earned: number;
          enrolled_at: string;
          last_stamp_at: string | null;
          pass_serial_number: string | null;
          pass_url: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          business_id: string;
          phone: string;
          name: string;
          stamps_count?: number;
          total_rewards_earned?: number;
          enrolled_at?: string;
          last_stamp_at?: string | null;
          pass_serial_number?: string | null;
          pass_url?: string | null;
          version?: number;
        };
        Update: {
          id?: string;
          business_id?: string;
          phone?: string;
          name?: string;
          stamps_count?: number;
          total_rewards_earned?: number;
          last_stamp_at?: string | null;
          pass_serial_number?: string | null;
          pass_url?: string | null;
          version?: number;
        };
      };
      stamps: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          stamped_at: string;
          stamped_by: string | null;
          is_reward_redemption: boolean;
          stamps_before: number;
          stamps_after: number;
          idempotency_key: string | null;
          metadata: Record<string, unknown>;
        };
      };
      campaigns: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          message: string;
          target_segment: {
            min_stamps: number;
            max_stamps: number | null;
          };
          scheduled_for: string | null;
          status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
          sent_count: number;
          created_at: string;
          completed_at: string | null;
          metadata: Record<string, unknown>;
        };
      };
    };
    Functions: {
      add_stamp_with_outbox: {
        Args: {
          p_customer_id: string;
          p_business_id: string;
          p_stamped_by?: string;
          p_idempotency_key?: string | null;
        };
        Returns: {
          new_stamps_count: number;
          is_reward_earned: boolean;
          stamp_id: string;
        }[];
      };
    };
  };
}
