export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          business_id: string | null
          created_at: string
          event_type: string
          fingerprint: string | null
          id: string
          link_id: string | null
          metadata: Json
          page_id: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          event_type: string
          fingerprint?: string | null
          id?: string
          link_id?: string | null
          metadata?: Json
          page_id?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          event_type?: string
          fingerprint?: string | null
          id?: string
          link_id?: string | null
          metadata?: Json
          page_id?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "page_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_pages: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          theme_config: Json
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          theme_config?: Json
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          theme_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_pages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          created_at: string
          frozen_at: string | null
          frozen_reason: string | null
          google_place_id: string | null
          has_nfc_tag: boolean | null
          id: string
          is_featured: boolean | null
          is_frozen: boolean
          is_verified: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          plan_type: string | null
          slug: string
          updated_at: string
          verification_requested_at: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          frozen_at?: string | null
          frozen_reason?: string | null
          google_place_id?: string | null
          has_nfc_tag?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_frozen?: boolean
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          plan_type?: string | null
          slug: string
          updated_at?: string
          verification_requested_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          frozen_at?: string | null
          frozen_reason?: string | null
          google_place_id?: string | null
          has_nfc_tag?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_frozen?: boolean
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan_type?: string | null
          slug?: string
          updated_at?: string
          verification_requested_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action_type: string
          admin_user_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          reason: string
          target_user_id: string
        }
        Insert: {
          action_type: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason: string
          target_user_id: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_appeals: {
        Row: {
          admin_response: string | null
          created_at: string
          id: string
          message: string
          moderation_action_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message: string
          moderation_action_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message?: string
          moderation_action_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_appeals_moderation_action_id_fkey"
            columns: ["moderation_action_id"]
            isOneToOne: false
            referencedRelation: "moderation_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_appeals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_appeals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_links: {
        Row: {
          created_at: string
          icon_name: string | null
          id: string
          is_active: boolean
          page_id: string
          sort_order: number
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          page_id: string
          sort_order?: number
          title: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          page_id?: string
          sort_order?: number
          title?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_links_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          banned_at: string | null
          banned_reason: string | null
          blocked_at: string | null
          blocked_reason: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_blocked: boolean
          is_deleted: boolean
          last_login_at: string | null
          last_warning_at: string | null
          role: string
          suspended_until: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string | null
          username: string | null
          warning_count: number
          website: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_blocked?: boolean
          is_deleted?: boolean
          last_login_at?: string | null
          last_warning_at?: string | null
          role?: string
          suspended_until?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string | null
          username?: string | null
          warning_count?: number
          website?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          is_deleted?: boolean
          last_login_at?: string | null
          last_warning_at?: string | null
          role?: string
          suspended_until?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string | null
          username?: string | null
          warning_count?: number
          website?: string | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          business_id: string
          created_at: string
          id: string
          review_link_id: string
          style_config: Json
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          review_link_id: string
          style_config?: Json
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          review_link_id?: string
          style_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_review_link_id_fkey"
            columns: ["review_link_id"]
            isOneToOne: false
            referencedRelation: "review_links"
            referencedColumns: ["id"]
          },
        ]
      }
      review_links: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean
          redirect_url: string
          slug: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          redirect_url: string
          slug: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          redirect_url?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_links_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          browser_fingerprint: string | null
          business_id: string
          created_at: string
          auth_provider: string | null
          customer_email: string | null
          customer_name: string | null
          display_name: string | null
          feedback: string | null
          id: string
          is_internal: boolean
          rating: number
          source: string
          submission_fingerprint: string | null
          user_id: string | null
        }
        Insert: {
          auth_provider?: string | null
          browser_fingerprint?: string | null
          business_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          display_name?: string | null
          feedback?: string | null
          id?: string
          is_internal?: boolean
          rating: number
          source?: string
          submission_fingerprint?: string | null
          user_id?: string | null
        }
        Update: {
          auth_provider?: string | null
          browser_fingerprint?: string | null
          business_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          display_name?: string | null
          feedback?: string | null
          id?: string
          is_internal?: boolean
          rating?: number
          source?: string
          submission_fingerprint?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          admin_response: string | null
          business_id: string
          created_at: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          business_id: string
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          business_id?: string
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_review_abuse: {
        Args: {
          target_business_id: string
          target_feedback?: string
          target_fingerprint: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_business_frozen: { Args: { b_id: string }; Returns: boolean }
      is_slug_available: {
        Args: { exclude_business_id?: string; slug_to_check: string }
        Returns: boolean
      }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
      is_suspended: { Args: { u_id: string }; Returns: boolean }
    }
    Enums: {
      user_role: "reviewer" | "customer" | "admin" | "super_admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["reviewer", "customer", "admin", "super_admin"],
    },
  },
} as const
