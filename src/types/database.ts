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
      buyer_preferences: {
        Row: {
          bedroom_max: number | null
          bedroom_min: number | null
          buyer_id: string
          condition_tolerance: string | null
          created_at: string | null
          id: string
          markets: Json | null
          max_rehab_budget: number | null
          preferred_roi_percent: number | null
          price_range_max: number | null
          price_range_min: number | null
          property_types: Json | null
          updated_at: string | null
        }
        Insert: {
          bedroom_max?: number | null
          bedroom_min?: number | null
          buyer_id: string
          condition_tolerance?: string | null
          created_at?: string | null
          id?: string
          markets?: Json | null
          max_rehab_budget?: number | null
          preferred_roi_percent?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          property_types?: Json | null
          updated_at?: string | null
        }
        Update: {
          bedroom_max?: number | null
          bedroom_min?: number | null
          buyer_id?: string
          condition_tolerance?: string | null
          created_at?: string | null
          id?: string
          markets?: Json | null
          max_rehab_budget?: number | null
          preferred_roi_percent?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          property_types?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_preferences_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: true
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_transactions: {
        Row: {
          buyer_id: string
          created_at: string | null
          data_source: string | null
          id: string
          property_address: string | null
          purchase_date: string | null
          purchase_price: number | null
          sale_date: string | null
          sale_price: number | null
          transaction_type: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          property_address?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          sale_date?: string | null
          sale_price?: number | null
          transaction_type?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          property_address?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          sale_date?: string | null
          sale_price?: number | null
          transaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          buyer_type: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          status: string | null
          tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          buyer_type?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          buyer_type?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          deal_id: string
          description: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          deal_id: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          deal_id?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          asking_price: number | null
          assigned_buyer_id: string | null
          assignment_fee: number | null
          contract_price: number | null
          created_at: string | null
          estimated_arv: number | null
          estimated_repairs: number | null
          id: string
          notes: string | null
          offer_price: number | null
          property_address: string
          property_id: string | null
          seller_email: string | null
          seller_name: string | null
          seller_phone: string | null
          stage: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asking_price?: number | null
          assigned_buyer_id?: string | null
          assignment_fee?: number | null
          contract_price?: number | null
          created_at?: string | null
          estimated_arv?: number | null
          estimated_repairs?: number | null
          id?: string
          notes?: string | null
          offer_price?: number | null
          property_address: string
          property_id?: string | null
          seller_email?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asking_price?: number | null
          assigned_buyer_id?: string | null
          assignment_fee?: number | null
          contract_price?: number | null
          created_at?: string | null
          estimated_arv?: number | null
          estimated_repairs?: number | null
          id?: string
          notes?: string | null
          offer_price?: number | null
          property_address?: string
          property_id?: string | null
          seller_email?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_buyer_id_fkey"
            columns: ["assigned_buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          id: string
          metadata: Json | null
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          id?: string
          metadata?: Json | null
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          id?: string
          metadata?: Json | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          difficulty_level: string | null
          id: string
          is_active: boolean | null
          related_docs: Json | null
          slug: string
          subcategory: string | null
          tags: Json | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          related_docs?: Json | null
          slug: string
          subcategory?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          related_docs?: Json | null
          slug?: string
          subcategory?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          chunk_id: string
          created_at: string | null
          embedding: string
          id: string
          model_version: string | null
        }
        Insert: {
          chunk_id: string
          created_at?: string | null
          embedding: string
          id?: string
          model_version?: string | null
        }
        Update: {
          chunk_id?: string
          created_at?: string | null
          embedding?: string
          id?: string
          model_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: true
            referencedRelation: "document_chunks"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          created_at: string | null
          days_on_market: number | null
          description: string | null
          expiration_date: string | null
          id: string
          list_price: number | null
          listing_agent: string | null
          listing_date: string | null
          listing_office: string | null
          listing_status: string | null
          mls_number: string | null
          original_list_price: number | null
          photos: Json | null
          price_changes: Json | null
          property_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_on_market?: number | null
          description?: string | null
          expiration_date?: string | null
          id?: string
          list_price?: number | null
          listing_agent?: string | null
          listing_date?: string | null
          listing_office?: string | null
          listing_status?: string | null
          mls_number?: string | null
          original_list_price?: number | null
          photos?: Json | null
          price_changes?: Json | null
          property_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_on_market?: number | null
          description?: string | null
          expiration_date?: string | null
          id?: string
          list_price?: number | null
          listing_agent?: string | null
          listing_date?: string | null
          listing_office?: string | null
          listing_status?: string | null
          mls_number?: string | null
          original_list_price?: number | null
          photos?: Json | null
          price_changes?: Json | null
          property_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          absorption_rate: number | null
          city: string | null
          county: string | null
          created_at: string | null
          data_date: string | null
          data_source: string | null
          days_on_market_avg: number | null
          id: string
          inventory_count: number | null
          median_home_value: number | null
          median_rent: number | null
          price_per_sqft: number | null
          rent_per_sqft: number | null
          state: string | null
          updated_at: string | null
          year_over_year_change: number | null
          zip_code: string
        }
        Insert: {
          absorption_rate?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          data_date?: string | null
          data_source?: string | null
          days_on_market_avg?: number | null
          id?: string
          inventory_count?: number | null
          median_home_value?: number | null
          median_rent?: number | null
          price_per_sqft?: number | null
          rent_per_sqft?: number | null
          state?: string | null
          updated_at?: string | null
          year_over_year_change?: number | null
          zip_code: string
        }
        Update: {
          absorption_rate?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          data_date?: string | null
          data_source?: string | null
          days_on_market_avg?: number | null
          id?: string
          inventory_count?: number | null
          median_home_value?: number | null
          median_rent?: number | null
          price_per_sqft?: number | null
          rent_per_sqft?: number | null
          state?: string | null
          updated_at?: string | null
          year_over_year_change?: number | null
          zip_code?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          buyer_id: string | null
          channel: string
          created_at: string | null
          deal_id: string | null
          direction: string
          external_id: string | null
          id: string
          metadata: Json | null
          recipient: string | null
          sender: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          body: string
          buyer_id?: string | null
          channel: string
          created_at?: string | null
          deal_id?: string | null
          direction: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          body?: string
          buyer_id?: string | null
          channel?: string
          created_at?: string | null
          deal_id?: string | null
          direction?: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          counter_amount: number | null
          created_at: string | null
          deal_id: string
          expiration_date: string | null
          id: string
          notes: string | null
          offer_amount: number
          offer_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          counter_amount?: number | null
          created_at?: string | null
          deal_id: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          offer_amount: number
          offer_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          counter_amount?: number | null
          created_at?: string | null
          deal_id?: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          offer_amount?: number
          offer_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          arv: number | null
          asking_price: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          condition: string | null
          county: string | null
          created_at: string | null
          days_on_market: number | null
          estimated_value: number | null
          id: string
          is_listed: boolean | null
          last_sale_date: string | null
          last_sale_price: number | null
          latitude: number | null
          listing_status: string | null
          longitude: number | null
          lot_size: number | null
          owner_name: string | null
          owner_type: string | null
          ownership_length_months: number | null
          property_type: string | null
          rentcast_id: string | null
          square_footage: number | null
          state: string | null
          updated_at: string | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          address: string
          arv?: number | null
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          condition?: string | null
          county?: string | null
          created_at?: string | null
          days_on_market?: number | null
          estimated_value?: number | null
          id?: string
          is_listed?: boolean | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          latitude?: number | null
          listing_status?: string | null
          longitude?: number | null
          lot_size?: number | null
          owner_name?: string | null
          owner_type?: string | null
          ownership_length_months?: number | null
          property_type?: string | null
          rentcast_id?: string | null
          square_footage?: number | null
          state?: string | null
          updated_at?: string | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          address?: string
          arv?: number | null
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          condition?: string | null
          county?: string | null
          created_at?: string | null
          days_on_market?: number | null
          estimated_value?: number | null
          id?: string
          is_listed?: boolean | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          latitude?: number | null
          listing_status?: string | null
          longitude?: number | null
          lot_size?: number | null
          owner_name?: string | null
          owner_type?: string | null
          ownership_length_months?: number | null
          property_type?: string | null
          rentcast_id?: string | null
          square_footage?: number | null
          state?: string | null
          updated_at?: string | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string | null
          description: string | null
          filters: Json
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          notify_on_new: boolean | null
          results_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          notify_on_new?: boolean | null
          results_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          notify_on_new?: boolean | null
          results_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          query_type: string
          criteria: Json
          natural_language_query: string | null
          results_count: number | null
          execution_time_ms: number | null
          properties_viewed: number | null
          led_to_action: boolean | null
          action_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          query_type?: string
          criteria?: Json
          natural_language_query?: string | null
          results_count?: number | null
          execution_time_ms?: number | null
          properties_viewed?: number | null
          led_to_action?: boolean | null
          action_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          query_type?: string
          criteria?: Json
          natural_language_query?: string | null
          results_count?: number | null
          execution_time_ms?: number | null
          properties_viewed?: number | null
          led_to_action?: boolean | null
          action_type?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          criteria: Json
          frequency: string
          notify_via: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          last_results_count: number | null
          new_results_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          criteria?: Json
          frequency?: string
          notify_via?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          last_results_count?: number | null
          new_results_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          criteria?: Json
          frequency?: string
          notify_via?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          last_results_count?: number | null
          new_results_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          body_template: string
          category: string | null
          channel: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject_template: string | null
          updated_at: string | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          body_template: string
          category?: string | null
          channel: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject_template?: string | null
          updated_at?: string | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          body_template?: string
          category?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject_template?: string | null
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          default_filters: Json | null
          default_markets: Json | null
          id: string
          notification_settings: Json | null
          ui_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_filters?: Json | null
          default_markets?: Json | null
          id?: string
          notification_settings?: Json | null
          ui_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_filters?: Json | null
          default_markets?: Json | null
          id?: string
          notification_settings?: Json | null
          ui_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          api_calls_remaining: number | null
          api_calls_reset_date: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          api_calls_remaining?: number | null
          api_calls_reset_date?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferences?: Json | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          api_calls_remaining?: number | null
          api_calls_reset_date?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      valuations: {
        Row: {
          arv_estimate: number | null
          created_at: string | null
          data_source: string | null
          equity_amount: number | null
          equity_percent: number | null
          estimated_value: number | null
          id: string
          price_range_high: number | null
          price_range_low: number | null
          property_id: string
          rent_estimate: number | null
          rent_range_high: number | null
          rent_range_low: number | null
          updated_at: string | null
          valuation_date: string | null
        }
        Insert: {
          arv_estimate?: number | null
          created_at?: string | null
          data_source?: string | null
          equity_amount?: number | null
          equity_percent?: number | null
          estimated_value?: number | null
          id?: string
          price_range_high?: number | null
          price_range_low?: number | null
          property_id: string
          rent_estimate?: number | null
          rent_range_high?: number | null
          rent_range_low?: number | null
          updated_at?: string | null
          valuation_date?: string | null
        }
        Update: {
          arv_estimate?: number | null
          created_at?: string | null
          data_source?: string | null
          equity_amount?: number | null
          equity_percent?: number | null
          estimated_value?: number | null
          id?: string
          price_range_high?: number | null
          price_range_low?: number | null
          property_id?: string
          rent_estimate?: number | null
          rent_range_high?: number | null
          rent_range_low?: number | null
          updated_at?: string | null
          valuation_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valuations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_buyer_statistics: {
        Args: { p_user_id: string }
        Returns: {
          active_buyers: number
          buyers_by_type: Json
          qualified_buyers: number
          tier_a_count: number
          tier_b_count: number
          tier_c_count: number
          total_buyers: number
        }[]
      }
      get_communication_stats: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: {
          delivered_count: number
          email_count: number
          failed_count: number
          inbound_count: number
          messages_by_status: Json
          outbound_count: number
          sms_count: number
          total_messages: number
        }[]
      }
      get_deal_statistics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: {
          active_deals: number
          avg_assignment_fee: number
          closed_deals: number
          deals_by_stage: Json
          lost_deals: number
          total_assignment_fees: number
          total_contract_value: number
          total_deals: number
        }[]
      }
      match_documents: {
        Args: {
          filter_category?: string
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          category: string
          chunk_content: string
          document_id: string
          document_slug: string
          document_title: string
          id: string
          similarity: number
        }[]
      }
      search_properties: {
        Args: {
          p_city?: string
          p_is_listed?: boolean
          p_limit?: number
          p_max_bathrooms?: number
          p_max_bedrooms?: number
          p_max_sqft?: number
          p_max_year_built?: number
          p_min_bathrooms?: number
          p_min_bedrooms?: number
          p_min_sqft?: number
          p_min_year_built?: number
          p_offset?: number
          p_owner_type?: string
          p_property_type?: string
          p_state?: string
          p_zip?: string
        }
        Returns: {
          address: string
          bathrooms: number
          bedrooms: number
          city: string
          estimated_value: number
          id: string
          is_listed: boolean
          owner_type: string
          property_type: string
          rent_estimate: number
          square_footage: number
          state: string
          year_built: number
          zip: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
