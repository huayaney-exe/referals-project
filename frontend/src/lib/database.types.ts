export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          business_id: string
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          event_data?: Json
          event_type: string
          id?: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          active_customers: number
          avg_days_to_redemption: number | null
          avg_stamps_per_customer: number | null
          business_id: string
          campaign_messages_sent: number
          campaign_success_rate: number | null
          campaigns_sent: number
          churned_customers: number
          created_at: string
          enrollment_rate: number | null
          id: string
          new_customers: number
          period_type: string
          redemption_rate: number | null
          snapshot_date: string
          total_customers: number
          total_stamps_issued: number
          total_stamps_redeemed: number
        }
        Insert: {
          active_customers?: number
          avg_days_to_redemption?: number | null
          avg_stamps_per_customer?: number | null
          business_id: string
          campaign_messages_sent?: number
          campaign_success_rate?: number | null
          campaigns_sent?: number
          churned_customers?: number
          created_at?: string
          enrollment_rate?: number | null
          id?: string
          new_customers?: number
          period_type: string
          redemption_rate?: number | null
          snapshot_date: string
          total_customers?: number
          total_stamps_issued?: number
          total_stamps_redeemed?: number
        }
        Update: {
          active_customers?: number
          avg_days_to_redemption?: number | null
          avg_stamps_per_customer?: number | null
          business_id?: string
          campaign_messages_sent?: number
          campaign_success_rate?: number | null
          campaigns_sent?: number
          churned_customers?: number
          created_at?: string
          enrollment_rate?: number | null
          id?: string
          new_customers?: number
          period_type?: string
          redemption_rate?: number | null
          snapshot_date?: string
          total_customers?: number
          total_stamps_issued?: number
          total_stamps_redeemed?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_locations: {
        Row: {
          address: string | null
          business_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_locations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          background_image_url: string | null
          brand_colors: Json | null
          card_design: Json | null
          category: string | null
          created_at: string | null
          email: string
          evolution_connected: boolean | null
          evolution_connected_at: string | null
          evolution_instance_name: string | null
          evolution_qr_code: string | null
          evolution_whatsapp_number: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          qr_downloaded: boolean | null
          qr_downloaded_at: string | null
          reward_structure: Json
          updated_at: string | null
          version: number | null
        }
        Insert: {
          background_image_url?: string | null
          brand_colors?: Json | null
          card_design?: Json | null
          category?: string | null
          created_at?: string | null
          email: string
          evolution_connected?: boolean | null
          evolution_connected_at?: string | null
          evolution_instance_name?: string | null
          evolution_qr_code?: string | null
          evolution_whatsapp_number?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          qr_downloaded?: boolean | null
          qr_downloaded_at?: string | null
          reward_structure?: Json
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          background_image_url?: string | null
          brand_colors?: Json | null
          card_design?: Json | null
          category?: string | null
          created_at?: string | null
          email?: string
          evolution_connected?: boolean | null
          evolution_connected_at?: string | null
          evolution_instance_name?: string | null
          evolution_qr_code?: string | null
          evolution_whatsapp_number?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          qr_downloaded?: boolean | null
          qr_downloaded_at?: string | null
          reward_structure?: Json
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      campaign_sends: {
        Row: {
          campaign_id: string
          customer_id: string
          error_message: string | null
          evolution_message_id: string | null
          id: string
          metadata: Json | null
          phone: string
          sent_at: string | null
          status: string | null
          twilio_message_sid: string | null
        }
        Insert: {
          campaign_id: string
          customer_id: string
          error_message?: string | null
          evolution_message_id?: string | null
          id?: string
          metadata?: Json | null
          phone: string
          sent_at?: string | null
          status?: string | null
          twilio_message_sid?: string | null
        }
        Update: {
          campaign_id?: string
          customer_id?: string
          error_message?: string | null
          evolution_message_id?: string | null
          id?: string
          metadata?: Json | null
          phone?: string
          sent_at?: string | null
          status?: string | null
          twilio_message_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_sends_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          name: string
          scheduled_for: string | null
          sent_count: number | null
          status: string | null
          target_segment: Json
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          name: string
          scheduled_for?: string | null
          sent_count?: number | null
          status?: string | null
          target_segment?: Json
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          name?: string
          scheduled_for?: string | null
          sent_count?: number | null
          status?: string | null
          target_segment?: Json
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          email: string | null
          email_opt_in: boolean
          enrolled_at: string | null
          id: string
          last_stamp_at: string | null
          name: string
          pass_serial_number: string | null
          pass_url: string | null
          phone: string
          stamps_count: number | null
          total_rewards_earned: number | null
          version: number | null
        }
        Insert: {
          business_id: string
          email?: string | null
          email_opt_in?: boolean
          enrolled_at?: string | null
          id?: string
          last_stamp_at?: string | null
          name: string
          pass_serial_number?: string | null
          pass_url?: string | null
          phone: string
          stamps_count?: number | null
          total_rewards_earned?: number | null
          version?: number | null
        }
        Update: {
          business_id?: string
          email?: string | null
          email_opt_in?: boolean
          enrolled_at?: string | null
          id?: string
          last_stamp_at?: string | null
          name?: string
          pass_serial_number?: string | null
          pass_url?: string | null
          phone?: string
          stamps_count?: number | null
          total_rewards_earned?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          business_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          step_name: string
          step_number: number
          time_spent_seconds: number | null
        }
        Insert: {
          business_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          step_name: string
          step_number: number
          time_spent_seconds?: number | null
        }
        Update: {
          business_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          step_name?: string
          step_number?: number
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_events: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          retry_count: number | null
          status: string | null
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
      reengagement_logs: {
        Row: {
          business_id: string
          created_at: string
          customers_targeted: number
          id: string
          inactive_days: number
          messages_failed: number
          messages_sent: number
          sent_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customers_targeted?: number
          id?: string
          inactive_days: number
          messages_failed?: number
          messages_sent?: number
          sent_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customers_targeted?: number
          id?: string
          inactive_days?: number
          messages_failed?: number
          messages_sent?: number
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reengagement_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_stamps: number | null
          business_id: string
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          referral_code: string
          referred_customer_id: string | null
          referred_phone: string | null
          referrer_customer_id: string
          status: string | null
        }
        Insert: {
          bonus_stamps?: number | null
          business_id: string
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          referral_code: string
          referred_customer_id?: string | null
          referred_phone?: string | null
          referrer_customer_id: string
          status?: string | null
        }
        Update: {
          bonus_stamps?: number | null
          business_id?: string
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          referral_code?: string
          referred_customer_id?: string | null
          referred_phone?: string | null
          referrer_customer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_customer_id_fkey"
            columns: ["referred_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_customer_id_fkey"
            columns: ["referrer_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      scanner_sessions: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          scanner_token_id: string
          stamps_added: number
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          scanner_token_id: string
          stamps_added?: number
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          scanner_token_id?: string
          stamps_added?: number
        }
        Relationships: [
          {
            foreignKeyName: "scanner_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scanner_sessions_scanner_token_id_fkey"
            columns: ["scanner_token_id"]
            isOneToOne: false
            referencedRelation: "scanner_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      scanner_tokens: {
        Row: {
          business_id: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          location_id: string | null
          name: string
          token: string
          usage_count: number | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          location_id?: string | null
          name: string
          token: string
          usage_count?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          location_id?: string | null
          name?: string
          token?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scanner_tokens_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scanner_tokens_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "business_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      stamps: {
        Row: {
          business_id: string
          customer_id: string
          id: string
          idempotency_key: string | null
          is_reward_redemption: boolean | null
          metadata: Json | null
          stamped_at: string | null
          stamped_by: string | null
          stamps_after: number
          stamps_before: number
        }
        Insert: {
          business_id: string
          customer_id: string
          id?: string
          idempotency_key?: string | null
          is_reward_redemption?: boolean | null
          metadata?: Json | null
          stamped_at?: string | null
          stamped_by?: string | null
          stamps_after: number
          stamps_before: number
        }
        Update: {
          business_id?: string
          customer_id?: string
          id?: string
          idempotency_key?: string | null
          is_reward_redemption?: boolean | null
          metadata?: Json | null
          stamped_at?: string | null
          stamped_by?: string | null
          stamps_after?: number
          stamps_before?: number
        }
        Relationships: [
          {
            foreignKeyName: "stamps_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamps_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_stamp_with_outbox: {
        Args: {
          p_business_id: string
          p_customer_id: string
          p_idempotency_key?: string
          p_stamped_by?: string
        }
        Returns: {
          is_reward_earned: boolean
          new_stamps_count: number
          stamp_id: string
        }[]
      }
      complete_onboarding: {
        Args: { p_business_id: string }
        Returns: undefined
      }
      generate_scanner_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_customer_business: {
        Args: { customer_id_param: string }
        Returns: string
      }
      is_business_owner: {
        Args: { business_id_param: string }
        Returns: boolean
      }
      track_onboarding_step: {
        Args: {
          p_business_id: string
          p_metadata?: Json
          p_step_name: string
          p_step_number: number
          p_time_spent_seconds?: number
        }
        Returns: string
      }
      validate_scanner_token: {
        Args: { token_string: string }
        Returns: {
          business_id: string
          business_name: string
          is_valid: boolean
          location_name: string
          token_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
