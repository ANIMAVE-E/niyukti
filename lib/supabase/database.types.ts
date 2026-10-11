export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          phone: string | null;
          preferred_language: string;
          preferred_state: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          phone?: string | null;
          preferred_language?: string;
          preferred_state?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          phone?: string | null;
          preferred_language?: string;
          preferred_state?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sources: {
        Row: {
          id: string;
          name: string;
          slug: string;
          source_type: Database["public"]["Enums"]["source_type"];
          organization: string | null;
          base_url: string;
          feed_url: string | null;
          parser_key: string;
          is_official: boolean;
          is_enabled: boolean;
          polling_interval_seconds: number;
          last_started_at: string | null;
          last_success_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          source_type: Database["public"]["Enums"]["source_type"];
          organization?: string | null;
          base_url: string;
          feed_url?: string | null;
          parser_key: string;
          is_official?: boolean;
          is_enabled?: boolean;
          polling_interval_seconds?: number;
          last_started_at?: string | null;
          last_success_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          source_type?: Database["public"]["Enums"]["source_type"];
          organization?: string | null;
          base_url?: string;
          feed_url?: string | null;
          parser_key?: string;
          is_official?: boolean;
          is_enabled?: boolean;
          polling_interval_seconds?: number;
          last_started_at?: string | null;
          last_success_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          description: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          source_id: string;
          external_id: string | null;
          fingerprint: string;
          title: string;
          slug: string;
          organization: string;
          department: string | null;
          description: string | null;
          short_description: string | null;
          status: Database["public"]["Enums"]["job_status"];
          state: string | null;
          location: string | null;
          employment_type: string | null;
          qualification: string[] | null;
          age_limit_text: string | null;
          eligibility_text: string | null;
          total_vacancies: number | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_text: string | null;
          pay_scale: string | null;
          application_start_date: string | null;
          application_end_date: string | null;
          exam_date: string | null;
          result_date: string | null;
          published_at: string | null;
          source_published_at: string | null;
          official_notification_url: string | null;
          official_apply_url: string;
          source_url: string;
          content_hash: string | null;
          last_seen_at: string;
          created_at: string;
          updated_at: string;
          search_document: unknown | null;
        };
        Insert: {
          id?: string;
          source_id: string;
          external_id?: string | null;
          fingerprint: string;
          title: string;
          slug: string;
          organization: string;
          department?: string | null;
          description?: string | null;
          short_description?: string | null;
          status?: Database["public"]["Enums"]["job_status"];
          state?: string | null;
          location?: string | null;
          employment_type?: string | null;
          qualification?: string[] | null;
          age_limit_text?: string | null;
          eligibility_text?: string | null;
          total_vacancies?: number | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_text?: string | null;
          pay_scale?: string | null;
          application_start_date?: string | null;
          application_end_date?: string | null;
          exam_date?: string | null;
          result_date?: string | null;
          published_at?: string | null;
          source_published_at?: string | null;
          official_notification_url?: string | null;
          official_apply_url: string;
          source_url: string;
          content_hash?: string | null;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          external_id?: string | null;
          fingerprint?: string;
          title?: string;
          slug?: string;
          organization?: string;
          department?: string | null;
          description?: string | null;
          short_description?: string | null;
          status?: Database["public"]["Enums"]["job_status"];
          state?: string | null;
          location?: string | null;
          employment_type?: string | null;
          qualification?: string[] | null;
          age_limit_text?: string | null;
          eligibility_text?: string | null;
          total_vacancies?: number | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_text?: string | null;
          pay_scale?: string | null;
          application_start_date?: string | null;
          application_end_date?: string | null;
          exam_date?: string | null;
          result_date?: string | null;
          published_at?: string | null;
          source_published_at?: string | null;
          official_notification_url?: string | null;
          official_apply_url?: string;
          source_url?: string;
          content_hash?: string | null;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      job_categories: {
        Row: {
          job_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          job_id: string;
          category_id: string;
          created_at?: string;
        };
        Update: {
          job_id?: string;
          category_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_categories_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          endpoint: string;
          p256dh: string | null;
          auth_key: string | null;
          fcm_token: string | null;
          provider: string;
          device_type: string | null;
          browser: string | null;
          operating_system: string | null;
          is_active: boolean;
          last_used_at: string | null;
          failure_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          endpoint: string;
          p256dh?: string | null;
          auth_key?: string | null;
          fcm_token?: string | null;
          provider?: string;
          device_type?: string | null;
          browser?: string | null;
          operating_system?: string | null;
          is_active?: boolean;
          last_used_at?: string | null;
          failure_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          endpoint?: string;
          p256dh?: string | null;
          auth_key?: string | null;
          fcm_token?: string | null;
          provider?: string;
          device_type?: string | null;
          browser?: string | null;
          operating_system?: string | null;
          is_active?: boolean;
          last_used_at?: string | null;
          failure_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          user_id: string;
          categories: string[] | null;
          qualifications: string[] | null;
          states: string[] | null;
          notify_new_jobs: boolean;
          notify_deadline_reminders: boolean;
          notify_private_jobs: boolean;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          categories?: string[] | null;
          qualifications?: string[] | null;
          states?: string[] | null;
          notify_new_jobs?: boolean;
          notify_deadline_reminders?: boolean;
          notify_private_jobs?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          categories?: string[] | null;
          qualifications?: string[] | null;
          states?: string[] | null;
          notify_new_jobs?: boolean;
          notify_deadline_reminders?: boolean;
          notify_private_jobs?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_events: {
        Row: {
          id: string;
          job_id: string | null;
          user_id: string | null;
          event_type: string;
          title: string;
          message: string;
          action_url: string | null;
          status: Database["public"]["Enums"]["notification_status"];
          read_at: string | null;
          sent_at: string | null;
          failure_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id?: string | null;
          user_id?: string | null;
          event_type: string;
          title: string;
          message: string;
          action_url?: string | null;
          status?: Database["public"]["Enums"]["notification_status"];
          read_at?: string | null;
          sent_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string | null;
          user_id?: string | null;
          event_type?: string;
          title?: string;
          message?: string;
          action_url?: string | null;
          status?: Database["public"]["Enums"]["notification_status"];
          read_at?: string | null;
          sent_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_events_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      ingestion_runs: {
        Row: {
          id: string;
          source_id: string;
          status: string;
          started_at: string;
          completed_at: string | null;
          records_seen: number;
          records_created: number;
          records_updated: number;
          records_skipped: number;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          source_id: string;
          status: string;
          started_at?: string;
          completed_at?: string | null;
          records_seen?: number;
          records_created?: number;
          records_updated?: number;
          records_skipped?: number;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          source_id?: string;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          records_seen?: number;
          records_created?: number;
          records_updated?: number;
          records_skipped?: number;
          error_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ingestion_runs_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      source_type: "government" | "private" | "rss" | "api" | "html" | "partner_feed";
      job_status: "active" | "expired" | "closed" | "draft";
      notification_status: "pending" | "sent" | "failed" | "skipped";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicSchema = Database["public"];
export type TableName = keyof PublicSchema["Tables"];
export type Tables<T extends TableName> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends TableName> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends TableName> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
