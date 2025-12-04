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
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          priority: string
          read_at: string | null
          read_by: string | null
          related_id: string | null
          related_table: string | null
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          priority?: string
          read_at?: string | null
          read_by?: string | null
          related_id?: string | null
          related_table?: string | null
          status?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          priority?: string
          read_at?: string | null
          read_by?: string | null
          related_id?: string | null
          related_table?: string | null
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_read_by_fkey"
            columns: ["read_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          created_at: string | null
          icon: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount_paid: number
          booking_date: string
          created_at: string | null
          gym_id: number
          gym_payout: number
          id: number
          pass_type: string
          platform_fee: number
          qr_code: Json | null
          qr_scanned_at: string | null
          qr_scanned_by: string | null
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
          waiver_ip_address: string | null
          waiver_signed: boolean | null
          waiver_signed_at: string | null
          waiver_version: string | null
        }
        Insert: {
          amount_paid: number
          booking_date: string
          created_at?: string | null
          gym_id: number
          gym_payout: number
          id?: number
          pass_type: string
          platform_fee: number
          qr_code?: Json | null
          qr_scanned_at?: string | null
          qr_scanned_by?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
          waiver_ip_address?: string | null
          waiver_signed?: boolean | null
          waiver_signed_at?: string | null
          waiver_version?: string | null
        }
        Update: {
          amount_paid?: number
          booking_date?: string
          created_at?: string | null
          gym_id?: number
          gym_payout?: number
          id?: number
          pass_type?: string
          platform_fee?: number
          qr_code?: Json | null
          qr_scanned_at?: string | null
          qr_scanned_by?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string
          waiver_ip_address?: string | null
          waiver_signed?: boolean | null
          waiver_signed_at?: string | null
          waiver_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_vitality_scores: {
        Row: {
          avg_inspection_pass_rate: number | null
          avg_job_value: number | null
          calculated_at: string | null
          city: string | null
          county: string | null
          created_at: string | null
          geo_key: string
          geo_type: string
          high_value_permit_count: number | null
          high_value_ratio_score: number | null
          id: string
          improvement_permit_count: number | null
          improvement_ratio_score: number | null
          inspection_pass_score: number | null
          permit_volume_score: number | null
          permits_last_12_months: number | null
          permits_prior_12_months: number | null
          property_count: number | null
          state: string
          total_permits: number | null
          updated_at: string | null
          vertical_scores: Json | null
          vitality_score: number | null
          yoy_growth_rate: number | null
          yoy_growth_score: number | null
          zip_code: string | null
        }
        Insert: {
          avg_inspection_pass_rate?: number | null
          avg_job_value?: number | null
          calculated_at?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          geo_key: string
          geo_type?: string
          high_value_permit_count?: number | null
          high_value_ratio_score?: number | null
          id?: string
          improvement_permit_count?: number | null
          improvement_ratio_score?: number | null
          inspection_pass_score?: number | null
          permit_volume_score?: number | null
          permits_last_12_months?: number | null
          permits_prior_12_months?: number | null
          property_count?: number | null
          state: string
          total_permits?: number | null
          updated_at?: string | null
          vertical_scores?: Json | null
          vitality_score?: number | null
          yoy_growth_rate?: number | null
          yoy_growth_score?: number | null
          zip_code?: string | null
        }
        Update: {
          avg_inspection_pass_rate?: number | null
          avg_job_value?: number | null
          calculated_at?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          geo_key?: string
          geo_type?: string
          high_value_permit_count?: number | null
          high_value_ratio_score?: number | null
          id?: string
          improvement_permit_count?: number | null
          improvement_ratio_score?: number | null
          inspection_pass_score?: number | null
          permit_volume_score?: number | null
          permits_last_12_months?: number | null
          permits_prior_12_months?: number | null
          property_count?: number | null
          state?: string
          total_permits?: number | null
          updated_at?: string | null
          vertical_scores?: Json | null
          vitality_score?: number | null
          yoy_growth_rate?: number | null
          yoy_growth_score?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      gym_amenities: {
        Row: {
          amenity_id: number
          created_at: string | null
          gym_id: number
          id: number
          is_verified: boolean | null
        }
        Insert: {
          amenity_id: number
          created_at?: string | null
          gym_id: number
          id?: number
          is_verified?: boolean | null
        }
        Update: {
          amenity_id?: number
          created_at?: string | null
          gym_id?: number
          id?: number
          is_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_amenities_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_claims: {
        Row: {
          additional_notes: string | null
          business_email: string
          claimant_email: string
          claimant_name: string
          claimant_phone: string
          created_at: string | null
          gym_id: number
          id: string
          proof_document_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          business_email: string
          claimant_email: string
          claimant_name: string
          claimant_phone: string
          created_at?: string | null
          gym_id: number
          id?: string
          proof_document_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          business_email?: string
          claimant_email?: string
          claimant_name?: string
          claimant_phone?: string
          created_at?: string | null
          gym_id?: number
          id?: string
          proof_document_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_claims_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_hours: {
        Row: {
          closes_at: string | null
          created_at: string | null
          day_of_week: number
          gym_id: number
          id: number
          is_closed: boolean | null
          opens_at: string | null
        }
        Insert: {
          closes_at?: string | null
          created_at?: string | null
          day_of_week: number
          gym_id: number
          id?: number
          is_closed?: boolean | null
          opens_at?: string | null
        }
        Update: {
          closes_at?: string | null
          created_at?: string | null
          day_of_week?: number
          gym_id?: number
          id?: number
          is_closed?: boolean | null
          opens_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_hours_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_owners: {
        Row: {
          created_at: string | null
          gym_name: string
          id: string
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gym_name: string
          id?: string
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gym_name?: string
          id?: string
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          gym_id: number
          id: number
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          gym_id: number
          id?: number
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          gym_id?: number
          id?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_photos_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_reviews: {
        Row: {
          booking_id: number | null
          comment: string
          created_at: string | null
          gym_id: number
          helpful_count: number | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: number | null
          comment: string
          created_at?: string | null
          gym_id: number
          helpful_count?: number | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: number | null
          comment?: string
          created_at?: string | null
          gym_id?: number
          helpful_count?: number | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_reviews_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_verification_queue: {
        Row: {
          created_at: string | null
          field_name: string
          gym_id: number
          id: string
          new_value: string
          old_value: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string
          status: string
          submitter_id: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          gym_id: number
          id?: string
          new_value: string
          old_value?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source: string
          status?: string
          submitter_id?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          gym_id?: number
          id?: string
          new_value?: string
          old_value?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          submitter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_verification_queue_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_verification_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_verification_queue_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string | null
          day_pass_price: number | null
          description: string | null
          google_place_id: string | null
          id: number
          is_verified: boolean | null
          latitude: number
          location: unknown
          longitude: number
          month_pass_price: number | null
          name: string
          owner_id: string
          phone: string | null
          rating: number | null
          review_count: number | null
          state: string
          updated_at: string | null
          website: string | null
          week_pass_price: number | null
        }
        Insert: {
          address: string
          city: string
          country: string
          created_at?: string | null
          day_pass_price?: number | null
          description?: string | null
          google_place_id?: string | null
          id?: number
          is_verified?: boolean | null
          latitude: number
          location?: unknown
          longitude: number
          month_pass_price?: number | null
          name: string
          owner_id: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          state: string
          updated_at?: string | null
          website?: string | null
          week_pass_price?: number | null
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string | null
          day_pass_price?: number | null
          description?: string | null
          google_place_id?: string | null
          id?: number
          is_verified?: boolean | null
          latitude?: number
          location?: unknown
          longitude?: number
          month_pass_price?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          state?: string
          updated_at?: string | null
          website?: string | null
          week_pass_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gyms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "gym_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          address: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string | null
          description: string
          gym_name: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          website: string | null
          why_partner: string
        }
        Insert: {
          address: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string | null
          description: string
          gym_name: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          website?: string | null
          why_partner: string
        }
        Update: {
          address?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          description?: string
          gym_name?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          website?: string | null
          why_partner?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          business_name: string
          created_at: string | null
          gym_id: number | null
          id: string
          status: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_onboarding_complete: boolean | null
          stripe_payouts_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_name: string
          created_at?: string | null
          gym_id?: number | null
          id?: string
          status?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_name?: string
          created_at?: string | null
          gym_id?: number | null
          id?: string
          status?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: true
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      passes: {
        Row: {
          booking_id: number
          check_in_count: number | null
          created_at: string | null
          gym_id: number
          id: string
          last_check_in_at: string | null
          pass_type: string
          qr_code_data: Json
          status: string
          updated_at: string | null
          user_id: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          booking_id: number
          check_in_count?: number | null
          created_at?: string | null
          gym_id: number
          id?: string
          last_check_in_at?: string | null
          pass_type: string
          qr_code_data: Json
          status?: string
          updated_at?: string | null
          user_id: string
          valid_from: string
          valid_until: string
        }
        Update: {
          booking_id?: number
          check_in_count?: number | null
          created_at?: string | null
          gym_id?: number
          id?: string
          last_check_in_at?: string | null
          pass_type?: string
          qr_code_data?: Json
          status?: string
          updated_at?: string | null
          user_id?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "passes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passes_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: number
          comment: string | null
          created_at: string | null
          gym_id: number
          helpful_count: number | null
          id: number
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: number
          comment?: string | null
          created_at?: string | null
          gym_id: number
          helpful_count?: number | null
          id?: number
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: number
          comment?: string | null
          created_at?: string | null
          gym_id?: number
          helpful_count?: number | null
          id?: number
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_gyms: {
        Row: {
          created_at: string | null
          gym_id: number
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gym_id: number
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          gym_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_gyms_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_gyms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          error_message: string | null
          gym_id: number | null
          id: string
          max_attempts: number | null
          priority: number | null
          processed_at: string | null
          result: Json | null
          source: string
          started_at: string | null
          status: string
          url: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          gym_id?: number | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          processed_at?: string | null
          result?: Json | null
          source: string
          started_at?: string | null
          status?: string
          url: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          gym_id?: number | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          processed_at?: string | null
          result?: Json | null
          source?: string
          started_at?: string | null
          status?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraping_queue_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_alerts: {
        Row: {
          alert_key: string
          alert_type: string
          id: number
          sent_at: string | null
          user_id: string
        }
        Insert: {
          alert_key: string
          alert_type: string
          id?: number
          sent_at?: string | null
          user_id: string
        }
        Update: {
          alert_key?: string
          alert_type?: string
          id?: number
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shovels_address_metrics: {
        Row: {
          active_permits: number | null
          avg_inspection_pass_rate: number | null
          avg_job_value: number | null
          calculated_at: string | null
          city: string | null
          completed_permits: number | null
          county: string | null
          created_at: string | null
          expired_permits: number | null
          first_permit_date: string | null
          has_expired_permit: boolean | null
          has_stalled_permit: boolean | null
          high_value_permit_ratio: number | null
          id: string
          improvement_permit_ratio: number | null
          last_electrical_date: string | null
          last_hvac_date: string | null
          last_permit_date: string | null
          last_plumbing_date: string | null
          last_roofing_date: string | null
          last_solar_date: string | null
          last_water_heater_date: string | null
          max_job_value: number | null
          permit_counts_by_tag: Json | null
          permits_last_12_months: number | null
          permits_prior_12_months: number | null
          shovels_address_id: string
          state: string | null
          street_address: string
          total_job_value: number | null
          total_permits: number | null
          updated_at: string | null
          yoy_permit_growth: number | null
          zip_code: string | null
        }
        Insert: {
          active_permits?: number | null
          avg_inspection_pass_rate?: number | null
          avg_job_value?: number | null
          calculated_at?: string | null
          city?: string | null
          completed_permits?: number | null
          county?: string | null
          created_at?: string | null
          expired_permits?: number | null
          first_permit_date?: string | null
          has_expired_permit?: boolean | null
          has_stalled_permit?: boolean | null
          high_value_permit_ratio?: number | null
          id?: string
          improvement_permit_ratio?: number | null
          last_electrical_date?: string | null
          last_hvac_date?: string | null
          last_permit_date?: string | null
          last_plumbing_date?: string | null
          last_roofing_date?: string | null
          last_solar_date?: string | null
          last_water_heater_date?: string | null
          max_job_value?: number | null
          permit_counts_by_tag?: Json | null
          permits_last_12_months?: number | null
          permits_prior_12_months?: number | null
          shovels_address_id: string
          state?: string | null
          street_address: string
          total_job_value?: number | null
          total_permits?: number | null
          updated_at?: string | null
          yoy_permit_growth?: number | null
          zip_code?: string | null
        }
        Update: {
          active_permits?: number | null
          avg_inspection_pass_rate?: number | null
          avg_job_value?: number | null
          calculated_at?: string | null
          city?: string | null
          completed_permits?: number | null
          county?: string | null
          created_at?: string | null
          expired_permits?: number | null
          first_permit_date?: string | null
          has_expired_permit?: boolean | null
          has_stalled_permit?: boolean | null
          high_value_permit_ratio?: number | null
          id?: string
          improvement_permit_ratio?: number | null
          last_electrical_date?: string | null
          last_hvac_date?: string | null
          last_permit_date?: string | null
          last_plumbing_date?: string | null
          last_roofing_date?: string | null
          last_solar_date?: string | null
          last_water_heater_date?: string | null
          max_job_value?: number | null
          permit_counts_by_tag?: Json | null
          permits_last_12_months?: number | null
          permits_prior_12_months?: number | null
          shovels_address_id?: string
          state?: string | null
          street_address?: string
          total_job_value?: number | null
          total_permits?: number | null
          updated_at?: string | null
          yoy_permit_growth?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      shovels_contractors: {
        Row: {
          active_permits: number | null
          avg_inspection_pass_rate: number | null
          avg_job_value: number | null
          city: string | null
          created_at: string | null
          email: string | null
          first_permit_date: string | null
          id: string
          last_permit_date: string | null
          license_number: string | null
          license_status: string | null
          license_type: string | null
          name: string
          on_time_completion_rate: number | null
          phone: string | null
          raw_data: Json | null
          shovels_contractor_id: string
          specializations: string[] | null
          state: string | null
          street_address: string | null
          total_job_value: number | null
          total_permits: number | null
          updated_at: string | null
          website: string | null
          years_active: number | null
          zip_code: string | null
        }
        Insert: {
          active_permits?: number | null
          avg_inspection_pass_rate?: number | null
          avg_job_value?: number | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_permit_date?: string | null
          id?: string
          last_permit_date?: string | null
          license_number?: string | null
          license_status?: string | null
          license_type?: string | null
          name: string
          on_time_completion_rate?: number | null
          phone?: string | null
          raw_data?: Json | null
          shovels_contractor_id: string
          specializations?: string[] | null
          state?: string | null
          street_address?: string | null
          total_job_value?: number | null
          total_permits?: number | null
          updated_at?: string | null
          website?: string | null
          years_active?: number | null
          zip_code?: string | null
        }
        Update: {
          active_permits?: number | null
          avg_inspection_pass_rate?: number | null
          avg_job_value?: number | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_permit_date?: string | null
          id?: string
          last_permit_date?: string | null
          license_number?: string | null
          license_status?: string | null
          license_type?: string | null
          name?: string
          on_time_completion_rate?: number | null
          phone?: string | null
          raw_data?: Json | null
          shovels_contractor_id?: string
          specializations?: string[] | null
          state?: string | null
          street_address?: string | null
          total_job_value?: number | null
          total_permits?: number | null
          updated_at?: string | null
          website?: string | null
          years_active?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      shovels_permits: {
        Row: {
          approval_days: number | null
          city: string | null
          construction_days: number | null
          contractor_id: string | null
          contractor_license: string | null
          contractor_name: string | null
          county: string | null
          created_at: string | null
          expiration_date: string | null
          failed_inspections: number | null
          fee_total: number | null
          file_date: string | null
          final_date: string | null
          id: string
          inspection_pass_rate: number | null
          issue_date: string | null
          job_value: number | null
          latitude: number | null
          longitude: number | null
          passed_inspections: number | null
          permit_description: string | null
          permit_number: string | null
          permit_status: string | null
          permit_type: string | null
          raw_data: Json | null
          shovels_address_id: string
          shovels_permit_id: string
          state: string | null
          street_address: string | null
          tags: string[] | null
          total_inspections: number | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          approval_days?: number | null
          city?: string | null
          construction_days?: number | null
          contractor_id?: string | null
          contractor_license?: string | null
          contractor_name?: string | null
          county?: string | null
          created_at?: string | null
          expiration_date?: string | null
          failed_inspections?: number | null
          fee_total?: number | null
          file_date?: string | null
          final_date?: string | null
          id?: string
          inspection_pass_rate?: number | null
          issue_date?: string | null
          job_value?: number | null
          latitude?: number | null
          longitude?: number | null
          passed_inspections?: number | null
          permit_description?: string | null
          permit_number?: string | null
          permit_status?: string | null
          permit_type?: string | null
          raw_data?: Json | null
          shovels_address_id: string
          shovels_permit_id: string
          state?: string | null
          street_address?: string | null
          tags?: string[] | null
          total_inspections?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          approval_days?: number | null
          city?: string | null
          construction_days?: number | null
          contractor_id?: string | null
          contractor_license?: string | null
          contractor_name?: string | null
          county?: string | null
          created_at?: string | null
          expiration_date?: string | null
          failed_inspections?: number | null
          fee_total?: number | null
          file_date?: string | null
          final_date?: string | null
          id?: string
          inspection_pass_rate?: number | null
          issue_date?: string | null
          job_value?: number | null
          latitude?: number | null
          longitude?: number | null
          passed_inspections?: number | null
          permit_description?: string | null
          permit_number?: string | null
          permit_status?: string | null
          permit_type?: string | null
          raw_data?: Json | null
          shovels_address_id?: string
          shovels_permit_id?: string
          state?: string | null
          street_address?: string | null
          tags?: string[] | null
          total_inspections?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string | null
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
          sender_name: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
          sender_name: string
          sender_type: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_periods: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          destination_city: string
          destination_country: string
          destination_lat: number
          destination_lng: number
          destination_state: string | null
          dismissed: boolean | null
          end_date: string
          id: number
          source: string
          source_event_id: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          destination_city: string
          destination_country: string
          destination_lat: number
          destination_lng: number
          destination_state?: string | null
          dismissed?: boolean | null
          end_date: string
          id?: number
          source: string
          source_event_id?: string | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          destination_city?: string
          destination_country?: string
          destination_lat?: number
          destination_lng?: number
          destination_state?: string | null
          dismissed?: boolean | null
          end_date?: string
          id?: number
          source?: string
          source_event_id?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_periods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          badge_category: string
          badge_id: string
          badge_name: string
          badge_tier: string | null
          earned_at: string | null
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          badge_category: string
          badge_id: string
          badge_name: string
          badge_tier?: string | null
          earned_at?: string | null
          id?: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          badge_category?: string
          badge_id?: string
          badge_name?: string
          badge_tier?: string | null
          earned_at?: string | null
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          points_earned: number
          related_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number
          related_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number
          related_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          cities_visited: string[] | null
          created_at: string | null
          current_level: number | null
          current_streak: number | null
          gyms_visited: number | null
          last_check_in_date: string | null
          level_progress: number | null
          longest_streak: number | null
          photos_submitted: number | null
          referrals_made: number | null
          reviews_submitted: number | null
          total_bookings: number | null
          total_check_ins: number | null
          total_points: number | null
          total_workouts: number | null
          unique_gyms_visited: number | null
          unlocked_badges: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cities_visited?: string[] | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          gyms_visited?: number | null
          last_check_in_date?: string | null
          level_progress?: number | null
          longest_streak?: number | null
          photos_submitted?: number | null
          referrals_made?: number | null
          reviews_submitted?: number | null
          total_bookings?: number | null
          total_check_ins?: number | null
          total_points?: number | null
          total_workouts?: number | null
          unique_gyms_visited?: number | null
          unlocked_badges?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cities_visited?: string[] | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          gyms_visited?: number | null
          last_check_in_date?: string | null
          level_progress?: number | null
          longest_streak?: number | null
          photos_submitted?: number | null
          referrals_made?: number | null
          reviews_submitted?: number | null
          total_bookings?: number | null
          total_check_ins?: number | null
          total_points?: number | null
          total_workouts?: number | null
          unique_gyms_visited?: number | null
          unlocked_badges?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verticals: {
        Row: {
          active_vertical: string
          created_at: string | null
          enabled_verticals: string[] | null
          filter_presets: Json | null
          id: string
          primary_vertical: string
          updated_at: string | null
          user_id: string
          vertical_settings: Json | null
        }
        Insert: {
          active_vertical?: string
          created_at?: string | null
          enabled_verticals?: string[] | null
          filter_presets?: Json | null
          id?: string
          primary_vertical?: string
          updated_at?: string | null
          user_id: string
          vertical_settings?: Json | null
        }
        Update: {
          active_vertical?: string
          created_at?: string | null
          enabled_verticals?: string[] | null
          filter_presets?: Json | null
          id?: string
          primary_vertical?: string
          updated_at?: string | null
          user_id?: string
          vertical_settings?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          additional_context: string | null
          created_at: string | null
          current_value: string | null
          gym_id: number | null
          id: string
          requester_email: string
          requester_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          suggested_value: string
          verification_type: string
        }
        Insert: {
          additional_context?: string | null
          created_at?: string | null
          current_value?: string | null
          gym_id?: number | null
          id?: string
          requester_email: string
          requester_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_value: string
          verification_type: string
        }
        Update: {
          additional_context?: string | null
          created_at?: string | null
          current_value?: string | null
          gym_id?: number | null
          id?: string
          requester_email?: string
          requester_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_value?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_queries: {
        Row: {
          created_at: string | null
          id: number
          parsed_intent: Json | null
          processing_time_ms: number | null
          results_count: number | null
          selected_gym_id: number | null
          transcript: string
          transcription_method: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          parsed_intent?: Json | null
          processing_time_ms?: number | null
          results_count?: number | null
          selected_gym_id?: number | null
          transcript: string
          transcription_method?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          parsed_intent?: Json | null
          processing_time_ms?: number | null
          results_count?: number | null
          selected_gym_id?: number | null
          transcript?: string
          transcription_method?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_queries_selected_gym_id_fkey"
            columns: ["selected_gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_queries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      cleanup_old_sent_alerts: { Args: never; Returns: undefined }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      generate_qr_payload: {
        Args: {
          booking_date: string
          booking_id: number
          gym_id: number
          user_id: string
        }
        Returns: Json
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_trip_gyms: {
        Args: {
          limit_count?: number
          radius_meters?: number
          trip_lat: number
          trip_lng: number
        }
        Returns: {
          day_pass_price: number
          distance_km: number
          id: number
          name: string
          rating: number
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      has_abandoned_project: {
        Args: { p_min_stall_days?: number; p_shovels_address_id: string }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      major_system_due: {
        Args: {
          p_max_age_years: number
          p_shovels_address_id: string
          p_system_type: string
        }
        Returns: boolean
      }
      neighborhood_permit_percentile: {
        Args: { p_shovels_address_id: string; p_zip_code?: string }
        Returns: number
      }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      search_gyms_nearby: {
        Args: { lat: number; lng: number; radius_meters?: number }
        Returns: {
          address: string
          day_pass_price: number
          distance_meters: number
          id: number
          name: string
          rating: number
        }[]
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      validate_qr_code: {
        Args: { p_booking_id: number; p_check_date: string }
        Returns: {
          gym_name: string
          is_valid: boolean
          message: string
          user_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
