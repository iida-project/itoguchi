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
  public: {
    Tables: {
      article_translations: {
        Row: {
          article_id: string
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_provisional: boolean
          is_published: boolean
          locale: string
          thumbnail_alt: string | null
          title: string
          updated_at: string
        }
        Insert: {
          article_id: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale: string
          thumbnail_alt?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale?: string
          thumbnail_alt?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          craft_id: string | null
          created_at: string
          id: string
          is_provisional: boolean
          published_at: string | null
          slug: string
          thumbnail: string | null
          updated_at: string
        }
        Insert: {
          craft_id?: string | null
          created_at?: string
          id?: string
          is_provisional?: boolean
          published_at?: string | null
          slug: string
          thumbnail?: string | null
          updated_at?: string
        }
        Update: {
          craft_id?: string | null
          created_at?: string
          id?: string
          is_provisional?: boolean
          published_at?: string | null
          slug?: string
          thumbnail?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_craft_id_fkey"
            columns: ["craft_id"]
            isOneToOne: false
            referencedRelation: "crafts"
            referencedColumns: ["id"]
          },
        ]
      }
      craft_step_translations: {
        Row: {
          craft_step_id: string
          created_at: string
          description: string | null
          id: string
          image_alt: string | null
          is_provisional: boolean
          is_published: boolean
          locale: string
          title: string | null
          updated_at: string
        }
        Insert: {
          craft_step_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_alt?: string | null
          is_provisional?: boolean
          is_published?: boolean
          locale: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          craft_step_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_alt?: string | null
          is_provisional?: boolean
          is_published?: boolean
          locale?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "craft_step_translations_craft_step_id_fkey"
            columns: ["craft_step_id"]
            isOneToOne: false
            referencedRelation: "craft_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      craft_steps: {
        Row: {
          craft_id: string
          created_at: string
          id: string
          image_url: string | null
          is_provisional: boolean
          position: number
          updated_at: string
        }
        Insert: {
          craft_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_provisional?: boolean
          position: number
          updated_at?: string
        }
        Update: {
          craft_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_provisional?: boolean
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "craft_steps_craft_id_fkey"
            columns: ["craft_id"]
            isOneToOne: false
            referencedRelation: "crafts"
            referencedColumns: ["id"]
          },
        ]
      }
      craft_translations: {
        Row: {
          craft_id: string
          created_at: string
          hero_image_alt: string | null
          history: string | null
          id: string
          is_provisional: boolean
          is_published: boolean
          locale: string
          name: string
          overview: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          craft_id: string
          created_at?: string
          hero_image_alt?: string | null
          history?: string | null
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale: string
          name: string
          overview?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          craft_id?: string
          created_at?: string
          hero_image_alt?: string | null
          history?: string | null
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale?: string
          name?: string
          overview?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "craft_translations_craft_id_fkey"
            columns: ["craft_id"]
            isOneToOne: false
            referencedRelation: "crafts"
            referencedColumns: ["id"]
          },
        ]
      }
      crafts: {
        Row: {
          created_at: string
          hero_image_url: string | null
          id: string
          is_provisional: boolean
          region: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_image_url?: string | null
          id?: string
          is_provisional?: boolean
          region?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_image_url?: string | null
          id?: string
          is_provisional?: boolean
          region?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_translations: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          is_provisional: boolean
          is_published: boolean
          locale: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_translations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          apply_note: string | null
          apply_url: string | null
          capacity_note: string | null
          craft_id: string | null
          created_at: string
          end_date: string | null
          fee_note: string | null
          group_id: string | null
          id: string
          is_provisional: boolean
          lat: number | null
          lng: number | null
          slug: string
          start_date: string
          status: string
          time_note: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          address?: string | null
          apply_note?: string | null
          apply_url?: string | null
          capacity_note?: string | null
          craft_id?: string | null
          created_at?: string
          end_date?: string | null
          fee_note?: string | null
          group_id?: string | null
          id?: string
          is_provisional?: boolean
          lat?: number | null
          lng?: number | null
          slug: string
          start_date: string
          status?: string
          time_note?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          address?: string | null
          apply_note?: string | null
          apply_url?: string | null
          capacity_note?: string | null
          craft_id?: string | null
          created_at?: string
          end_date?: string | null
          fee_note?: string | null
          group_id?: string | null
          id?: string
          is_provisional?: boolean
          lat?: number | null
          lng?: number | null
          slug?: string
          start_date?: string
          status?: string
          time_note?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_craft_id_fkey"
            columns: ["craft_id"]
            isOneToOne: false
            referencedRelation: "crafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_translations: {
        Row: {
          created_at: string
          description: string | null
          experience_id: string
          id: string
          is_provisional: boolean
          is_published: boolean
          locale: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          experience_id: string
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          experience_id?: string
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_translations_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          apply_method: string | null
          availability: string
          craft_id: string
          created_at: string
          duration_note: string | null
          group_id: string | null
          id: string
          is_provisional: boolean
          price_note: string | null
          season_note: string | null
          updated_at: string
        }
        Insert: {
          apply_method?: string | null
          availability: string
          craft_id: string
          created_at?: string
          duration_note?: string | null
          group_id?: string | null
          id?: string
          is_provisional?: boolean
          price_note?: string | null
          season_note?: string | null
          updated_at?: string
        }
        Update: {
          apply_method?: string | null
          availability?: string
          craft_id?: string
          created_at?: string
          duration_note?: string | null
          group_id?: string | null
          id?: string
          is_provisional?: boolean
          price_note?: string | null
          season_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_craft_id_fkey"
            columns: ["craft_id"]
            isOneToOne: false
            referencedRelation: "crafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      glossary: {
        Row: {
          created_at: string
          en: string | null
          id: string
          ja: string
          note: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          en?: string | null
          id?: string
          ja: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          en?: string | null
          id?: string
          ja?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      group_translations: {
        Row: {
          created_at: string
          description: string | null
          group_id: string
          id: string
          is_provisional: boolean
          is_published: boolean
          locale: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_translations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          id: string
          is_provisional: boolean
          lat: number | null
          lng: number | null
          slug: string
          sns_urls: string[]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          is_provisional?: boolean
          lat?: number | null
          lng?: number | null
          slug: string
          sns_urls?: string[]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          is_provisional?: boolean
          lat?: number | null
          lng?: number | null
          slug?: string
          sns_urls?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      spot_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_provisional: boolean
          is_published: boolean
          locale: string
          name: string | null
          spot_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale: string
          name?: string | null
          spot_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_provisional?: boolean
          is_published?: boolean
          locale?: string
          name?: string | null
          spot_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spot_translations_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spots: {
        Row: {
          address: string | null
          craft_id: string
          created_at: string
          id: string
          is_provisional: boolean
          lat: number | null
          lng: number | null
          name: string | null
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          address?: string | null
          craft_id: string
          created_at?: string
          id?: string
          is_provisional?: boolean
          lat?: number | null
          lng?: number | null
          name?: string | null
          type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          address?: string | null
          craft_id?: string
          created_at?: string
          id?: string
          is_provisional?: boolean
          lat?: number | null
          lng?: number | null
          name?: string | null
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spots_craft_id_fkey"
            columns: ["craft_id"]
            isOneToOne: false
            referencedRelation: "crafts"
            referencedColumns: ["id"]
          },
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
