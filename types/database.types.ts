export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrderProcessStatus =
  Database["public"]["Enums"]["process_status"]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      equipment_loans: {
        Row: {
          borrower_name: string
          created_at: string
          equipment_name: string
          equipment_slug: string
          id: string
          notes: string | null
          phone: string
          quantity: number
          return_date: string
          start_date: string
          status: string
        }
        Insert: {
          borrower_name: string
          created_at?: string
          equipment_name: string
          equipment_slug: string
          id?: string
          notes?: string | null
          phone: string
          quantity?: number
          return_date: string
          start_date: string
          status?: string
        }
        Update: {
          borrower_name?: string
          created_at?: string
          equipment_name?: string
          equipment_slug?: string
          id?: string
          notes?: string | null
          phone?: string
          quantity?: number
          return_date?: string
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      order_logs: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["process_status"]
          note: string | null
          old_status: Database["public"]["Enums"]["process_status"] | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["process_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["process_status"] | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["process_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["process_status"] | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      laundry_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          processing_method: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          processing_method?: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          processing_method?: string
          slug?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_name: string
          order_id: string
          processing_method: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_name: string
          order_id: string
          processing_method?: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_name?: string
          order_id?: string
          processing_method?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "laundry_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          archived_at: string | null
          capacity_approval_status: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED"
          contact_phone: string
          created_at: string
          customer_id: string | null
          customer_message: string | null
          customer_name: string | null
          estimated_done_at: string | null
          handled_by: string | null
          id: string
          notes: string | null
          order_code: string
          order_type: "KILOAN" | "SATUAN"
          paid_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          pickup_address: string
          pickup_at: string | null
          price_quote_status: "MENUNGGU_TIMBANG" | "MENUNGGU_PERSETUJUAN" | "DISETUJUI" | "DITOLAK"
          process_status: Database["public"]["Enums"]["process_status"]
          service_id: string | null
          service_price_per_kg: number | null
          total_price: number | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          archived_at?: string | null
          capacity_approval_status?: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED"
          contact_phone: string
          created_at?: string
          customer_id?: string | null
          customer_message?: string | null
          customer_name?: string | null
          estimated_done_at?: string | null
          handled_by?: string | null
          id?: string
          notes?: string | null
          order_code: string
          order_type?: "KILOAN" | "SATUAN"
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pickup_address: string
          pickup_at?: string | null
          price_quote_status?: "MENUNGGU_TIMBANG" | "MENUNGGU_PERSETUJUAN" | "DISETUJUI" | "DITOLAK"
          process_status?: Database["public"]["Enums"]["process_status"]
          service_id?: string | null
          service_price_per_kg?: number | null
          total_price?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          archived_at?: string | null
          capacity_approval_status?: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED"
          contact_phone?: string
          created_at?: string
          customer_id?: string | null
          customer_message?: string | null
          customer_name?: string | null
          estimated_done_at?: string | null
          handled_by?: string | null
          id?: string
          notes?: string | null
          order_code?: string
          order_type?: "KILOAN" | "SATUAN"
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pickup_address?: string
          pickup_at?: string | null
          price_quote_status?: "MENUNGGU_TIMBANG" | "MENUNGGU_PERSETUJUAN" | "DISETUJUI" | "DITOLAK"
          process_status?: Database["public"]["Enums"]["process_status"]
          service_id?: string | null
          service_price_per_kg?: number | null
          total_price?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      laundry_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "laundry_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          business_hours: Json
          daily_capacity_kg: number
          id: number
          is_accepting_orders: boolean
          updated_at: string
        }
        Insert: {
          business_hours?: Json
          daily_capacity_kg?: number
          id?: number
          is_accepting_orders?: boolean
          updated_at?: string
        }
        Update: {
          business_hours?: Json
          daily_capacity_kg?: number
          id?: number
          is_accepting_orders?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      b2b_equipment: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number | null
          price_unit: "hari" | "minggu" | "bulan" | null
          quantity_available: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
          price_unit?: "hari" | "minggu" | "bulan" | null
          quantity_available?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
          price_unit?: "hari" | "minggu" | "bulan" | null
          quantity_available?: number
          updated_at?: string
        }
        Relationships: []
      }
      equipment_loans: {
        Row: {
          borrower_name: string
          created_at: string
          equipment_name: string
          equipment_slug: string
          id: string
          notes: string | null
          phone: string
          quantity: number
          return_date: string
          start_date: string
          status: "MENUNGGU" | "DISETUJUI" | "DIKEMBALIKAN" | "DITOLAK"
        }
        Insert: {
          borrower_name: string
          created_at?: string
          equipment_name: string
          equipment_slug: string
          id?: string
          notes?: string | null
          phone: string
          quantity?: number
          return_date: string
          start_date: string
          status?: "MENUNGGU" | "DISETUJUI" | "DIKEMBALIKAN" | "DITOLAK"
        }
        Update: {
          borrower_name?: string
          created_at?: string
          equipment_name?: string
          equipment_slug?: string
          id?: string
          notes?: string | null
          phone?: string
          quantity?: number
          return_date?: string
          start_date?: string
          status?: "MENUNGGU" | "DISETUJUI" | "DIKEMBALIKAN" | "DITOLAK"
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          estimated_days: number
          id: string
          is_active: boolean
          name: string
          price_per_kg: number
          slug: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_days: number
          id?: string
          is_active?: boolean
          name: string
          price_per_kg: number
          slug?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_days?: number
          id?: string
          is_active?: boolean
          name?: string
          price_per_kg?: number
          slug?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard_metrics: {
        Args: {
          p_end: string
          p_start: string
        }
        Returns: {
          pending_approval_count: number
          paid_revenue: number
          total_orders: number
          used_today_kg: number
        }[]
      }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      payment_status: "UNPAID" | "PAID"
      process_status:
        | "MENUNGGU"
        | "DITERIMA"
        | "DIPROSES"
        | "DICUCI"
        | "DISETRIKA"
        | "SIAP_DIAMBIL"
        | "SELESAI"
        | "DIBATALKAN"
      user_role: "admin" | "petugas" | "pelanggan"
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
  public: {
    Enums: {
      payment_status: ["UNPAID", "PAID"],
      process_status: [
        "MENUNGGU",
        "DITERIMA",
        "DIPROSES",
        "DICUCI",
        "DISETRIKA",
        "SIAP_DIAMBIL",
        "SELESAI",
        "DIBATALKAN",
      ],
      user_role: ["admin", "petugas", "pelanggan"],
    },
  },
} as const
