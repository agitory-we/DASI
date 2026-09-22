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
    PostgrestVersion: "14.5"
  }
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
      analog_spots: {
        Row: {
          address: string
          area: string
          category: string
          contact: string
          created_at: string | null
          film_stock_status: string | null
          id: string
          is_micro_ad_partner: boolean
          lat: number
          lng: number
          name: string
          open_hours: string
          partner_badge_text: string | null
          promo_notice: string | null
          rating: number
          reviews_count: number
          sample_color_tone_images: Json
          scanner_types: Json
          today_scan_cutoff: string | null
        }
        Insert: {
          address: string
          area: string
          category: string
          contact?: string
          created_at?: string | null
          film_stock_status?: string | null
          id: string
          is_micro_ad_partner?: boolean
          lat: number
          lng: number
          name: string
          open_hours?: string
          partner_badge_text?: string | null
          promo_notice?: string | null
          rating?: number
          reviews_count?: number
          sample_color_tone_images?: Json
          scanner_types?: Json
          today_scan_cutoff?: string | null
        }
        Update: {
          address?: string
          area?: string
          category?: string
          contact?: string
          created_at?: string | null
          film_stock_status?: string | null
          id?: string
          is_micro_ad_partner?: boolean
          lat?: number
          lng?: number
          name?: string
          open_hours?: string
          partner_badge_text?: string | null
          promo_notice?: string | null
          rating?: number
          reviews_count?: number
          sample_color_tone_images?: Json
          scanner_types?: Json
          today_scan_cutoff?: string | null
        }
        Relationships: []
      }
      cameras: {
        Row: {
          brand: string
          category: string
          condition_grade: string
          created_at: string | null
          description: string
          era: string
          id: string
          image_url: string
          is_available: boolean
          name: string
          pickup_location: string
          purchase_price: number
          rating: number
          rental_price_per_day: number
          reviews_count: number
          sample_images: Json
          shop_id: string | null
          shop_name: string
          specs: Json
          story: string
        }
        Insert: {
          brand: string
          category: string
          condition_grade: string
          created_at?: string | null
          description?: string
          era?: string
          id: string
          image_url?: string
          is_available?: boolean
          name: string
          pickup_location?: string
          purchase_price?: number
          rating?: number
          rental_price_per_day?: number
          reviews_count?: number
          sample_images?: Json
          shop_id?: string | null
          shop_name?: string
          specs?: Json
          story?: string
        }
        Update: {
          brand?: string
          category?: string
          condition_grade?: string
          created_at?: string | null
          description?: string
          era?: string
          id?: string
          image_url?: string
          is_available?: boolean
          name?: string
          pickup_location?: string
          purchase_price?: number
          rating?: number
          rental_price_per_day?: number
          reviews_count?: number
          sample_images?: Json
          shop_id?: string | null
          shop_name?: string
          specs?: Json
          story?: string
        }
        Relationships: [
          {
            foreignKeyName: "cameras_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "pickup_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          capacity: string
          created_at: string | null
          date_time: string
          description: string
          duration: string
          host_avatar: string
          host_name: string
          host_role: string
          id: string
          image_url: string
          included: Json
          location: string
          price: number
          rental_package_discount: string
          title: string
          type: string
        }
        Insert: {
          capacity?: string
          created_at?: string | null
          date_time: string
          description?: string
          duration: string
          host_avatar?: string
          host_name: string
          host_role: string
          id: string
          image_url?: string
          included?: Json
          location: string
          price?: number
          rental_package_discount?: string
          title: string
          type: string
        }
        Update: {
          capacity?: string
          created_at?: string | null
          date_time?: string
          description?: string
          duration?: string
          host_avatar?: string
          host_name?: string
          host_role?: string
          id?: string
          image_url?: string
          included?: Json
          location?: string
          price?: number
          rental_package_discount?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      photo_gigs: {
        Row: {
          category: string
          created_at: string | null
          creator_avatar: string
          creator_name: string
          description: string
          duration_minutes: number
          gear_used: Json
          id: string
          is_verified: boolean
          languages: Json
          location: string
          portfolio_images: Json
          price_per_hour: number
          rating: number
          reviews_count: number
          tags: Json
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          creator_avatar?: string
          creator_name: string
          description?: string
          duration_minutes?: number
          gear_used?: Json
          id: string
          is_verified?: boolean
          languages?: Json
          location: string
          portfolio_images?: Json
          price_per_hour?: number
          rating?: number
          reviews_count?: number
          tags?: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          creator_avatar?: string
          creator_name?: string
          description?: string
          duration_minutes?: number
          gear_used?: Json
          id?: string
          is_verified?: boolean
          languages?: Json
          location?: string
          portfolio_images?: Json
          price_per_hour?: number
          rating?: number
          reviews_count?: number
          tags?: Json
          title?: string
        }
        Relationships: []
      }
      pickup_shops: {
        Row: {
          address: string
          area: string
          contact: string
          created_at: string | null
          id: string
          image_url: string
          lat: number
          lng: number
          master_experience_years: number
          master_name: string
          master_quote: string
          name: string
          open_hours: string
        }
        Insert: {
          address: string
          area: string
          contact?: string
          created_at?: string | null
          id: string
          image_url?: string
          lat: number
          lng: number
          master_experience_years?: number
          master_name: string
          master_quote?: string
          name: string
          open_hours?: string
        }
        Update: {
          address?: string
          area?: string
          contact?: string
          created_at?: string | null
          id?: string
          image_url?: string
          lat?: number
          lng?: number
          master_experience_years?: number
          master_name?: string
          master_quote?: string
          name?: string
          open_hours?: string
        }
        Relationships: []
      }
      rentals: {
        Row: {
          booked_at: string | null
          brand: string
          camera_id: string | null
          camera_name: string
          created_at: string | null
          id: string
          image_url: string
          is_converted_to_own: boolean
          purchase_total: number
          rental_days: number
          rental_paid: number
          shop_name: string
        }
        Insert: {
          booked_at?: string | null
          brand: string
          camera_id?: string | null
          camera_name: string
          created_at?: string | null
          id: string
          image_url?: string
          is_converted_to_own?: boolean
          purchase_total?: number
          rental_days?: number
          rental_paid?: number
          shop_name: string
        }
        Update: {
          booked_at?: string | null
          brand?: string
          camera_id?: string | null
          camera_name?: string
          created_at?: string | null
          id?: string
          image_url?: string
          is_converted_to_own?: boolean
          purchase_total?: number
          rental_days?: number
          rental_paid?: number
          shop_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "cameras"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_estimates: {
        Row: {
          camera_model: string
          created_at: string | null
          details: string
          estimate_code: string
          id: string
          master_name: string
          status: string
          symptoms: Json
        }
        Insert: {
          camera_model: string
          created_at?: string | null
          details?: string
          estimate_code?: string
          id: string
          master_name?: string
          status?: string
          symptoms?: Json
        }
        Update: {
          camera_model?: string
          created_at?: string | null
          details?: string
          estimate_code?: string
          id?: string
          master_name?: string
          status?: string
          symptoms?: Json
        }
        Relationships: []
      }
      repair_masters: {
        Row: {
          address: string
          available_services: Json
          created_at: string | null
          experience_years: number
          id: string
          location: string
          name: string
          profile_image: string
          quote: string
          shop_name: string
          specialty: string
        }
        Insert: {
          address: string
          available_services?: Json
          created_at?: string | null
          experience_years?: number
          id: string
          location: string
          name: string
          profile_image?: string
          quote?: string
          shop_name: string
          specialty: string
        }
        Update: {
          address?: string
          available_services?: Json
          created_at?: string | null
          experience_years?: number
          id?: string
          location?: string
          name?: string
          profile_image?: string
          quote?: string
          shop_name?: string
          specialty?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          area: string | null
          created_at: string | null
          end_date: string
          id: string
          image_url: string | null
          lat: number | null
          lng: number | null
          location: string
          source: string
          source_id: string
          start_date: string
          title: string
        }
        Insert: {
          area?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
          location: string
          source?: string
          source_id: string
          start_date: string
          title: string
        }
        Update: {
          area?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
          location?: string
          source?: string
          source_id?: string
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      daily_golden_hour: {
        Row: {
          created_at: string | null
          date: string
          evening_golden_end: string
          evening_golden_start: string
          id: string
          location: string
          morning_golden_end: string
          morning_golden_start: string
          sunrise: string
          sunset: string
        }
        Insert: {
          created_at?: string | null
          date: string
          evening_golden_end: string
          evening_golden_start: string
          id?: string
          location?: string
          morning_golden_end: string
          morning_golden_start: string
          sunrise: string
          sunset: string
        }
        Update: {
          created_at?: string | null
          date?: string
          evening_golden_end?: string
          evening_golden_start?: string
          id?: string
          location?: string
          morning_golden_end?: string
          morning_golden_start?: string
          sunrise?: string
          sunset?: string
        }
        Relationships: []
      }
      photo_spots: {
        Row: {
          address: string
          area: string
          created_at: string | null
          description: string | null
          golden_hour_tips: string | null
          id: string
          image_url: string | null
          is_verified: boolean
          lat: number
          lng: number
          name: string
          recommended_lenses: string | null
        }
        Insert: {
          address: string
          area: string
          created_at?: string | null
          description?: string | null
          golden_hour_tips?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean
          lat: number
          lng: number
          name: string
          recommended_lenses?: string | null
        }
        Update: {
          address?: string
          area?: string
          created_at?: string | null
          description?: string | null
          golden_hour_tips?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean
          lat?: number
          lng?: number
          name?: string
          recommended_lenses?: string | null
        }
        Relationships: []
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    Enums: {},
  },
} as const