export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          business_id: string | null
          created_at: string
          event_type: string
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
          }
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
          }
        ]
      }
      businesses: {
        Row: {
          address: string | null
          created_at: string
          google_place_id: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          updated_at: string
          is_verified: boolean
          is_featured: boolean
          has_nfc_tag: boolean
          plan_type: string
          verified_at: string | null
          verified_by: string | null
          verification_status: string
          verification_requested_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          google_place_id?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          updated_at?: string
          is_verified?: boolean
          is_featured?: boolean
          has_nfc_tag?: boolean
          plan_type?: string
          verified_at?: string | null
          verified_by?: string | null
          verification_status?: string
          verification_requested_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          google_place_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
          is_verified?: boolean
          is_featured?: boolean
          has_nfc_tag?: boolean
          plan_type?: string
          verified_at?: string | null
          verified_by?: string | null
          verification_status?: string
          verification_requested_at?: string | null
        }
        Relationships: []
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
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
          username: string | null
          website: string | null
          email: string | null
          is_blocked: boolean
          blocked_at: string | null
          blocked_reason: string | null
          last_login_at: string | null
          created_at: string
          account_status: string | null
          suspended_until: string | null
          warning_count: number
          banned_at: string | null
          banned_reason: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
          email?: string | null
          is_blocked?: boolean
          blocked_at?: string | null
          blocked_reason?: string | null
          last_login_at?: string | null
          created_at?: string
          account_status?: string | null
          suspended_until?: string | null
          warning_count?: number
          banned_at?: string | null
          banned_reason?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
          email?: string | null
          is_blocked?: boolean
          blocked_at?: string | null
          blocked_reason?: string | null
          last_login_at?: string | null
          created_at?: string
          account_status?: string | null
          suspended_until?: string | null
          warning_count?: number
          banned_at?: string | null
          banned_reason?: string | null
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
        Relationships: []
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
        Relationships: []
      }
      reviews: {
        Row: {
          business_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          feedback: string | null
          id: string
          is_internal: boolean
          rating: number
          source: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          feedback?: string | null
          id?: string
          is_internal?: boolean
          rating: number
          source?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          feedback?: string | null
          id?: string
          is_internal?: boolean
          rating?: number
          source?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          id: string
          business_id: string
          user_id: string
          status: string
          message: string | null
          admin_response: string | null
          created_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          status?: string
          message?: string | null
          admin_response?: string | null
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          status?: string
          message?: string | null
          admin_response?: string | null
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
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
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
