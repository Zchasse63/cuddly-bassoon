export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string;
          created_at: string | null;
          description: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          metadata: Json | null;
          new_value: Json | null;
          old_value: Json | null;
          user_id: string;
        };
        Insert: {
          activity_type: string;
          created_at?: string | null;
          description?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          metadata?: Json | null;
          new_value?: Json | null;
          old_value?: Json | null;
          user_id: string;
        };
        Update: {
          activity_type?: string;
          created_at?: string | null;
          description?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          metadata?: Json | null;
          new_value?: Json | null;
          old_value?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activities_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      analytics_daily: {
        Row: {
          appointments_set: number | null;
          call_duration_seconds: number | null;
          calls_connected: number | null;
          calls_made: number | null;
          contracts_signed: number | null;
          created_at: string | null;
          date: string;
          deals_closed: number | null;
          deals_lost: number | null;
          emails_opened: number | null;
          emails_replied: number | null;
          emails_sent: number | null;
          expenses: number | null;
          id: string;
          leads_contacted: number | null;
          leads_created: number | null;
          mail_responses: number | null;
          mail_sent: number | null;
          offers_made: number | null;
          property_analyses: number | null;
          property_saves: number | null;
          property_views: number | null;
          revenue: number | null;
          searches: number | null;
          skip_traces: number | null;
          texts_received: number | null;
          texts_sent: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          appointments_set?: number | null;
          call_duration_seconds?: number | null;
          calls_connected?: number | null;
          calls_made?: number | null;
          contracts_signed?: number | null;
          created_at?: string | null;
          date: string;
          deals_closed?: number | null;
          deals_lost?: number | null;
          emails_opened?: number | null;
          emails_replied?: number | null;
          emails_sent?: number | null;
          expenses?: number | null;
          id?: string;
          leads_contacted?: number | null;
          leads_created?: number | null;
          mail_responses?: number | null;
          mail_sent?: number | null;
          offers_made?: number | null;
          property_analyses?: number | null;
          property_saves?: number | null;
          property_views?: number | null;
          revenue?: number | null;
          searches?: number | null;
          skip_traces?: number | null;
          texts_received?: number | null;
          texts_sent?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          appointments_set?: number | null;
          call_duration_seconds?: number | null;
          calls_connected?: number | null;
          calls_made?: number | null;
          contracts_signed?: number | null;
          created_at?: string | null;
          date?: string;
          deals_closed?: number | null;
          deals_lost?: number | null;
          emails_opened?: number | null;
          emails_replied?: number | null;
          emails_sent?: number | null;
          expenses?: number | null;
          id?: string;
          leads_contacted?: number | null;
          leads_created?: number | null;
          mail_responses?: number | null;
          mail_sent?: number | null;
          offers_made?: number | null;
          property_analyses?: number | null;
          property_saves?: number | null;
          property_views?: number | null;
          revenue?: number | null;
          searches?: number | null;
          skip_traces?: number | null;
          texts_received?: number | null;
          texts_sent?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analytics_daily_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      analytics_events: {
        Row: {
          created_at: string | null;
          event_data: Json | null;
          event_type: string;
          id: string;
          session_id: string | null;
          team_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          event_data?: Json | null;
          event_type: string;
          id?: string;
          session_id?: string | null;
          team_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          event_data?: Json | null;
          event_type?: string;
          id?: string;
          session_id?: string | null;
          team_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analytics_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      analytics_team_daily: {
        Row: {
          appointments_set: number | null;
          calls_connected: number | null;
          calls_made: number | null;
          contracts_signed: number | null;
          created_at: string | null;
          date: string;
          deals_closed: number | null;
          emails_opened: number | null;
          emails_replied: number | null;
          emails_sent: number | null;
          id: string;
          leads_contacted: number | null;
          leads_created: number | null;
          mail_sent: number | null;
          offers_made: number | null;
          property_analyses: number | null;
          property_saves: number | null;
          property_views: number | null;
          revenue: number | null;
          searches: number | null;
          skip_traces: number | null;
          team_id: string;
          texts_received: number | null;
          texts_sent: number | null;
          updated_at: string | null;
        };
        Insert: {
          appointments_set?: number | null;
          calls_connected?: number | null;
          calls_made?: number | null;
          contracts_signed?: number | null;
          created_at?: string | null;
          date: string;
          deals_closed?: number | null;
          emails_opened?: number | null;
          emails_replied?: number | null;
          emails_sent?: number | null;
          id?: string;
          leads_contacted?: number | null;
          leads_created?: number | null;
          mail_sent?: number | null;
          offers_made?: number | null;
          property_analyses?: number | null;
          property_saves?: number | null;
          property_views?: number | null;
          revenue?: number | null;
          searches?: number | null;
          skip_traces?: number | null;
          team_id: string;
          texts_received?: number | null;
          texts_sent?: number | null;
          updated_at?: string | null;
        };
        Update: {
          appointments_set?: number | null;
          calls_connected?: number | null;
          calls_made?: number | null;
          contracts_signed?: number | null;
          created_at?: string | null;
          date?: string;
          deals_closed?: number | null;
          emails_opened?: number | null;
          emails_replied?: number | null;
          emails_sent?: number | null;
          id?: string;
          leads_contacted?: number | null;
          leads_created?: number | null;
          mail_sent?: number | null;
          offers_made?: number | null;
          property_analyses?: number | null;
          property_saves?: number | null;
          property_views?: number | null;
          revenue?: number | null;
          searches?: number | null;
          skip_traces?: number | null;
          team_id?: string;
          texts_received?: number | null;
          texts_sent?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'analytics_team_daily_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      buyer_preferences: {
        Row: {
          bedroom_max: number | null;
          bedroom_min: number | null;
          buyer_id: string;
          condition_tolerance: string | null;
          created_at: string | null;
          id: string;
          markets: Json | null;
          max_rehab_budget: number | null;
          preferred_roi_percent: number | null;
          price_range_max: number | null;
          price_range_min: number | null;
          property_types: Json | null;
          updated_at: string | null;
        };
        Insert: {
          bedroom_max?: number | null;
          bedroom_min?: number | null;
          buyer_id: string;
          condition_tolerance?: string | null;
          created_at?: string | null;
          id?: string;
          markets?: Json | null;
          max_rehab_budget?: number | null;
          preferred_roi_percent?: number | null;
          price_range_max?: number | null;
          price_range_min?: number | null;
          property_types?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          bedroom_max?: number | null;
          bedroom_min?: number | null;
          buyer_id?: string;
          condition_tolerance?: string | null;
          created_at?: string | null;
          id?: string;
          markets?: Json | null;
          max_rehab_budget?: number | null;
          preferred_roi_percent?: number | null;
          price_range_max?: number | null;
          price_range_min?: number | null;
          property_types?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'buyer_preferences_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: true;
            referencedRelation: 'buyers';
            referencedColumns: ['id'];
          },
        ];
      };
      buyer_transactions: {
        Row: {
          buyer_id: string;
          created_at: string | null;
          data_source: string | null;
          id: string;
          property_address: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          sale_date: string | null;
          sale_price: number | null;
          transaction_type: string | null;
        };
        Insert: {
          buyer_id: string;
          created_at?: string | null;
          data_source?: string | null;
          id?: string;
          property_address?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          sale_date?: string | null;
          sale_price?: number | null;
          transaction_type?: string | null;
        };
        Update: {
          buyer_id?: string;
          created_at?: string | null;
          data_source?: string | null;
          id?: string;
          property_address?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          sale_date?: string | null;
          sale_price?: number | null;
          transaction_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'buyer_transactions_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'buyers';
            referencedColumns: ['id'];
          },
        ];
      };
      buyers: {
        Row: {
          buyer_type: string | null;
          company_name: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          notes: string | null;
          phone: string | null;
          rating: number | null;
          status: string | null;
          tier: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          buyer_type?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          rating?: number | null;
          status?: string | null;
          tier?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          buyer_type?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          rating?: number | null;
          status?: string | null;
          tier?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'buyers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      deal_activities: {
        Row: {
          activity_type: string;
          created_at: string | null;
          deal_id: string;
          description: string | null;
          id: string;
          metadata: Json | null;
          user_id: string;
        };
        Insert: {
          activity_type: string;
          created_at?: string | null;
          deal_id: string;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          user_id: string;
        };
        Update: {
          activity_type?: string;
          created_at?: string | null;
          deal_id?: string;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deal_activities_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deal_activities_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      deals: {
        Row: {
          asking_price: number | null;
          assigned_buyer_id: string | null;
          assignment_fee: number | null;
          contract_price: number | null;
          created_at: string | null;
          estimated_arv: number | null;
          estimated_repairs: number | null;
          id: string;
          notes: string | null;
          offer_price: number | null;
          property_address: string;
          property_id: string | null;
          seller_email: string | null;
          seller_name: string | null;
          seller_phone: string | null;
          stage: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          asking_price?: number | null;
          assigned_buyer_id?: string | null;
          assignment_fee?: number | null;
          contract_price?: number | null;
          created_at?: string | null;
          estimated_arv?: number | null;
          estimated_repairs?: number | null;
          id?: string;
          notes?: string | null;
          offer_price?: number | null;
          property_address: string;
          property_id?: string | null;
          seller_email?: string | null;
          seller_name?: string | null;
          seller_phone?: string | null;
          stage?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          asking_price?: number | null;
          assigned_buyer_id?: string | null;
          assignment_fee?: number | null;
          contract_price?: number | null;
          created_at?: string | null;
          estimated_arv?: number | null;
          estimated_repairs?: number | null;
          id?: string;
          notes?: string | null;
          offer_price?: number | null;
          property_address?: string;
          property_id?: string | null;
          seller_email?: string | null;
          seller_name?: string | null;
          seller_phone?: string | null;
          stage?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deals_assigned_buyer_id_fkey';
            columns: ['assigned_buyer_id'];
            isOneToOne: false;
            referencedRelation: 'buyers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deals_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deals_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      document_chunks: {
        Row: {
          chunk_index: number;
          content: string;
          created_at: string | null;
          document_id: string;
          id: string;
          metadata: Json | null;
          token_count: number | null;
        };
        Insert: {
          chunk_index: number;
          content: string;
          created_at?: string | null;
          document_id: string;
          id?: string;
          metadata?: Json | null;
          token_count?: number | null;
        };
        Update: {
          chunk_index?: number;
          content?: string;
          created_at?: string | null;
          document_id?: string;
          id?: string;
          metadata?: Json | null;
          token_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'document_chunks_document_id_fkey';
            columns: ['document_id'];
            isOneToOne: false;
            referencedRelation: 'documents';
            referencedColumns: ['id'];
          },
        ];
      };
      documents: {
        Row: {
          category: string | null;
          content: string;
          created_at: string | null;
          difficulty_level: string | null;
          id: string;
          is_active: boolean | null;
          related_docs: Json | null;
          slug: string;
          subcategory: string | null;
          tags: Json | null;
          title: string;
          updated_at: string | null;
          version: number | null;
        };
        Insert: {
          category?: string | null;
          content: string;
          created_at?: string | null;
          difficulty_level?: string | null;
          id?: string;
          is_active?: boolean | null;
          related_docs?: Json | null;
          slug: string;
          subcategory?: string | null;
          tags?: Json | null;
          title: string;
          updated_at?: string | null;
          version?: number | null;
        };
        Update: {
          category?: string | null;
          content?: string;
          created_at?: string | null;
          difficulty_level?: string | null;
          id?: string;
          is_active?: boolean | null;
          related_docs?: Json | null;
          slug?: string;
          subcategory?: string | null;
          tags?: Json | null;
          title?: string;
          updated_at?: string | null;
          version?: number | null;
        };
        Relationships: [];
      };
      embeddings: {
        Row: {
          chunk_id: string;
          created_at: string | null;
          embedding: string;
          id: string;
          model_version: string | null;
        };
        Insert: {
          chunk_id: string;
          created_at?: string | null;
          embedding: string;
          id?: string;
          model_version?: string | null;
        };
        Update: {
          chunk_id?: string;
          created_at?: string | null;
          embedding?: string;
          id?: string;
          model_version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'embeddings_chunk_id_fkey';
            columns: ['chunk_id'];
            isOneToOne: true;
            referencedRelation: 'document_chunks';
            referencedColumns: ['id'];
          },
        ];
      };
      lead_contact_history: {
        Row: {
          contact_type: string;
          contacted_at: string | null;
          created_at: string | null;
          duration_seconds: number | null;
          id: string;
          lead_id: string;
          notes: string | null;
          outcome: string | null;
          user_id: string;
        };
        Insert: {
          contact_type: string;
          contacted_at?: string | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          lead_id: string;
          notes?: string | null;
          outcome?: string | null;
          user_id: string;
        };
        Update: {
          contact_type?: string;
          contacted_at?: string | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          lead_id?: string;
          notes?: string | null;
          outcome?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_contact_history_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_contact_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      lead_list_items: {
        Row: {
          added_at: string | null;
          id: string;
          lead_id: string;
          list_id: string;
          position: number | null;
        };
        Insert: {
          added_at?: string | null;
          id?: string;
          lead_id: string;
          list_id: string;
          position?: number | null;
        };
        Update: {
          added_at?: string | null;
          id?: string;
          lead_id?: string;
          list_id?: string;
          position?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_list_items_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_list_items_list_id_fkey';
            columns: ['list_id'];
            isOneToOne: false;
            referencedRelation: 'lead_lists';
            referencedColumns: ['id'];
          },
        ];
      };
      lead_lists: {
        Row: {
          created_at: string | null;
          description: string | null;
          filter_criteria: Json | null;
          id: string;
          is_active: boolean | null;
          list_type: string | null;
          name: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          filter_criteria?: Json | null;
          id?: string;
          is_active?: boolean | null;
          list_type?: string | null;
          name: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          filter_criteria?: Json | null;
          id?: string;
          is_active?: boolean | null;
          list_type?: string | null;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_lists_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      leads: {
        Row: {
          created_at: string | null;
          id: string;
          lost_reason: string | null;
          motivation_score: number | null;
          notes: string | null;
          owner_email: string | null;
          owner_name: string | null;
          owner_phone: string | null;
          property_address: string | null;
          property_id: string | null;
          source: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          lost_reason?: string | null;
          motivation_score?: number | null;
          notes?: string | null;
          owner_email?: string | null;
          owner_name?: string | null;
          owner_phone?: string | null;
          property_address?: string | null;
          property_id?: string | null;
          source?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          lost_reason?: string | null;
          motivation_score?: number | null;
          notes?: string | null;
          owner_email?: string | null;
          owner_name?: string | null;
          owner_phone?: string | null;
          property_address?: string | null;
          property_id?: string | null;
          source?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leads_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      listings: {
        Row: {
          created_at: string | null;
          days_on_market: number | null;
          description: string | null;
          expiration_date: string | null;
          id: string;
          list_price: number | null;
          listing_agent: string | null;
          listing_date: string | null;
          listing_office: string | null;
          listing_status: string | null;
          mls_number: string | null;
          original_list_price: number | null;
          photos: Json | null;
          price_changes: Json | null;
          property_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          days_on_market?: number | null;
          description?: string | null;
          expiration_date?: string | null;
          id?: string;
          list_price?: number | null;
          listing_agent?: string | null;
          listing_date?: string | null;
          listing_office?: string | null;
          listing_status?: string | null;
          mls_number?: string | null;
          original_list_price?: number | null;
          photos?: Json | null;
          price_changes?: Json | null;
          property_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          days_on_market?: number | null;
          description?: string | null;
          expiration_date?: string | null;
          id?: string;
          list_price?: number | null;
          listing_agent?: string | null;
          listing_date?: string | null;
          listing_office?: string | null;
          listing_status?: string | null;
          mls_number?: string | null;
          original_list_price?: number | null;
          photos?: Json | null;
          price_changes?: Json | null;
          property_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'listings_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      market_data: {
        Row: {
          absorption_rate: number | null;
          city: string | null;
          county: string | null;
          created_at: string | null;
          data_date: string | null;
          data_source: string | null;
          days_on_market_avg: number | null;
          id: string;
          inventory_count: number | null;
          median_home_value: number | null;
          median_rent: number | null;
          price_per_sqft: number | null;
          rent_per_sqft: number | null;
          state: string | null;
          updated_at: string | null;
          year_over_year_change: number | null;
          zip_code: string;
        };
        Insert: {
          absorption_rate?: number | null;
          city?: string | null;
          county?: string | null;
          created_at?: string | null;
          data_date?: string | null;
          data_source?: string | null;
          days_on_market_avg?: number | null;
          id?: string;
          inventory_count?: number | null;
          median_home_value?: number | null;
          median_rent?: number | null;
          price_per_sqft?: number | null;
          rent_per_sqft?: number | null;
          state?: string | null;
          updated_at?: string | null;
          year_over_year_change?: number | null;
          zip_code: string;
        };
        Update: {
          absorption_rate?: number | null;
          city?: string | null;
          county?: string | null;
          created_at?: string | null;
          data_date?: string | null;
          data_source?: string | null;
          days_on_market_avg?: number | null;
          id?: string;
          inventory_count?: number | null;
          median_home_value?: number | null;
          median_rent?: number | null;
          price_per_sqft?: number | null;
          rent_per_sqft?: number | null;
          state?: string | null;
          updated_at?: string | null;
          year_over_year_change?: number | null;
          zip_code?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          buyer_id: string | null;
          channel: string;
          created_at: string | null;
          deal_id: string | null;
          direction: string;
          external_id: string | null;
          id: string;
          metadata: Json | null;
          recipient: string | null;
          sender: string | null;
          status: string | null;
          subject: string | null;
          user_id: string;
        };
        Insert: {
          body: string;
          buyer_id?: string | null;
          channel: string;
          created_at?: string | null;
          deal_id?: string | null;
          direction: string;
          external_id?: string | null;
          id?: string;
          metadata?: Json | null;
          recipient?: string | null;
          sender?: string | null;
          status?: string | null;
          subject?: string | null;
          user_id: string;
        };
        Update: {
          body?: string;
          buyer_id?: string | null;
          channel?: string;
          created_at?: string | null;
          deal_id?: string | null;
          direction?: string;
          external_id?: string | null;
          id?: string;
          metadata?: Json | null;
          recipient?: string | null;
          sender?: string | null;
          status?: string | null;
          subject?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'buyers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      offer_strategies: {
        Row: {
          arv: number | null;
          created_at: string | null;
          deal_id: string;
          id: string;
          is_active: boolean | null;
          market_factor: number | null;
          maximum_price: number | null;
          negotiation_tips: Json | null;
          optimal_price: number | null;
          profit_margin: number | null;
          repair_estimate: number | null;
          strategy_reasoning: string | null;
          target_price: number | null;
          updated_at: string | null;
          user_id: string;
          walk_away_price: number | null;
        };
        Insert: {
          arv?: number | null;
          created_at?: string | null;
          deal_id: string;
          id?: string;
          is_active?: boolean | null;
          market_factor?: number | null;
          maximum_price?: number | null;
          negotiation_tips?: Json | null;
          optimal_price?: number | null;
          profit_margin?: number | null;
          repair_estimate?: number | null;
          strategy_reasoning?: string | null;
          target_price?: number | null;
          updated_at?: string | null;
          user_id: string;
          walk_away_price?: number | null;
        };
        Update: {
          arv?: number | null;
          created_at?: string | null;
          deal_id?: string;
          id?: string;
          is_active?: boolean | null;
          market_factor?: number | null;
          maximum_price?: number | null;
          negotiation_tips?: Json | null;
          optimal_price?: number | null;
          profit_margin?: number | null;
          repair_estimate?: number | null;
          strategy_reasoning?: string | null;
          target_price?: number | null;
          updated_at?: string | null;
          user_id?: string;
          walk_away_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'offer_strategies_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offer_strategies_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      offers: {
        Row: {
          counter_amount: number | null;
          created_at: string | null;
          deal_id: string;
          expiration_date: string | null;
          id: string;
          notes: string | null;
          offer_amount: number;
          offer_date: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          counter_amount?: number | null;
          created_at?: string | null;
          deal_id: string;
          expiration_date?: string | null;
          id?: string;
          notes?: string | null;
          offer_amount: number;
          offer_date: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          counter_amount?: number | null;
          created_at?: string | null;
          deal_id?: string;
          expiration_date?: string | null;
          id?: string;
          notes?: string | null;
          offer_amount?: number;
          offer_date?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'offers_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
        ];
      };
      properties: {
        Row: {
          address: string;
          arv: number | null;
          asking_price: number | null;
          bathrooms: number | null;
          bedrooms: number | null;
          city: string | null;
          condition: string | null;
          county: string | null;
          created_at: string | null;
          days_on_market: number | null;
          estimated_value: number | null;
          id: string;
          is_listed: boolean | null;
          last_sale_date: string | null;
          last_sale_price: number | null;
          latitude: number | null;
          listing_status: string | null;
          longitude: number | null;
          lot_size: number | null;
          owner_name: string | null;
          owner_type: string | null;
          ownership_length_months: number | null;
          property_type: string | null;
          rentcast_id: string | null;
          square_footage: number | null;
          state: string | null;
          updated_at: string | null;
          year_built: number | null;
          zip: string | null;
        };
        Insert: {
          address: string;
          arv?: number | null;
          asking_price?: number | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          city?: string | null;
          condition?: string | null;
          county?: string | null;
          created_at?: string | null;
          days_on_market?: number | null;
          estimated_value?: number | null;
          id?: string;
          is_listed?: boolean | null;
          last_sale_date?: string | null;
          last_sale_price?: number | null;
          latitude?: number | null;
          listing_status?: string | null;
          longitude?: number | null;
          lot_size?: number | null;
          owner_name?: string | null;
          owner_type?: string | null;
          ownership_length_months?: number | null;
          property_type?: string | null;
          rentcast_id?: string | null;
          square_footage?: number | null;
          state?: string | null;
          updated_at?: string | null;
          year_built?: number | null;
          zip?: string | null;
        };
        Update: {
          address?: string;
          arv?: number | null;
          asking_price?: number | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          city?: string | null;
          condition?: string | null;
          county?: string | null;
          created_at?: string | null;
          days_on_market?: number | null;
          estimated_value?: number | null;
          id?: string;
          is_listed?: boolean | null;
          last_sale_date?: string | null;
          last_sale_price?: number | null;
          latitude?: number | null;
          listing_status?: string | null;
          longitude?: number | null;
          lot_size?: number | null;
          owner_name?: string | null;
          owner_type?: string | null;
          ownership_length_months?: number | null;
          property_type?: string | null;
          rentcast_id?: string | null;
          square_footage?: number | null;
          state?: string | null;
          updated_at?: string | null;
          year_built?: number | null;
          zip?: string | null;
        };
        Relationships: [];
      };
      sales_reports: {
        Row: {
          content: Json;
          created_at: string | null;
          deal_id: string | null;
          expires_at: string | null;
          generated_at: string | null;
          id: string;
          is_archived: boolean | null;
          lead_id: string | null;
          report_type: string;
          title: string;
          user_id: string;
        };
        Insert: {
          content?: Json;
          created_at?: string | null;
          deal_id?: string | null;
          expires_at?: string | null;
          generated_at?: string | null;
          id?: string;
          is_archived?: boolean | null;
          lead_id?: string | null;
          report_type: string;
          title: string;
          user_id: string;
        };
        Update: {
          content?: Json;
          created_at?: string | null;
          deal_id?: string | null;
          expires_at?: string | null;
          generated_at?: string | null;
          id?: string;
          is_archived?: boolean | null;
          lead_id?: string | null;
          report_type?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sales_reports_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sales_reports_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sales_reports_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_searches: {
        Row: {
          created_at: string | null;
          description: string | null;
          filters: Json;
          id: string;
          is_active: boolean | null;
          last_run_at: string | null;
          name: string;
          notify_on_new: boolean | null;
          results_count: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          filters?: Json;
          id?: string;
          is_active?: boolean | null;
          last_run_at?: string | null;
          name: string;
          notify_on_new?: boolean | null;
          results_count?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          filters?: Json;
          id?: string;
          is_active?: boolean | null;
          last_run_at?: string | null;
          name?: string;
          notify_on_new?: boolean | null;
          results_count?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_searches_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      scheduled_searches: {
        Row: {
          created_at: string | null;
          criteria: Json;
          description: string | null;
          frequency: string;
          id: string;
          is_active: boolean | null;
          last_results_count: number | null;
          last_run_at: string | null;
          name: string;
          new_results_count: number | null;
          next_run_at: string | null;
          notify_via: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          criteria?: Json;
          description?: string | null;
          frequency?: string;
          id?: string;
          is_active?: boolean | null;
          last_results_count?: number | null;
          last_run_at?: string | null;
          name: string;
          new_results_count?: number | null;
          next_run_at?: string | null;
          notify_via?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          criteria?: Json;
          description?: string | null;
          frequency?: string;
          id?: string;
          is_active?: boolean | null;
          last_results_count?: number | null;
          last_run_at?: string | null;
          name?: string;
          new_results_count?: number | null;
          next_run_at?: string | null;
          notify_via?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scheduled_searches_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      search_history: {
        Row: {
          action_type: string | null;
          created_at: string | null;
          criteria: Json;
          execution_time_ms: number | null;
          id: string;
          led_to_action: boolean | null;
          natural_language_query: string | null;
          properties_viewed: number | null;
          query_type: string;
          results_count: number | null;
          user_id: string;
        };
        Insert: {
          action_type?: string | null;
          created_at?: string | null;
          criteria?: Json;
          execution_time_ms?: number | null;
          id?: string;
          led_to_action?: boolean | null;
          natural_language_query?: string | null;
          properties_viewed?: number | null;
          query_type?: string;
          results_count?: number | null;
          user_id: string;
        };
        Update: {
          action_type?: string | null;
          created_at?: string | null;
          criteria?: Json;
          execution_time_ms?: number | null;
          id?: string;
          led_to_action?: boolean | null;
          natural_language_query?: string | null;
          properties_viewed?: number | null;
          query_type?: string;
          results_count?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'search_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      search_performance: {
        Row: {
          avg_results_per_search: number | null;
          conversion_rate: number | null;
          created_at: string | null;
          deals_from_searches: number | null;
          id: string;
          offers_from_searches: number | null;
          period_end: string;
          period_start: string;
          period_type: string;
          searches_with_actions: number | null;
          top_criteria: Json | null;
          total_searches: number | null;
          unique_criteria_count: number | null;
          user_id: string;
        };
        Insert: {
          avg_results_per_search?: number | null;
          conversion_rate?: number | null;
          created_at?: string | null;
          deals_from_searches?: number | null;
          id?: string;
          offers_from_searches?: number | null;
          period_end: string;
          period_start: string;
          period_type?: string;
          searches_with_actions?: number | null;
          top_criteria?: Json | null;
          total_searches?: number | null;
          unique_criteria_count?: number | null;
          user_id: string;
        };
        Update: {
          avg_results_per_search?: number | null;
          conversion_rate?: number | null;
          created_at?: string | null;
          deals_from_searches?: number | null;
          id?: string;
          offers_from_searches?: number | null;
          period_end?: string;
          period_start?: string;
          period_type?: string;
          searches_with_actions?: number | null;
          top_criteria?: Json | null;
          total_searches?: number | null;
          unique_criteria_count?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'search_performance_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      team_members: {
        Row: {
          created_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          joined_at: string | null;
          permissions: Json | null;
          role: string;
          status: string | null;
          team_id: string;
          territories: Json | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          permissions?: Json | null;
          role?: string;
          status?: string | null;
          team_id: string;
          territories?: Json | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          permissions?: Json | null;
          role?: string;
          status?: string | null;
          team_id?: string;
          territories?: Json | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_members_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          lead_assignment_mode: string | null;
          monthly_report_day: number | null;
          name: string;
          owner_id: string;
          settings: Json | null;
          territory_mode: string | null;
          updated_at: string | null;
          weekly_report_recipients: Json | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          lead_assignment_mode?: string | null;
          monthly_report_day?: number | null;
          name: string;
          owner_id: string;
          settings?: Json | null;
          territory_mode?: string | null;
          updated_at?: string | null;
          weekly_report_recipients?: Json | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          lead_assignment_mode?: string | null;
          monthly_report_day?: number | null;
          name?: string;
          owner_id?: string;
          settings?: Json | null;
          territory_mode?: string | null;
          updated_at?: string | null;
          weekly_report_recipients?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'teams_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      templates: {
        Row: {
          body_template: string;
          category: string | null;
          channel: string;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          subject_template: string | null;
          updated_at: string | null;
          user_id: string;
          variables: Json | null;
        };
        Insert: {
          body_template: string;
          category?: string | null;
          channel: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          subject_template?: string | null;
          updated_at?: string | null;
          user_id: string;
          variables?: Json | null;
        };
        Update: {
          body_template?: string;
          category?: string | null;
          channel?: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          subject_template?: string | null;
          updated_at?: string | null;
          user_id?: string;
          variables?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'templates_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_preferences: {
        Row: {
          created_at: string | null;
          default_filters: Json | null;
          default_markets: Json | null;
          id: string;
          notification_settings: Json | null;
          ui_preferences: Json | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          default_filters?: Json | null;
          default_markets?: Json | null;
          id?: string;
          notification_settings?: Json | null;
          ui_preferences?: Json | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          default_filters?: Json | null;
          default_markets?: Json | null;
          id?: string;
          notification_settings?: Json | null;
          ui_preferences?: Json | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          api_calls_remaining: number | null;
          api_calls_reset_date: string | null;
          company_name: string | null;
          created_at: string | null;
          current_team_id: string | null;
          email: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          preferences: Json | null;
          subscription_status: string | null;
          subscription_tier: string | null;
          updated_at: string | null;
        };
        Insert: {
          api_calls_remaining?: number | null;
          api_calls_reset_date?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          current_team_id?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          preferences?: Json | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          updated_at?: string | null;
        };
        Update: {
          api_calls_remaining?: number | null;
          api_calls_reset_date?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          current_team_id?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          preferences?: Json | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_current_team_id_fkey';
            columns: ['current_team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      valuations: {
        Row: {
          arv_estimate: number | null;
          created_at: string | null;
          data_source: string | null;
          equity_amount: number | null;
          equity_percent: number | null;
          estimated_value: number | null;
          id: string;
          price_range_high: number | null;
          price_range_low: number | null;
          property_id: string;
          rent_estimate: number | null;
          rent_range_high: number | null;
          rent_range_low: number | null;
          updated_at: string | null;
          valuation_date: string | null;
        };
        Insert: {
          arv_estimate?: number | null;
          created_at?: string | null;
          data_source?: string | null;
          equity_amount?: number | null;
          equity_percent?: number | null;
          estimated_value?: number | null;
          id?: string;
          price_range_high?: number | null;
          price_range_low?: number | null;
          property_id: string;
          rent_estimate?: number | null;
          rent_range_high?: number | null;
          rent_range_low?: number | null;
          updated_at?: string | null;
          valuation_date?: string | null;
        };
        Update: {
          arv_estimate?: number | null;
          created_at?: string | null;
          data_source?: string | null;
          equity_amount?: number | null;
          equity_percent?: number | null;
          estimated_value?: number | null;
          id?: string;
          price_range_high?: number | null;
          price_range_low?: number | null;
          property_id?: string;
          rent_estimate?: number | null;
          rent_range_high?: number | null;
          rent_range_low?: number | null;
          updated_at?: string | null;
          valuation_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'valuations_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_activity_kpis: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string };
        Returns: {
          avg_daily_searches: number;
          avg_daily_views: number;
          save_to_analyze_rate: number;
          search_to_save_rate: number;
          total_analyses: number;
          total_saves: number;
          total_searches: number;
          total_skip_traces: number;
          total_views: number;
        }[];
      };
      get_buyer_statistics: {
        Args: { p_user_id: string };
        Returns: {
          active_buyers: number;
          buyers_by_type: Json;
          qualified_buyers: number;
          tier_a_count: number;
          tier_b_count: number;
          tier_c_count: number;
          total_buyers: number;
        }[];
      };
      get_communication_stats: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string };
        Returns: {
          delivered_count: number;
          email_count: number;
          failed_count: number;
          inbound_count: number;
          messages_by_status: Json;
          outbound_count: number;
          sms_count: number;
          total_messages: number;
        }[];
      };
      get_dashboard_summary: {
        Args: { p_days?: number; p_user_id: string };
        Returns: {
          active_deals: number;
          active_leads: number;
          avg_assignment_fee: number;
          deals_closed_period: number;
          deals_trend: number;
          properties_analyzed: number;
          properties_saved: number;
          properties_searched: number;
          revenue_period: number;
          revenue_trend: number;
          searches_trend: number;
        }[];
      };
      get_deal_statistics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string };
        Returns: {
          active_deals: number;
          avg_assignment_fee: number;
          closed_deals: number;
          deals_by_stage: Json;
          lost_deals: number;
          total_assignment_fees: number;
          total_contract_value: number;
          total_deals: number;
        }[];
      };
      get_financial_kpis: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string };
        Returns: {
          avg_deal_revenue: number;
          cost_per_lead: number;
          deals_count: number;
          net_profit: number;
          revenue_per_lead: number;
          roi_percentage: number;
          total_expenses: number;
          total_revenue: number;
        }[];
      };
      get_outreach_kpis: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string };
        Returns: {
          avg_calls_per_day: number;
          call_connect_rate: number;
          connected_calls: number;
          email_open_rate: number;
          email_reply_rate: number;
          total_call_duration: number;
          total_calls: number;
          total_emails_opened: number;
          total_emails_replied: number;
          total_emails_sent: number;
          total_texts_received: number;
          total_texts_sent: number;
        }[];
      };
      get_pipeline_kpis: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string };
        Returns: {
          appointment_to_offer_rate: number;
          appointments_set: number;
          contact_to_appointment_rate: number;
          contract_to_close_rate: number;
          contracts_signed: number;
          deals_closed: number;
          deals_lost: number;
          lead_to_contact_rate: number;
          leads_contacted: number;
          offer_to_contract_rate: number;
          offers_made: number;
          overall_conversion_rate: number;
          total_leads: number;
        }[];
      };
      get_search_statistics: {
        Args: { p_days?: number; p_user_id: string };
        Returns: {
          avg_results: number;
          conversion_rate: number;
          most_used_criteria: Json;
          total_searches: number;
          unique_criteria: number;
        }[];
      };
      log_search: {
        Args: {
          p_criteria?: Json;
          p_execution_time_ms?: number;
          p_natural_language_query?: string;
          p_query_type?: string;
          p_results_count?: number;
          p_user_id: string;
        };
        Returns: string;
      };
      match_documents: {
        Args: {
          filter_category?: string;
          match_count?: number;
          query_embedding: string;
          similarity_threshold?: number;
        };
        Returns: {
          category: string;
          chunk_content: string;
          document_id: string;
          document_slug: string;
          document_title: string;
          id: string;
          similarity: number;
        }[];
      };
      search_properties: {
        Args: {
          p_city?: string;
          p_is_listed?: boolean;
          p_limit?: number;
          p_max_bathrooms?: number;
          p_max_bedrooms?: number;
          p_max_sqft?: number;
          p_max_year_built?: number;
          p_min_bathrooms?: number;
          p_min_bedrooms?: number;
          p_min_sqft?: number;
          p_min_year_built?: number;
          p_offset?: number;
          p_owner_type?: string;
          p_property_type?: string;
          p_state?: string;
          p_zip?: string;
        };
        Returns: {
          address: string;
          bathrooms: number;
          bedrooms: number;
          city: string;
          estimated_value: number;
          id: string;
          is_listed: boolean;
          owner_type: string;
          property_type: string;
          rent_estimate: number;
          square_footage: number;
          state: string;
          year_built: number;
          zip: string;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
      upsert_daily_analytics: {
        Args: {
          p_date: string;
          p_field: string;
          p_increment?: number;
          p_user_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
