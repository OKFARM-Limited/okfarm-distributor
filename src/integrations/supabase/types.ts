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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          asset_code: string
          assigned_to: string | null
          condition: string
          condition_history: Json | null
          created_at: string
          id: string
          maintenance_history: Json | null
          name: string
          next_maintenance_date: string | null
          outlet_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          asset_code: string
          assigned_to?: string | null
          condition?: string
          condition_history?: Json | null
          created_at?: string
          id?: string
          maintenance_history?: Json | null
          name: string
          next_maintenance_date?: string | null
          outlet_id?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          asset_code?: string
          assigned_to?: string | null
          condition?: string
          condition_history?: Json | null
          created_at?: string
          id?: string
          maintenance_history?: Json | null
          name?: string
          next_maintenance_date?: string | null
          outlet_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      depots: {
        Row: {
          address: string | null
          asset_count: number | null
          created_at: string
          depot_code: string
          fridge_capacity: number | null
          id: string
          manager: string | null
          name: string
          outlet_id: string | null
          phone: string | null
          status: string
          territory: string | null
          updated_at: string
          vendor_count: number | null
        }
        Insert: {
          address?: string | null
          asset_count?: number | null
          created_at?: string
          depot_code: string
          fridge_capacity?: number | null
          id?: string
          manager?: string | null
          name: string
          outlet_id?: string | null
          phone?: string | null
          status?: string
          territory?: string | null
          updated_at?: string
          vendor_count?: number | null
        }
        Update: {
          address?: string | null
          asset_count?: number | null
          created_at?: string
          depot_code?: string
          fridge_capacity?: number | null
          id?: string
          manager?: string | null
          name?: string
          outlet_id?: string | null
          phone?: string | null
          status?: string
          territory?: string | null
          updated_at?: string
          vendor_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "depots_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      outlets: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          manager: string | null
          name: string
          phone: string | null
          short_code: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manager?: string | null
          name: string
          phone?: string | null
          short_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manager?: string | null
          name?: string
          phone?: string | null
          short_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          category: string
          created_at: string
          id: string
          name: string
          sku: string
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category: string
          created_at?: string
          id?: string
          name: string
          sku: string
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category?: string
          created_at?: string
          id?: string
          name?: string
          sku?: string
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_name: string | null
          biometrics_enabled: boolean | null
          created_at: string
          date_of_birth: string | null
          days_worked: number | null
          education_level: string | null
          email: string | null
          gender: string | null
          guarantor_name: string | null
          guarantor_phone: string | null
          health_status: string | null
          id: string
          join_date: string | null
          languages: string[] | null
          marital_status: string | null
          mobile_money_number: string | null
          name: string
          national_id: string | null
          next_of_kin: string | null
          next_of_kin_phone: string | null
          notes: string | null
          outlet_id: string | null
          phone: string | null
          photo_url: string | null
          status: string
          territory: string | null
          total_sales: number | null
          uniform_size: string | null
          updated_at: string
          vendor_code: string
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          biometrics_enabled?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          days_worked?: number | null
          education_level?: string | null
          email?: string | null
          gender?: string | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          health_status?: string | null
          id?: string
          join_date?: string | null
          languages?: string[] | null
          marital_status?: string | null
          mobile_money_number?: string | null
          name: string
          national_id?: string | null
          next_of_kin?: string | null
          next_of_kin_phone?: string | null
          notes?: string | null
          outlet_id?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string
          territory?: string | null
          total_sales?: number | null
          uniform_size?: string | null
          updated_at?: string
          vendor_code: string
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          biometrics_enabled?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          days_worked?: number | null
          education_level?: string | null
          email?: string | null
          gender?: string | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          health_status?: string | null
          id?: string
          join_date?: string | null
          languages?: string[] | null
          marital_status?: string | null
          mobile_money_number?: string | null
          name?: string
          national_id?: string | null
          next_of_kin?: string | null
          next_of_kin_phone?: string | null
          notes?: string | null
          outlet_id?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string
          territory?: string | null
          total_sales?: number | null
          uniform_size?: string | null
          updated_at?: string
          vendor_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "assistant"
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
    Enums: {
      app_role: ["admin", "assistant"],
    },
  },
} as const
