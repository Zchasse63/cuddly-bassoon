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
      campaigns: {
        Row: {
          channel: string;
          completed_at: string | null;
          created_at: string | null;
          deal_id: string | null;
          description: string | null;
          id: string;
          messages_clicked: number | null;
          messages_delivered: number | null;
          messages_failed: number | null;
          messages_opened: number | null;
          messages_sent: number | null;
          messages_total: number | null;
          name: string;
          recipient_criteria: Json | null;
          scheduled_at: string | null;
          started_at: string | null;
          status: string;
          template_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          channel?: string;
          completed_at?: string | null;
          created_at?: string | null;
          deal_id?: string | null;
          description?: string | null;
          id?: string;
          messages_clicked?: number | null;
          messages_delivered?: number | null;
          messages_failed?: number | null;
          messages_opened?: number | null;
          messages_sent?: number | null;
          messages_total?: number | null;
          name: string;
          recipient_criteria?: Json | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          status?: string;
          template_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          channel?: string;
          completed_at?: string | null;
          created_at?: string | null;
          deal_id?: string | null;
          description?: string | null;
          id?: string;
          messages_clicked?: number | null;
          messages_delivered?: number | null;
          messages_failed?: number | null;
          messages_opened?: number | null;
          messages_sent?: number | null;
          messages_total?: number | null;
          name?: string;
          recipient_criteria?: Json | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          status?: string;
          template_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campaigns_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaigns_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaigns_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      comp_analyses: {
        Row: {
          analysis_date: string;
          arv_confidence: number | null;
          block_group_polygon: Json | null;
          comps: Json;
          created_at: string | null;
          data_source: string | null;
          estimated_arv: number | null;
          id: string;
          scoring_config: Json;
          subject_address: string | null;
          subject_block_group_geoid: string | null;
          subject_latitude: number | null;
          subject_longitude: number | null;
          subject_property_id: string | null;
          subject_subdivision: string | null;
          subject_tract_geoid: string | null;
          summary: Json;
          tract_polygon: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          analysis_date?: string;
          arv_confidence?: number | null;
          block_group_polygon?: Json | null;
          comps?: Json;
          created_at?: string | null;
          data_source?: string | null;
          estimated_arv?: number | null;
          id?: string;
          scoring_config?: Json;
          subject_address?: string | null;
          subject_block_group_geoid?: string | null;
          subject_latitude?: number | null;
          subject_longitude?: number | null;
          subject_property_id?: string | null;
          subject_subdivision?: string | null;
          subject_tract_geoid?: string | null;
          summary?: Json;
          tract_polygon?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          analysis_date?: string;
          arv_confidence?: number | null;
          block_group_polygon?: Json | null;
          comps?: Json;
          created_at?: string | null;
          data_source?: string | null;
          estimated_arv?: number | null;
          id?: string;
          scoring_config?: Json;
          subject_address?: string | null;
          subject_block_group_geoid?: string | null;
          subject_latitude?: number | null;
          subject_longitude?: number | null;
          subject_property_id?: string | null;
          subject_subdivision?: string | null;
          subject_tract_geoid?: string | null;
          summary?: Json;
          tract_polygon?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'comp_analyses_subject_property_id_fkey';
            columns: ['subject_property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comp_analyses_user_id_fkey';
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
      deal_outcome_patterns: {
        Row: {
          avg_days_to_close: number | null;
          avg_discount_from_arv: number | null;
          avg_profit: number | null;
          avg_roi: number | null;
          city: string | null;
          created_at: string | null;
          deal_type: string | null;
          failure_rate: number | null;
          id: string;
          last_calculated_at: string | null;
          market_condition: string | null;
          most_common_failure_reason: string | null;
          pattern_key: string;
          sample_size: number | null;
          seller_type: string | null;
          state: string | null;
          success_rate: number | null;
          successful_deals: number | null;
          total_deals: number | null;
        };
        Insert: {
          avg_days_to_close?: number | null;
          avg_discount_from_arv?: number | null;
          avg_profit?: number | null;
          avg_roi?: number | null;
          city?: string | null;
          created_at?: string | null;
          deal_type?: string | null;
          failure_rate?: number | null;
          id?: string;
          last_calculated_at?: string | null;
          market_condition?: string | null;
          most_common_failure_reason?: string | null;
          pattern_key: string;
          sample_size?: number | null;
          seller_type?: string | null;
          state?: string | null;
          success_rate?: number | null;
          successful_deals?: number | null;
          total_deals?: number | null;
        };
        Update: {
          avg_days_to_close?: number | null;
          avg_discount_from_arv?: number | null;
          avg_profit?: number | null;
          avg_roi?: number | null;
          city?: string | null;
          created_at?: string | null;
          deal_type?: string | null;
          failure_rate?: number | null;
          id?: string;
          last_calculated_at?: string | null;
          market_condition?: string | null;
          most_common_failure_reason?: string | null;
          pattern_key?: string;
          sample_size?: number | null;
          seller_type?: string | null;
          state?: string | null;
          success_rate?: number | null;
          successful_deals?: number | null;
          total_deals?: number | null;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          asking_price: number | null;
          assigned_buyer_id: string | null;
          assigned_to: string | null;
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
          assigned_to?: string | null;
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
          assigned_to?: string | null;
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
            foreignKeyName: 'deals_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
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
      distress_indicators: {
        Row: {
          address: string;
          code_liens: number | null;
          created_at: string;
          data_source: string | null;
          expires_at: string;
          fetched_at: string;
          id: string;
          pre_foreclosure: boolean | null;
          pre_foreclosure_date: string | null;
          property_id: string | null;
          tax_delinquent: boolean | null;
          tax_delinquent_amount: number | null;
          tax_delinquent_years: number | null;
          updated_at: string;
          vacancy_duration_months: number | null;
          vacant: boolean | null;
        };
        Insert: {
          address: string;
          code_liens?: number | null;
          created_at?: string;
          data_source?: string | null;
          expires_at?: string;
          fetched_at?: string;
          id?: string;
          pre_foreclosure?: boolean | null;
          pre_foreclosure_date?: string | null;
          property_id?: string | null;
          tax_delinquent?: boolean | null;
          tax_delinquent_amount?: number | null;
          tax_delinquent_years?: number | null;
          updated_at?: string;
          vacancy_duration_months?: number | null;
          vacant?: boolean | null;
        };
        Update: {
          address?: string;
          code_liens?: number | null;
          created_at?: string;
          data_source?: string | null;
          expires_at?: string;
          fetched_at?: string;
          id?: string;
          pre_foreclosure?: boolean | null;
          pre_foreclosure_date?: string | null;
          property_id?: string | null;
          tax_delinquent?: boolean | null;
          tax_delinquent_amount?: number | null;
          tax_delinquent_years?: number | null;
          updated_at?: string;
          vacancy_duration_months?: number | null;
          vacant?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'distress_indicators_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
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
      experiment_assignments: {
        Row: {
          address: string | null;
          assigned_at: string;
          experiment_id: string;
          id: string;
          property_id: string | null;
          score_at_assignment: number | null;
          variant: string;
        };
        Insert: {
          address?: string | null;
          assigned_at?: string;
          experiment_id: string;
          id?: string;
          property_id?: string | null;
          score_at_assignment?: number | null;
          variant: string;
        };
        Update: {
          address?: string | null;
          assigned_at?: string;
          experiment_id?: string;
          id?: string;
          property_id?: string | null;
          score_at_assignment?: number | null;
          variant?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'experiment_assignments_experiment_id_fkey';
            columns: ['experiment_id'];
            isOneToOne: false;
            referencedRelation: 'scoring_experiments';
            referencedColumns: ['experiment_id'];
          },
          {
            foreignKeyName: 'experiment_assignments_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      experiment_outcomes: {
        Row: {
          assignment_id: string;
          contacted: boolean | null;
          contacted_at: string | null;
          created_at: string;
          deal_closed: boolean | null;
          deal_created: boolean | null;
          deal_id: string | null;
          deal_profit: number | null;
          experiment_id: string;
          id: string;
          responded: boolean | null;
          responded_at: string | null;
          updated_at: string;
        };
        Insert: {
          assignment_id: string;
          contacted?: boolean | null;
          contacted_at?: string | null;
          created_at?: string;
          deal_closed?: boolean | null;
          deal_created?: boolean | null;
          deal_id?: string | null;
          deal_profit?: number | null;
          experiment_id: string;
          id?: string;
          responded?: boolean | null;
          responded_at?: string | null;
          updated_at?: string;
        };
        Update: {
          assignment_id?: string;
          contacted?: boolean | null;
          contacted_at?: string | null;
          created_at?: string;
          deal_closed?: boolean | null;
          deal_created?: boolean | null;
          deal_id?: string | null;
          deal_profit?: number | null;
          experiment_id?: string;
          id?: string;
          responded?: boolean | null;
          responded_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'experiment_outcomes_assignment_id_fkey';
            columns: ['assignment_id'];
            isOneToOne: false;
            referencedRelation: 'experiment_assignments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'experiment_outcomes_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'experiment_outcomes_experiment_id_fkey';
            columns: ['experiment_id'];
            isOneToOne: false;
            referencedRelation: 'scoring_experiments';
            referencedColumns: ['experiment_id'];
          },
        ];
      };
      geo_vitality_scores: {
        Row: {
          avg_inspection_pass_rate: number | null;
          avg_job_value: number | null;
          calculated_at: string | null;
          city: string | null;
          county: string | null;
          created_at: string | null;
          geo_id: string | null;
          geo_key: string;
          geo_type: string | null;
          high_value_permit_count: number | null;
          high_value_ratio_score: number | null;
          id: string;
          improvement_permit_count: number | null;
          improvement_ratio_score: number | null;
          inspection_pass_score: number | null;
          permit_volume_score: number | null;
          permits_last_12_months: number | null;
          permits_prior_12_months: number | null;
          property_count: number | null;
          state: string;
          total_permits: number | null;
          updated_at: string | null;
          vertical_scores: Json | null;
          vitality_score: number | null;
          yoy_growth_rate: number | null;
          yoy_growth_score: number | null;
          zip_code: string | null;
        };
        Insert: {
          avg_inspection_pass_rate?: number | null;
          avg_job_value?: number | null;
          calculated_at?: string | null;
          city?: string | null;
          county?: string | null;
          created_at?: string | null;
          geo_id?: string | null;
          geo_key: string;
          geo_type?: string | null;
          high_value_permit_count?: number | null;
          high_value_ratio_score?: number | null;
          id?: string;
          improvement_permit_count?: number | null;
          improvement_ratio_score?: number | null;
          inspection_pass_score?: number | null;
          permit_volume_score?: number | null;
          permits_last_12_months?: number | null;
          permits_prior_12_months?: number | null;
          property_count?: number | null;
          state: string;
          total_permits?: number | null;
          updated_at?: string | null;
          vertical_scores?: Json | null;
          vitality_score?: number | null;
          yoy_growth_rate?: number | null;
          yoy_growth_score?: number | null;
          zip_code?: string | null;
        };
        Update: {
          avg_inspection_pass_rate?: number | null;
          avg_job_value?: number | null;
          calculated_at?: string | null;
          city?: string | null;
          county?: string | null;
          created_at?: string | null;
          geo_id?: string | null;
          geo_key?: string;
          geo_type?: string | null;
          high_value_permit_count?: number | null;
          high_value_ratio_score?: number | null;
          id?: string;
          improvement_permit_count?: number | null;
          improvement_ratio_score?: number | null;
          inspection_pass_score?: number | null;
          permit_volume_score?: number | null;
          permits_last_12_months?: number | null;
          permits_prior_12_months?: number | null;
          property_count?: number | null;
          state?: string;
          total_permits?: number | null;
          updated_at?: string | null;
          vertical_scores?: Json | null;
          vitality_score?: number | null;
          yoy_growth_rate?: number | null;
          yoy_growth_score?: number | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      heat_map_cache: {
        Row: {
          created_at: string | null;
          data: Json;
          expires_at: string;
          generated_at: string | null;
          geographic_bounds: Json;
          id: string;
          layer_type: string;
          updated_at: string | null;
          zoom_level: number | null;
        };
        Insert: {
          created_at?: string | null;
          data: Json;
          expires_at: string;
          generated_at?: string | null;
          geographic_bounds: Json;
          id?: string;
          layer_type: string;
          updated_at?: string | null;
          zoom_level?: number | null;
        };
        Update: {
          created_at?: string | null;
          data?: Json;
          expires_at?: string;
          generated_at?: string | null;
          geographic_bounds?: Json;
          id?: string;
          layer_type?: string;
          updated_at?: string | null;
          zoom_level?: number | null;
        };
        Relationships: [];
      };
      historical_deal_embeddings: {
        Row: {
          content_hash: string | null;
          created_at: string | null;
          deal_id: string;
          embedding: string;
          id: string;
          model_version: string | null;
          updated_at: string | null;
        };
        Insert: {
          content_hash?: string | null;
          created_at?: string | null;
          deal_id: string;
          embedding: string;
          id?: string;
          model_version?: string | null;
          updated_at?: string | null;
        };
        Update: {
          content_hash?: string | null;
          created_at?: string | null;
          deal_id?: string;
          embedding?: string;
          id?: string;
          model_version?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'historical_deal_embeddings_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: true;
            referencedRelation: 'historical_deals';
            referencedColumns: ['id'];
          },
        ];
      };
      historical_deals: {
        Row: {
          acquisition_source: string | null;
          address: string;
          arv: number | null;
          assignment_fee: number | null;
          bathrooms: number | null;
          bedrooms: number | null;
          city: string | null;
          close_date: string | null;
          closing_cost: number | null;
          contract_date: string | null;
          county: string | null;
          created_at: string | null;
          created_by: string | null;
          data_source: string | null;
          days_to_close: number | null;
          deal_type: string | null;
          exit_strategy: string | null;
          external_id: string | null;
          holding_cost: number | null;
          id: string;
          lessons_learned: string | null;
          lot_size: number | null;
          market_dom_at_deal: number | null;
          market_inventory_at_deal: number | null;
          market_sale_to_list_ratio: number | null;
          outcome: string | null;
          outcome_notes: string | null;
          ownership_duration_months: number | null;
          profit: number | null;
          property_type: string | null;
          purchase_price: number;
          repair_cost: number | null;
          roi: number | null;
          sale_price: number | null;
          seller_motivation_score: number | null;
          seller_type: string | null;
          square_footage: number | null;
          state: string | null;
          updated_at: string | null;
          was_absentee_owner: boolean | null;
          year_built: number | null;
          zip_code: string | null;
        };
        Insert: {
          acquisition_source?: string | null;
          address: string;
          arv?: number | null;
          assignment_fee?: number | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          city?: string | null;
          close_date?: string | null;
          closing_cost?: number | null;
          contract_date?: string | null;
          county?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          data_source?: string | null;
          days_to_close?: number | null;
          deal_type?: string | null;
          exit_strategy?: string | null;
          external_id?: string | null;
          holding_cost?: number | null;
          id?: string;
          lessons_learned?: string | null;
          lot_size?: number | null;
          market_dom_at_deal?: number | null;
          market_inventory_at_deal?: number | null;
          market_sale_to_list_ratio?: number | null;
          outcome?: string | null;
          outcome_notes?: string | null;
          ownership_duration_months?: number | null;
          profit?: number | null;
          property_type?: string | null;
          purchase_price: number;
          repair_cost?: number | null;
          roi?: number | null;
          sale_price?: number | null;
          seller_motivation_score?: number | null;
          seller_type?: string | null;
          square_footage?: number | null;
          state?: string | null;
          updated_at?: string | null;
          was_absentee_owner?: boolean | null;
          year_built?: number | null;
          zip_code?: string | null;
        };
        Update: {
          acquisition_source?: string | null;
          address?: string;
          arv?: number | null;
          assignment_fee?: number | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          city?: string | null;
          close_date?: string | null;
          closing_cost?: number | null;
          contract_date?: string | null;
          county?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          data_source?: string | null;
          days_to_close?: number | null;
          deal_type?: string | null;
          exit_strategy?: string | null;
          external_id?: string | null;
          holding_cost?: number | null;
          id?: string;
          lessons_learned?: string | null;
          lot_size?: number | null;
          market_dom_at_deal?: number | null;
          market_inventory_at_deal?: number | null;
          market_sale_to_list_ratio?: number | null;
          outcome?: string | null;
          outcome_notes?: string | null;
          ownership_duration_months?: number | null;
          profit?: number | null;
          property_type?: string | null;
          purchase_price?: number;
          repair_cost?: number | null;
          roi?: number | null;
          sale_price?: number | null;
          seller_motivation_score?: number | null;
          seller_type?: string | null;
          square_footage?: number | null;
          state?: string | null;
          updated_at?: string | null;
          was_absentee_owner?: boolean | null;
          year_built?: number | null;
          zip_code?: string | null;
        };
        Relationships: [];
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
      lead_list_members: {
        Row: {
          added_at: string | null;
          added_by: string | null;
          id: string;
          lead_id: string;
          lead_list_id: string;
          metadata: Json | null;
        };
        Insert: {
          added_at?: string | null;
          added_by?: string | null;
          id?: string;
          lead_id: string;
          lead_list_id: string;
          metadata?: Json | null;
        };
        Update: {
          added_at?: string | null;
          added_by?: string | null;
          id?: string;
          lead_id?: string;
          lead_list_id?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_list_members_added_by_fkey';
            columns: ['added_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_list_members_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_list_members_lead_list_id_fkey';
            columns: ['lead_list_id'];
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
          assigned_to: string | null;
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
          assigned_to?: string | null;
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
          assigned_to?: string | null;
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
            foreignKeyName: 'leads_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
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
      market_velocity_aggregates: {
        Row: {
          avg_velocity_index: number | null;
          bounds_east: number | null;
          bounds_north: number | null;
          bounds_south: number | null;
          bounds_west: number | null;
          calculated_at: string | null;
          center_lat: number | null;
          center_lng: number | null;
          cold_zip_count: number | null;
          created_at: string | null;
          dominant_classification: string | null;
          expires_at: string | null;
          geo_id: string | null;
          geo_name: string;
          geo_type: string;
          hot_zip_count: number | null;
          id: string;
          max_velocity_index: number | null;
          median_velocity_index: number | null;
          min_velocity_index: number | null;
          state: string;
          updated_at: string | null;
          velocity_trend: string | null;
          zip_count: number | null;
        };
        Insert: {
          avg_velocity_index?: number | null;
          bounds_east?: number | null;
          bounds_north?: number | null;
          bounds_south?: number | null;
          bounds_west?: number | null;
          calculated_at?: string | null;
          center_lat?: number | null;
          center_lng?: number | null;
          cold_zip_count?: number | null;
          created_at?: string | null;
          dominant_classification?: string | null;
          expires_at?: string | null;
          geo_id?: string | null;
          geo_name: string;
          geo_type: string;
          hot_zip_count?: number | null;
          id?: string;
          max_velocity_index?: number | null;
          median_velocity_index?: number | null;
          min_velocity_index?: number | null;
          state: string;
          updated_at?: string | null;
          velocity_trend?: string | null;
          zip_count?: number | null;
        };
        Update: {
          avg_velocity_index?: number | null;
          bounds_east?: number | null;
          bounds_north?: number | null;
          bounds_south?: number | null;
          bounds_west?: number | null;
          calculated_at?: string | null;
          center_lat?: number | null;
          center_lng?: number | null;
          cold_zip_count?: number | null;
          created_at?: string | null;
          dominant_classification?: string | null;
          expires_at?: string | null;
          geo_id?: string | null;
          geo_name?: string;
          geo_type?: string;
          hot_zip_count?: number | null;
          id?: string;
          max_velocity_index?: number | null;
          median_velocity_index?: number | null;
          min_velocity_index?: number | null;
          state?: string;
          updated_at?: string | null;
          velocity_trend?: string | null;
          zip_count?: number | null;
        };
        Relationships: [];
      };
      market_velocity_history: {
        Row: {
          calculated_at: string | null;
          classification: string;
          component_scores: Json | null;
          created_at: string | null;
          id: string;
          raw_metrics: Json | null;
          velocity_index: number;
          zip_code: string;
        };
        Insert: {
          calculated_at?: string | null;
          classification: string;
          component_scores?: Json | null;
          created_at?: string | null;
          id?: string;
          raw_metrics?: Json | null;
          velocity_index: number;
          zip_code: string;
        };
        Update: {
          calculated_at?: string | null;
          classification?: string;
          component_scores?: Json | null;
          created_at?: string | null;
          id?: string;
          raw_metrics?: Json | null;
          velocity_index?: number;
          zip_code?: string;
        };
        Relationships: [];
      };
      market_velocity_index: {
        Row: {
          absorption_rate: number | null;
          absorption_score: number | null;
          avg_days_on_market: number | null;
          calculated_at: string | null;
          center_lat: number | null;
          center_lng: number | null;
          city: string | null;
          classification: string;
          county: string | null;
          created_at: string | null;
          days_on_market_score: number | null;
          expires_at: string | null;
          geo_id: string | null;
          id: string;
          inventory_score: number | null;
          investment_conviction_score: number | null;
          median_days_on_market: number | null;
          months_of_inventory: number | null;
          permit_activity_score: number | null;
          permit_value_total: number | null;
          permit_volume: number | null;
          rentcast_data_date: string | null;
          shovels_data_date: string | null;
          state: string | null;
          total_listings: number | null;
          updated_at: string | null;
          velocity_change: number | null;
          velocity_index: number;
          velocity_trend: string | null;
          zip_code: string;
        };
        Insert: {
          absorption_rate?: number | null;
          absorption_score?: number | null;
          avg_days_on_market?: number | null;
          calculated_at?: string | null;
          center_lat?: number | null;
          center_lng?: number | null;
          city?: string | null;
          classification: string;
          county?: string | null;
          created_at?: string | null;
          days_on_market_score?: number | null;
          expires_at?: string | null;
          geo_id?: string | null;
          id?: string;
          inventory_score?: number | null;
          investment_conviction_score?: number | null;
          median_days_on_market?: number | null;
          months_of_inventory?: number | null;
          permit_activity_score?: number | null;
          permit_value_total?: number | null;
          permit_volume?: number | null;
          rentcast_data_date?: string | null;
          shovels_data_date?: string | null;
          state?: string | null;
          total_listings?: number | null;
          updated_at?: string | null;
          velocity_change?: number | null;
          velocity_index: number;
          velocity_trend?: string | null;
          zip_code: string;
        };
        Update: {
          absorption_rate?: number | null;
          absorption_score?: number | null;
          avg_days_on_market?: number | null;
          calculated_at?: string | null;
          center_lat?: number | null;
          center_lng?: number | null;
          city?: string | null;
          classification?: string;
          county?: string | null;
          created_at?: string | null;
          days_on_market_score?: number | null;
          expires_at?: string | null;
          geo_id?: string | null;
          id?: string;
          inventory_score?: number | null;
          investment_conviction_score?: number | null;
          median_days_on_market?: number | null;
          months_of_inventory?: number | null;
          permit_activity_score?: number | null;
          permit_value_total?: number | null;
          permit_volume?: number | null;
          rentcast_data_date?: string | null;
          shovels_data_date?: string | null;
          state?: string | null;
          total_listings?: number | null;
          updated_at?: string | null;
          velocity_change?: number | null;
          velocity_index?: number;
          velocity_trend?: string | null;
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
          is_read: boolean | null;
          lead_id: string | null;
          metadata: Json | null;
          read_at: string | null;
          recipient: string | null;
          sender: string | null;
          sensitivity_flags: Json | null;
          status: string | null;
          subject: string | null;
          thread_id: string | null;
          transcription: string | null;
          user_id: string;
          voicemail_url: string | null;
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
          is_read?: boolean | null;
          lead_id?: string | null;
          metadata?: Json | null;
          read_at?: string | null;
          recipient?: string | null;
          sender?: string | null;
          sensitivity_flags?: Json | null;
          status?: string | null;
          subject?: string | null;
          thread_id?: string | null;
          transcription?: string | null;
          user_id: string;
          voicemail_url?: string | null;
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
          is_read?: boolean | null;
          lead_id?: string | null;
          metadata?: Json | null;
          read_at?: string | null;
          recipient?: string | null;
          sender?: string | null;
          sensitivity_flags?: Json | null;
          status?: string | null;
          subject?: string | null;
          thread_id?: string | null;
          transcription?: string | null;
          user_id?: string;
          voicemail_url?: string | null;
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
            foreignKeyName: 'messages_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
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
      motivation_scores: {
        Row: {
          address: string | null;
          ai_adjustments: Json | null;
          confidence: number;
          created_at: string;
          created_by: string | null;
          factors: Json;
          id: string;
          model_used: string;
          owner_classification_id: string | null;
          property_id: string | null;
          recommendation: string | null;
          risk_factors: string[] | null;
          score: number;
          score_type: string;
        };
        Insert: {
          address?: string | null;
          ai_adjustments?: Json | null;
          confidence: number;
          created_at?: string;
          created_by?: string | null;
          factors?: Json;
          id?: string;
          model_used: string;
          owner_classification_id?: string | null;
          property_id?: string | null;
          recommendation?: string | null;
          risk_factors?: string[] | null;
          score: number;
          score_type: string;
        };
        Update: {
          address?: string | null;
          ai_adjustments?: Json | null;
          confidence?: number;
          created_at?: string;
          created_by?: string | null;
          factors?: Json;
          id?: string;
          model_used?: string;
          owner_classification_id?: string | null;
          property_id?: string | null;
          recommendation?: string | null;
          risk_factors?: string[] | null;
          score?: number;
          score_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'motivation_scores_owner_classification_id_fkey';
            columns: ['owner_classification_id'];
            isOneToOne: false;
            referencedRelation: 'owner_classifications';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'motivation_scores_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          dismissed_at: string | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          is_read: boolean | null;
          link: string | null;
          message: string | null;
          priority: string | null;
          read_at: string | null;
          snoozed_until: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          dismissed_at?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          is_read?: boolean | null;
          link?: string | null;
          message?: string | null;
          priority?: string | null;
          read_at?: string | null;
          snoozed_until?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          dismissed_at?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          is_read?: boolean | null;
          link?: string | null;
          message?: string | null;
          priority?: string | null;
          read_at?: string | null;
          snoozed_until?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
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
      opt_outs: {
        Row: {
          channel: string;
          contact_identifier: string;
          id: string;
          opted_out_at: string | null;
          reason: string | null;
          user_id: string;
        };
        Insert: {
          channel: string;
          contact_identifier: string;
          id?: string;
          opted_out_at?: string | null;
          reason?: string | null;
          user_id: string;
        };
        Update: {
          channel?: string;
          contact_identifier?: string;
          id?: string;
          opted_out_at?: string | null;
          reason?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opt_outs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      owner_classifications: {
        Row: {
          address: string | null;
          classified_at: string;
          confidence: number;
          expires_at: string;
          id: string;
          matched_patterns: string[] | null;
          owner_name: string;
          primary_class: string;
          property_id: string | null;
          sub_class: string;
        };
        Insert: {
          address?: string | null;
          classified_at?: string;
          confidence: number;
          expires_at?: string;
          id?: string;
          matched_patterns?: string[] | null;
          owner_name: string;
          primary_class: string;
          property_id?: string | null;
          sub_class: string;
        };
        Update: {
          address?: string | null;
          classified_at?: string;
          confidence?: number;
          expires_at?: string;
          id?: string;
          matched_patterns?: string[] | null;
          owner_name?: string;
          primary_class?: string;
          property_id?: string | null;
          sub_class?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'owner_classifications_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      pending_recommendations: {
        Row: {
          created_at: string | null;
          expires_at: string;
          id: string;
          match_factors: Json | null;
          property_id: string;
          reason: string;
          score: number;
          shown_at: string | null;
          status: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          expires_at: string;
          id?: string;
          match_factors?: Json | null;
          property_id: string;
          reason: string;
          score: number;
          shown_at?: string | null;
          status?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          expires_at?: string;
          id?: string;
          match_factors?: Json | null;
          property_id?: string;
          reason?: string;
          score?: number;
          shown_at?: string | null;
          status?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          address: string;
          arv: number | null;
          asking_price: number | null;
          bathrooms: number | null;
          bedrooms: number | null;
          census_block_group_geoid: string | null;
          census_county_fips: string | null;
          census_geocoded_at: string | null;
          census_state_fips: string | null;
          census_tract_geoid: string | null;
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
          shovels_address_id: string | null;
          shovels_matched_at: string | null;
          square_footage: number | null;
          state: string | null;
          subdivision: string | null;
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
          census_block_group_geoid?: string | null;
          census_county_fips?: string | null;
          census_geocoded_at?: string | null;
          census_state_fips?: string | null;
          census_tract_geoid?: string | null;
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
          shovels_address_id?: string | null;
          shovels_matched_at?: string | null;
          square_footage?: number | null;
          state?: string | null;
          subdivision?: string | null;
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
          census_block_group_geoid?: string | null;
          census_county_fips?: string | null;
          census_geocoded_at?: string | null;
          census_state_fips?: string | null;
          census_tract_geoid?: string | null;
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
          shovels_address_id?: string | null;
          shovels_matched_at?: string | null;
          square_footage?: number | null;
          state?: string | null;
          subdivision?: string | null;
          updated_at?: string | null;
          year_built?: number | null;
          zip?: string | null;
        };
        Relationships: [];
      };
      property_signals: {
        Row: {
          address: string | null;
          expires_at: string;
          fetched_at: string;
          id: string;
          property_id: string | null;
          signal_data: Json;
          signal_source: string;
        };
        Insert: {
          address?: string | null;
          expires_at?: string;
          fetched_at?: string;
          id?: string;
          property_id?: string | null;
          signal_data?: Json;
          signal_source: string;
        };
        Update: {
          address?: string | null;
          expires_at?: string;
          fetched_at?: string;
          id?: string;
          property_id?: string | null;
          signal_data?: Json;
          signal_source?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'property_signals_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      recommendation_interactions: {
        Row: {
          action: string;
          action_at: string | null;
          created_at: string | null;
          id: string;
          metadata: Json | null;
          property_id: string;
          recommendation_score: number;
          user_id: string;
        };
        Insert: {
          action: string;
          action_at?: string | null;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          property_id: string;
          recommendation_score: number;
          user_id: string;
        };
        Update: {
          action?: string;
          action_at?: string | null;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          property_id?: string;
          recommendation_score?: number;
          user_id?: string;
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
      scoring_experiments: {
        Row: {
          control_config: Json;
          control_percentage: number;
          created_at: string;
          created_by: string | null;
          description: string | null;
          end_date: string | null;
          experiment_id: string;
          id: string;
          min_sample_size: number | null;
          name: string;
          primary_metric: string;
          secondary_metrics: string[] | null;
          start_date: string | null;
          status: string;
          treatment_config: Json;
          updated_at: string;
        };
        Insert: {
          control_config: Json;
          control_percentage?: number;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_date?: string | null;
          experiment_id: string;
          id?: string;
          min_sample_size?: number | null;
          name: string;
          primary_metric?: string;
          secondary_metrics?: string[] | null;
          start_date?: string | null;
          status?: string;
          treatment_config: Json;
          updated_at?: string;
        };
        Update: {
          control_config?: Json;
          control_percentage?: number;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_date?: string | null;
          experiment_id?: string;
          id?: string;
          min_sample_size?: number | null;
          name?: string;
          primary_metric?: string;
          secondary_metrics?: string[] | null;
          start_date?: string | null;
          status?: string;
          treatment_config?: Json;
          updated_at?: string;
        };
        Relationships: [];
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
      shovels_address_metrics: {
        Row: {
          active_permits: number | null;
          avg_inspection_pass_rate: number | null;
          avg_job_value: number | null;
          calculated_at: string | null;
          city: string | null;
          completed_permits: number | null;
          county: string | null;
          created_at: string | null;
          expired_permits: number | null;
          first_permit_date: string | null;
          formatted_address: string | null;
          has_expired_permit: boolean | null;
          has_stalled_permit: boolean | null;
          high_value_permit_ratio: number | null;
          id: string;
          improvement_permit_ratio: number | null;
          last_electrical_date: string | null;
          last_hvac_date: string | null;
          last_permit_date: string | null;
          last_plumbing_date: string | null;
          last_roofing_date: string | null;
          last_solar_date: string | null;
          last_water_heater_date: string | null;
          max_job_value: number | null;
          permit_counts_by_tag: Json | null;
          permits_last_12_months: number | null;
          permits_prior_12_months: number | null;
          shovels_address_id: string;
          state: string | null;
          street_address: string;
          total_job_value: number | null;
          total_permits: number | null;
          updated_at: string | null;
          yoy_permit_growth: number | null;
          zip_code: string | null;
        };
        Insert: {
          active_permits?: number | null;
          avg_inspection_pass_rate?: number | null;
          avg_job_value?: number | null;
          calculated_at?: string | null;
          city?: string | null;
          completed_permits?: number | null;
          county?: string | null;
          created_at?: string | null;
          expired_permits?: number | null;
          first_permit_date?: string | null;
          formatted_address?: string | null;
          has_expired_permit?: boolean | null;
          has_stalled_permit?: boolean | null;
          high_value_permit_ratio?: number | null;
          id?: string;
          improvement_permit_ratio?: number | null;
          last_electrical_date?: string | null;
          last_hvac_date?: string | null;
          last_permit_date?: string | null;
          last_plumbing_date?: string | null;
          last_roofing_date?: string | null;
          last_solar_date?: string | null;
          last_water_heater_date?: string | null;
          max_job_value?: number | null;
          permit_counts_by_tag?: Json | null;
          permits_last_12_months?: number | null;
          permits_prior_12_months?: number | null;
          shovels_address_id: string;
          state?: string | null;
          street_address: string;
          total_job_value?: number | null;
          total_permits?: number | null;
          updated_at?: string | null;
          yoy_permit_growth?: number | null;
          zip_code?: string | null;
        };
        Update: {
          active_permits?: number | null;
          avg_inspection_pass_rate?: number | null;
          avg_job_value?: number | null;
          calculated_at?: string | null;
          city?: string | null;
          completed_permits?: number | null;
          county?: string | null;
          created_at?: string | null;
          expired_permits?: number | null;
          first_permit_date?: string | null;
          formatted_address?: string | null;
          has_expired_permit?: boolean | null;
          has_stalled_permit?: boolean | null;
          high_value_permit_ratio?: number | null;
          id?: string;
          improvement_permit_ratio?: number | null;
          last_electrical_date?: string | null;
          last_hvac_date?: string | null;
          last_permit_date?: string | null;
          last_plumbing_date?: string | null;
          last_roofing_date?: string | null;
          last_solar_date?: string | null;
          last_water_heater_date?: string | null;
          max_job_value?: number | null;
          permit_counts_by_tag?: Json | null;
          permits_last_12_months?: number | null;
          permits_prior_12_months?: number | null;
          shovels_address_id?: string;
          state?: string | null;
          street_address?: string;
          total_job_value?: number | null;
          total_permits?: number | null;
          updated_at?: string | null;
          yoy_permit_growth?: number | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      shovels_contractors: {
        Row: {
          active_permits: number | null;
          avg_inspection_pass_rate: number | null;
          avg_job_value: number | null;
          city: string | null;
          created_at: string | null;
          email: string | null;
          first_permit_date: string | null;
          id: string;
          last_permit_date: string | null;
          license_number: string | null;
          license_status: string | null;
          license_type: string | null;
          name: string;
          on_time_completion_rate: number | null;
          phone: string | null;
          raw_data: Json | null;
          shovels_contractor_id: string;
          specializations: string[] | null;
          state: string | null;
          street_address: string | null;
          total_job_value: number | null;
          total_permits: number | null;
          updated_at: string | null;
          website: string | null;
          years_active: number | null;
          zip_code: string | null;
        };
        Insert: {
          active_permits?: number | null;
          avg_inspection_pass_rate?: number | null;
          avg_job_value?: number | null;
          city?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_permit_date?: string | null;
          id?: string;
          last_permit_date?: string | null;
          license_number?: string | null;
          license_status?: string | null;
          license_type?: string | null;
          name: string;
          on_time_completion_rate?: number | null;
          phone?: string | null;
          raw_data?: Json | null;
          shovels_contractor_id: string;
          specializations?: string[] | null;
          state?: string | null;
          street_address?: string | null;
          total_job_value?: number | null;
          total_permits?: number | null;
          updated_at?: string | null;
          website?: string | null;
          years_active?: number | null;
          zip_code?: string | null;
        };
        Update: {
          active_permits?: number | null;
          avg_inspection_pass_rate?: number | null;
          avg_job_value?: number | null;
          city?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_permit_date?: string | null;
          id?: string;
          last_permit_date?: string | null;
          license_number?: string | null;
          license_status?: string | null;
          license_type?: string | null;
          name?: string;
          on_time_completion_rate?: number | null;
          phone?: string | null;
          raw_data?: Json | null;
          shovels_contractor_id?: string;
          specializations?: string[] | null;
          state?: string | null;
          street_address?: string | null;
          total_job_value?: number | null;
          total_permits?: number | null;
          updated_at?: string | null;
          website?: string | null;
          years_active?: number | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      shovels_permits: {
        Row: {
          approval_days: number | null;
          city: string | null;
          construction_days: number | null;
          contractor_id: string | null;
          contractor_license: string | null;
          contractor_name: string | null;
          county: string | null;
          created_at: string | null;
          expiration_date: string | null;
          failed_inspections: number | null;
          fee_total: number | null;
          file_date: string | null;
          final_date: string | null;
          id: string;
          inspection_pass_rate: number | null;
          issue_date: string | null;
          job_value: number | null;
          latitude: number | null;
          longitude: number | null;
          passed_inspections: number | null;
          permit_description: string | null;
          permit_number: string | null;
          permit_status: string | null;
          permit_type: string | null;
          raw_data: Json | null;
          shovels_address_id: string;
          shovels_permit_id: string;
          state: string | null;
          street_address: string | null;
          tags: string[] | null;
          total_inspections: number | null;
          updated_at: string | null;
          zip_code: string | null;
        };
        Insert: {
          approval_days?: number | null;
          city?: string | null;
          construction_days?: number | null;
          contractor_id?: string | null;
          contractor_license?: string | null;
          contractor_name?: string | null;
          county?: string | null;
          created_at?: string | null;
          expiration_date?: string | null;
          failed_inspections?: number | null;
          fee_total?: number | null;
          file_date?: string | null;
          final_date?: string | null;
          id?: string;
          inspection_pass_rate?: number | null;
          issue_date?: string | null;
          job_value?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          passed_inspections?: number | null;
          permit_description?: string | null;
          permit_number?: string | null;
          permit_status?: string | null;
          permit_type?: string | null;
          raw_data?: Json | null;
          shovels_address_id: string;
          shovels_permit_id: string;
          state?: string | null;
          street_address?: string | null;
          tags?: string[] | null;
          total_inspections?: number | null;
          updated_at?: string | null;
          zip_code?: string | null;
        };
        Update: {
          approval_days?: number | null;
          city?: string | null;
          construction_days?: number | null;
          contractor_id?: string | null;
          contractor_license?: string | null;
          contractor_name?: string | null;
          county?: string | null;
          created_at?: string | null;
          expiration_date?: string | null;
          failed_inspections?: number | null;
          fee_total?: number | null;
          file_date?: string | null;
          final_date?: string | null;
          id?: string;
          inspection_pass_rate?: number | null;
          issue_date?: string | null;
          job_value?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          passed_inspections?: number | null;
          permit_description?: string | null;
          permit_number?: string | null;
          permit_status?: string | null;
          permit_type?: string | null;
          raw_data?: Json | null;
          shovels_address_id?: string;
          shovels_permit_id?: string;
          state?: string | null;
          street_address?: string | null;
          tags?: string[] | null;
          total_inspections?: number | null;
          updated_at?: string | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          assigned_to: string | null;
          completed_at: string | null;
          created_at: string | null;
          deal_id: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          lead_id: string | null;
          metadata: Json | null;
          priority: string;
          property_id: string | null;
          status: string;
          title: string;
          updated_at: string | null;
          user_id: string;
          workflow_execution_id: string | null;
          workflow_id: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          deal_id?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          lead_id?: string | null;
          metadata?: Json | null;
          priority?: string;
          property_id?: string | null;
          status?: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
          workflow_execution_id?: string | null;
          workflow_id?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          deal_id?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          lead_id?: string | null;
          metadata?: Json | null;
          priority?: string;
          property_id?: string | null;
          status?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
          workflow_execution_id?: string | null;
          workflow_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_workflow_execution_id_fkey';
            columns: ['workflow_execution_id'];
            isOneToOne: false;
            referencedRelation: 'workflow_executions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_workflow_id_fkey';
            columns: ['workflow_id'];
            isOneToOne: false;
            referencedRelation: 'workflows';
            referencedColumns: ['id'];
          },
        ];
      };
      team_invitations: {
        Row: {
          accepted_at: string | null;
          created_at: string | null;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          role: string;
          team_id: string;
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string | null;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          role?: string;
          team_id: string;
          token: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string | null;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role?: string;
          team_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_invitations_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
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
          approval_required: boolean | null;
          body_template: string;
          category: string | null;
          channel: string;
          created_at: string | null;
          forbidden_topics: Json | null;
          id: string;
          is_active: boolean | null;
          name: string;
          sensitivity_level: string | null;
          subject_template: string | null;
          template_type: string | null;
          updated_at: string | null;
          user_id: string;
          variables: Json | null;
        };
        Insert: {
          approval_required?: boolean | null;
          body_template: string;
          category?: string | null;
          channel: string;
          created_at?: string | null;
          forbidden_topics?: Json | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          sensitivity_level?: string | null;
          subject_template?: string | null;
          template_type?: string | null;
          updated_at?: string | null;
          user_id: string;
          variables?: Json | null;
        };
        Update: {
          approval_required?: boolean | null;
          body_template?: string;
          category?: string | null;
          channel?: string;
          created_at?: string | null;
          forbidden_topics?: Json | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          sensitivity_level?: string | null;
          subject_template?: string | null;
          template_type?: string | null;
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
      tracked_zip_codes: {
        Row: {
          center_lat: number | null;
          center_lng: number | null;
          city: string | null;
          county: string | null;
          created_at: string | null;
          geo_id: string | null;
          id: string;
          is_active: boolean | null;
          last_calculated_at: string | null;
          priority: number | null;
          state: string;
          updated_at: string | null;
          zip_code: string;
        };
        Insert: {
          center_lat?: number | null;
          center_lng?: number | null;
          city?: string | null;
          county?: string | null;
          created_at?: string | null;
          geo_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_calculated_at?: string | null;
          priority?: number | null;
          state: string;
          updated_at?: string | null;
          zip_code: string;
        };
        Update: {
          center_lat?: number | null;
          center_lng?: number | null;
          city?: string | null;
          county?: string | null;
          created_at?: string | null;
          geo_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_calculated_at?: string | null;
          priority?: number | null;
          state?: string;
          updated_at?: string | null;
          zip_code?: string;
        };
        Relationships: [];
      };
      user_favorite_tools: {
        Row: {
          favorited_at: string | null;
          id: string;
          tool_slug: string;
          user_id: string;
        };
        Insert: {
          favorited_at?: string | null;
          id?: string;
          tool_slug: string;
          user_id: string;
        };
        Update: {
          favorited_at?: string | null;
          id?: string;
          tool_slug?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_heat_map_data: {
        Row: {
          created_at: string | null;
          data: Json;
          id: string;
          layer_type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          data: Json;
          id?: string;
          layer_type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          data?: Json;
          id?: string;
          layer_type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
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
      user_recent_tools: {
        Row: {
          context: Json | null;
          id: string;
          tool_slug: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          context?: Json | null;
          id?: string;
          tool_slug: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          context?: Json | null;
          id?: string;
          tool_slug?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_success_profiles: {
        Row: {
          closed_deals_count: number | null;
          created_at: string | null;
          id: string;
          last_updated: string | null;
          pattern_weights: Json;
          profile_data: Json;
          user_id: string;
        };
        Insert: {
          closed_deals_count?: number | null;
          created_at?: string | null;
          id?: string;
          last_updated?: string | null;
          pattern_weights?: Json;
          profile_data?: Json;
          user_id: string;
        };
        Update: {
          closed_deals_count?: number | null;
          created_at?: string | null;
          id?: string;
          last_updated?: string | null;
          pattern_weights?: Json;
          profile_data?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      user_tasks: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          description: string | null;
          dismissed_at: string | null;
          due_date: string | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          metadata: Json | null;
          priority: string | null;
          source: string | null;
          task_type: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          dismissed_at?: string | null;
          due_date?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          metadata?: Json | null;
          priority?: string | null;
          source?: string | null;
          task_type: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          dismissed_at?: string | null;
          due_date?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          metadata?: Json | null;
          priority?: string | null;
          source?: string | null;
          task_type?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_tool_workflows: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_public: boolean | null;
          last_used_at: string | null;
          name: string;
          step_prompts: Json | null;
          tool_slugs: string[];
          updated_at: string | null;
          use_count: number | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          last_used_at?: string | null;
          name: string;
          step_prompts?: Json | null;
          tool_slugs: string[];
          updated_at?: string | null;
          use_count?: number | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          last_used_at?: string | null;
          name?: string;
          step_prompts?: Json | null;
          tool_slugs?: string[];
          updated_at?: string | null;
          use_count?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_verticals: {
        Row: {
          created_at: string | null;
          enabled_verticals: string[] | null;
          filter_presets: Json | null;
          id: string;
          primary_vertical: string;
          updated_at: string | null;
          user_id: string;
          vertical_settings: Json | null;
        };
        Insert: {
          created_at?: string | null;
          enabled_verticals?: string[] | null;
          filter_presets?: Json | null;
          id?: string;
          primary_vertical?: string;
          updated_at?: string | null;
          user_id: string;
          vertical_settings?: Json | null;
        };
        Update: {
          created_at?: string | null;
          enabled_verticals?: string[] | null;
          filter_presets?: Json | null;
          id?: string;
          primary_vertical?: string;
          updated_at?: string | null;
          user_id?: string;
          vertical_settings?: Json | null;
        };
        Relationships: [];
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
      workflow_executions: {
        Row: {
          actions_completed: number | null;
          actions_total: number | null;
          completed_at: string | null;
          created_at: string | null;
          error_message: string | null;
          execution_log: Json | null;
          id: string;
          started_at: string | null;
          status: string;
          trigger_data: Json;
          workflow_id: string;
        };
        Insert: {
          actions_completed?: number | null;
          actions_total?: number | null;
          completed_at?: string | null;
          created_at?: string | null;
          error_message?: string | null;
          execution_log?: Json | null;
          id?: string;
          started_at?: string | null;
          status?: string;
          trigger_data?: Json;
          workflow_id: string;
        };
        Update: {
          actions_completed?: number | null;
          actions_total?: number | null;
          completed_at?: string | null;
          created_at?: string | null;
          error_message?: string | null;
          execution_log?: Json | null;
          id?: string;
          started_at?: string | null;
          status?: string;
          trigger_data?: Json;
          workflow_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workflow_executions_workflow_id_fkey';
            columns: ['workflow_id'];
            isOneToOne: false;
            referencedRelation: 'workflows';
            referencedColumns: ['id'];
          },
        ];
      };
      workflows: {
        Row: {
          actions: Json;
          conditions: Json | null;
          created_at: string | null;
          description: string | null;
          execution_count: number | null;
          id: string;
          is_active: boolean | null;
          last_executed_at: string | null;
          name: string;
          trigger_config: Json;
          trigger_type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          actions?: Json;
          conditions?: Json | null;
          created_at?: string | null;
          description?: string | null;
          execution_count?: number | null;
          id?: string;
          is_active?: boolean | null;
          last_executed_at?: string | null;
          name: string;
          trigger_config?: Json;
          trigger_type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          actions?: Json;
          conditions?: Json | null;
          created_at?: string | null;
          description?: string | null;
          execution_count?: number | null;
          id?: string;
          is_active?: boolean | null;
          last_executed_at?: string | null;
          name?: string;
          trigger_config?: Json;
          trigger_type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workflows_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_city_velocity_aggregates: {
        Args: never;
        Returns: {
          avg_velocity_index: number;
          cold_zip_count: number;
          dominant_classification: string;
          geo_name: string;
          geo_type: string;
          hot_zip_count: number;
          max_velocity_index: number;
          median_velocity_index: number;
          min_velocity_index: number;
          state: string;
          zip_count: number;
        }[];
      };
      calculate_deal_outcome_patterns: { Args: never; Returns: undefined };
      calculate_experiment_stats: {
        Args: { p_experiment_id: string };
        Returns: Json;
      };
      clean_expired_heat_map_cache: { Args: never; Returns: number };
      clean_expired_motivation_caches: { Args: never; Returns: number };
      clean_expired_recommendations: { Args: never; Returns: number };
      find_similar_deals: {
        Args: {
          p_city?: string;
          p_deal_type?: string;
          p_limit?: number;
          p_price_max?: number;
          p_price_min?: number;
          p_seller_type?: string;
          p_state?: string;
        };
        Returns: {
          address: string;
          arv: number;
          city: string;
          days_to_close: number;
          deal_id: string;
          deal_type: string;
          lessons_learned: string;
          outcome: string;
          profit: number;
          purchase_price: number;
          relevance_score: number;
          roi: number;
          seller_type: string;
          state: string;
        }[];
      };
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
      get_comp_analyses_in_block_group: {
        Args: { p_block_group_geoid: string };
        Returns: {
          analysis_date: string;
          arv_confidence: number | null;
          block_group_polygon: Json | null;
          comps: Json;
          created_at: string | null;
          data_source: string | null;
          estimated_arv: number | null;
          id: string;
          scoring_config: Json;
          subject_address: string | null;
          subject_block_group_geoid: string | null;
          subject_latitude: number | null;
          subject_longitude: number | null;
          subject_property_id: string | null;
          subject_subdivision: string | null;
          subject_tract_geoid: string | null;
          summary: Json;
          tract_polygon: Json | null;
          updated_at: string | null;
          user_id: string | null;
        }[];
        SetofOptions: {
          from: '*';
          to: 'comp_analyses';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_comp_tier_stats: {
        Args: { p_analysis_id: string };
        Returns: {
          avg_score: number;
          count: number;
          tier: string;
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
      get_latest_comp_analysis: {
        Args: { p_property_id: string };
        Returns: {
          analysis_date: string;
          arv_confidence: number | null;
          block_group_polygon: Json | null;
          comps: Json;
          created_at: string | null;
          data_source: string | null;
          estimated_arv: number | null;
          id: string;
          scoring_config: Json;
          subject_address: string | null;
          subject_block_group_geoid: string | null;
          subject_latitude: number | null;
          subject_longitude: number | null;
          subject_property_id: string | null;
          subject_subdivision: string | null;
          subject_tract_geoid: string | null;
          summary: Json;
          tract_polygon: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'comp_analyses';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_or_create_experiment_assignment: {
        Args: {
          p_address?: string;
          p_experiment_id: string;
          p_property_id?: string;
        };
        Returns: {
          is_new: boolean;
          variant: string;
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
      get_velocity_for_bounds: {
        Args: {
          p_east: number;
          p_north: number;
          p_south: number;
          p_west: number;
        };
        Returns: {
          center_lat: number;
          center_lng: number;
          classification: string;
          velocity_index: number;
          zip_code: string;
        }[];
      };
      get_velocity_rankings: {
        Args: { p_limit?: number; p_state?: string; p_type?: string };
        Returns: {
          avg_days_on_market: number;
          city: string;
          classification: string;
          months_of_inventory: number;
          state: string;
          velocity_index: number;
          zip_code: string;
        }[];
      };
      has_abandoned_project: { Args: { property_id: string }; Returns: boolean };
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
      major_system_due: { Args: { property_id: string }; Returns: boolean };
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
      match_historical_deals: {
        Args: {
          filter_deal_type?: string;
          filter_outcome?: string;
          filter_state?: string;
          match_count?: number;
          query_embedding: string;
          similarity_threshold?: number;
        };
        Returns: {
          address: string;
          arv: number;
          city: string;
          days_to_close: number;
          deal_id: string;
          deal_type: string;
          lessons_learned: string;
          outcome: string;
          profit: number;
          purchase_price: number;
          roi: number;
          seller_type: string;
          similarity: number;
          state: string;
        }[];
      };
      neighborhood_permit_percentile: {
        Args: { zip_code: string };
        Returns: number;
      };
      property_inspection_pass_rate: {
        Args: { property_id: string };
        Returns: number;
      };
      property_permit_count: {
        Args: { property_id: string; since_date?: string };
        Returns: number;
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
