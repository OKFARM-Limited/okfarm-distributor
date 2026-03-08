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
      allocation_items: {
        Row: {
          allocation_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          allocation_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          allocation_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "allocation_items_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      allocations: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          outlet_id: string | null
          status: string
          total_value: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          outlet_id?: string | null
          status?: string
          total_value?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          outlet_id?: string | null
          status?: string
          total_value?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocations_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
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
      check_ins: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          outlet_id: string | null
          vendor_id: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          outlet_id?: string | null
          vendor_id: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          outlet_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          attendance_bonus: number
          avg_daily_sales: number
          consistency_bonus: number
          consistency_multiplier: number
          consistency_rate: number
          created_at: string
          days_active: number
          days_worked: number
          id: string
          month: string
          outlet_id: string | null
          status: string
          tier: string
          total_commission: number
          total_sales: number
          updated_at: string
          vendor_id: string
          volume_bonus: number
        }
        Insert: {
          attendance_bonus?: number
          avg_daily_sales?: number
          consistency_bonus?: number
          consistency_multiplier?: number
          consistency_rate?: number
          created_at?: string
          days_active?: number
          days_worked?: number
          id?: string
          month: string
          outlet_id?: string | null
          status?: string
          tier?: string
          total_commission?: number
          total_sales?: number
          updated_at?: string
          vendor_id: string
          volume_bonus?: number
        }
        Update: {
          attendance_bonus?: number
          avg_daily_sales?: number
          consistency_bonus?: number
          consistency_multiplier?: number
          consistency_rate?: number
          created_at?: string
          days_active?: number
          days_worked?: number
          id?: string
          month?: string
          outlet_id?: string | null
          status?: string
          tier?: string
          total_commission?: number
          total_sales?: number
          updated_at?: string
          vendor_id?: string
          volume_bonus?: number
        }
        Relationships: [
          {
            foreignKeyName: "commissions_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
      payments: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          method: string
          notes: string | null
          outlet_id: string | null
          phone_number: string | null
          provider: string | null
          reference: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          method?: string
          notes?: string | null
          outlet_id?: string | null
          phone_number?: string | null
          provider?: string | null
          reference?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          method?: string
          notes?: string | null
          outlet_id?: string | null
          phone_number?: string | null
          provider?: string | null
          reference?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          commission_id: string
          created_at: string
          disbursed_at: string | null
          id: string
          method: string | null
          reference: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          amount?: number
          commission_id: string
          created_at?: string
          disbursed_at?: string | null
          id?: string
          method?: string | null
          reference?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          commission_id?: string
          created_at?: string
          disbursed_at?: string | null
          id?: string
          method?: string | null
          reference?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
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
      reconciliation_items: {
        Row: {
          allocated_qty: number
          created_at: string
          id: string
          product_id: string
          reconciliation_id: string
          returned_qty: number
          sold_qty: number
          spoilage_qty: number
          unit_price: number
        }
        Insert: {
          allocated_qty?: number
          created_at?: string
          id?: string
          product_id: string
          reconciliation_id: string
          returned_qty?: number
          sold_qty?: number
          spoilage_qty?: number
          unit_price?: number
        }
        Update: {
          allocated_qty?: number
          created_at?: string
          id?: string
          product_id?: string
          reconciliation_id?: string
          returned_qty?: number
          sold_qty?: number
          spoilage_qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_items_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "reconciliations"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliations: {
        Row: {
          allocation_id: string
          cash_collected: number
          created_at: string
          date: string
          id: string
          notes: string | null
          outlet_id: string | null
          status: string
          total_returned: number
          total_sold: number
          total_spoilage: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          allocation_id: string
          cash_collected?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          outlet_id?: string | null
          status?: string
          total_returned?: number
          total_sold?: number
          total_spoilage?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          allocation_id?: string
          cash_collected?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          outlet_id?: string | null
          status?: string
          total_returned?: number
          total_sold?: number
          total_spoilage?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliations_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          sale_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          sale_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount_paid: number
          created_at: string
          date: string
          id: string
          notes: string | null
          outlet_id: string | null
          outstanding: number
          payment_method: string
          total_value: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          outlet_id?: string | null
          outstanding?: number
          payment_method?: string
          total_value?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          outlet_id?: string | null
          outstanding?: number
          payment_method?: string
          total_value?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_lines: {
        Row: {
          amount: number
          amount_paid: number
          created_at: string
          credit_days: number
          date: string
          due_date: string
          id: string
          invoice_number: string
          settlement_id: string
          status: string
        }
        Insert: {
          amount?: number
          amount_paid?: number
          created_at?: string
          credit_days?: number
          date: string
          due_date: string
          id?: string
          invoice_number: string
          settlement_id: string
          status?: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          created_at?: string
          credit_days?: number
          date?: string
          due_date?: string
          id?: string
          invoice_number?: string
          settlement_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_lines_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          created_at: string
          discount: number
          discount_rate: number
          id: string
          month: string
          net_payable: number
          notes: string | null
          outlet_id: string | null
          status: string
          total_paid: number
          total_receivable: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: number
          discount_rate?: number
          id?: string
          month: string
          net_payable?: number
          notes?: string | null
          outlet_id?: string | null
          status?: string
          total_paid?: number
          total_receivable?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: number
          discount_rate?: number
          id?: string
          month?: string
          net_payable?: number
          notes?: string | null
          outlet_id?: string | null
          status?: string
          total_paid?: number
          total_receivable?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
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
