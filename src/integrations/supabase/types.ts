export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      app_settings: {
        Row: {
          account_name: string;
          account_number: string;
          bank_name: string;
          delivery_fee_ngn: number;
          id: string;
          updated_at: string;
        };
        Insert: {
          account_name?: string;
          account_number?: string;
          bank_name?: string;
          delivery_fee_ngn?: number;
          id?: string;
          updated_at?: string;
        };
        Update: {
          account_name?: string;
          account_number?: string;
          bank_name?: string;
          delivery_fee_ngn?: number;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          phone: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          phone?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      custom_orders: {
        Row: {
          additional_notes: string | null;
          ai_idea: string | null;
          budget: string | null;
          clothing_type: string;
          created_at: string;
          deadline: string | null;
          design_description: string | null;
          design_file_url: string | null;
          email: string;
          full_name: string;
          id: string;
          preferred_color: string | null;
          print_position: string | null;
          print_text: string | null;
          quantity: number | null;
          size: string | null;
          whatsapp: string;
        };
        Insert: {
          additional_notes?: string | null;
          ai_idea?: string | null;
          budget?: string | null;
          clothing_type: string;
          created_at?: string;
          deadline?: string | null;
          design_description?: string | null;
          design_file_url?: string | null;
          email: string;
          full_name: string;
          id?: string;
          preferred_color?: string | null;
          print_position?: string | null;
          print_text?: string | null;
          quantity?: number | null;
          size?: string | null;
          whatsapp: string;
        };
        Update: {
          additional_notes?: string | null;
          ai_idea?: string | null;
          budget?: string | null;
          clothing_type?: string;
          created_at?: string;
          deadline?: string | null;
          design_description?: string | null;
          design_file_url?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          preferred_color?: string | null;
          print_position?: string | null;
          print_text?: string | null;
          quantity?: number | null;
          size?: string | null;
          whatsapp?: string;
        };
        Relationships: [];
      };
      delivery_zones: {
        Row: {
          area_name: string;
          created_at: string;
          fee_ngn: number;
          id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          area_name: string;
          created_at?: string;
          fee_ngn?: number;
          id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          area_name?: string;
          created_at?: string;
          fee_ngn?: number;
          id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_send_log: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          message_id: string | null;
          metadata: Json | null;
          recipient_email: string;
          status: string;
          template_name: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message_id?: string | null;
          metadata?: Json | null;
          recipient_email: string;
          status: string;
          template_name: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message_id?: string | null;
          metadata?: Json | null;
          recipient_email?: string;
          status?: string;
          template_name?: string;
        };
        Relationships: [];
      };
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number;
          batch_size: number;
          id: number;
          retry_after_until: string | null;
          send_delay_ms: number;
          transactional_email_ttl_minutes: number;
          updated_at: string;
        };
        Insert: {
          auth_email_ttl_minutes?: number;
          batch_size?: number;
          id?: number;
          retry_after_until?: string | null;
          send_delay_ms?: number;
          transactional_email_ttl_minutes?: number;
          updated_at?: string;
        };
        Update: {
          auth_email_ttl_minutes?: number;
          batch_size?: number;
          id?: number;
          retry_after_until?: string | null;
          send_delay_ms?: number;
          transactional_email_ttl_minutes?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_unsubscribe_tokens: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          token: string;
          used_at: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          token: string;
          used_at?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          token?: string;
          used_at?: string | null;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          color: string | null;
          created_at: string;
          custom_design_url: string | null;
          customization_notes: string | null;
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          size: string | null;
          unit_price_ngn: number;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          custom_design_url?: string | null;
          customization_notes?: string | null;
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity?: number;
          size?: string | null;
          unit_price_ngn?: number;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          custom_design_url?: string | null;
          customization_notes?: string | null;
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          size?: string | null;
          unit_price_ngn?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address: string;
          city: string;
          created_at: string;
          delivery_area: string | null;
          delivery_fee_ngn: number;
          delivery_fee_status: string;
          delivery_option: string;
          email: string;
          full_name: string;
          id: string;
          notes: string | null;
          payment_method: string;
          payment_status: string;
          phone: string;
          receipt_url: string | null;
          reference: string;
          state: string;
          status: string;
          subtotal_ngn: number;
          total_ngn: number;
          updated_at: string;
          whatsapp: string;
        };
        Insert: {
          address: string;
          city: string;
          created_at?: string;
          delivery_area?: string | null;
          delivery_fee_ngn?: number;
          delivery_fee_status?: string;
          delivery_option?: string;
          email: string;
          full_name: string;
          id?: string;
          notes?: string | null;
          payment_method: string;
          payment_status?: string;
          phone: string;
          receipt_url?: string | null;
          reference: string;
          state: string;
          status?: string;
          subtotal_ngn?: number;
          total_ngn?: number;
          updated_at?: string;
          whatsapp: string;
        };
        Update: {
          address?: string;
          city?: string;
          created_at?: string;
          delivery_area?: string | null;
          delivery_fee_ngn?: number;
          delivery_fee_status?: string;
          delivery_option?: string;
          email?: string;
          full_name?: string;
          id?: string;
          notes?: string | null;
          payment_method?: string;
          payment_status?: string;
          phone?: string;
          receipt_url?: string | null;
          reference?: string;
          state?: string;
          status?: string;
          subtotal_ngn?: number;
          total_ngn?: number;
          updated_at?: string;
          whatsapp?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category: string;
          colors: string[];
          created_at: string;
          description: string | null;
          id: string;
          gallery: Json;
          images: string[];
          is_active: boolean;
          is_bestseller: boolean;
          is_customizable: boolean;
          is_new_arrival: boolean;
          is_sold_out: boolean;
          stock_level: number;
          sku: string | null;
          material: string | null;
          fit: string | null;
          care_instructions: string | null;
          delivery_estimate: string | null;
          subcategory: string | null;
          starting_price_ngn: number | null;
          is_ready_to_wear: boolean;
          product_tags: string[];
          variants: Json;
          size_guide: Json;
          name: string;
          price_ngn: number;
          short_description: string | null;
          sizes: string[];
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category: string;
          colors?: string[];
          created_at?: string;
          description?: string | null;
          id?: string;
          gallery?: Json;
          images?: string[];
          is_active?: boolean;
          is_bestseller?: boolean;
          is_customizable?: boolean;
          is_new_arrival?: boolean;
          is_sold_out?: boolean;
          stock_level?: number;
          sku?: string | null;
          material?: string | null;
          fit?: string | null;
          care_instructions?: string | null;
          delivery_estimate?: string | null;
          subcategory?: string | null;
          starting_price_ngn?: number | null;
          is_ready_to_wear?: boolean;
          product_tags?: string[];
          variants?: Json;
          size_guide?: Json;
          name: string;
          price_ngn?: number;
          short_description?: string | null;
          sizes?: string[];
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          colors?: string[];
          created_at?: string;
          description?: string | null;
          id?: string;
          gallery?: Json;
          images?: string[];
          is_active?: boolean;
          is_bestseller?: boolean;
          is_customizable?: boolean;
          is_new_arrival?: boolean;
          is_sold_out?: boolean;
          stock_level?: number;
          sku?: string | null;
          material?: string | null;
          fit?: string | null;
          care_instructions?: string | null;
          delivery_estimate?: string | null;
          subcategory?: string | null;
          starting_price_ngn?: number | null;
          is_ready_to_wear?: boolean;
          product_tags?: string[];
          variants?: Json;
          size_guide?: Json;
          name?: string;
          price_ngn?: number;
          short_description?: string | null;
          sizes?: string[];
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      suppressed_emails: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          metadata: Json | null;
          reason: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          metadata?: Json | null;
          reason: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          metadata?: Json | null;
          reason?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string };
        Returns: boolean;
      };
      enqueue_email: {
        Args: { payload: Json; queue_name: string };
        Returns: number;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      move_to_dlq: {
        Args: {
          dlq_name: string;
          message_id: number;
          payload: Json;
          source_queue: string;
        };
        Returns: number;
      };
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number };
        Returns: {
          message: Json;
          msg_id: number;
          read_ct: number;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
