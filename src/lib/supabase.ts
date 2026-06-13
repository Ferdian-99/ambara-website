import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "./rbac";

export type ProjectStage =
  | "Konsultasi"
  | "Konsep Desain"
  | "Revisi"
  | "Persetujuan"
  | "Produksi"
  | "Finishing"
  | "Pengiriman"
  | "Instalasi"
  | "Selesai";

export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "cancelled";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          phone?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          address: string | null;
          portal_activated_at: string | null;
          archived_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          portal_activated_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          project_code: string;
          project_name: string;
          project_type: string;
          location: string | null;
          budget_range: string | null;
          current_stage: ProjectStage;
          progress_percentage: number;
          status: ProjectStatus;
          estimated_completion: string | null;
          notes: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          project_code: string;
          project_name: string;
          project_type: string;
          location?: string | null;
          budget_range?: string | null;
          current_stage?: ProjectStage;
          progress_percentage?: number;
          status?: ProjectStatus;
          estimated_completion?: string | null;
          notes?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      project_updates: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          stage: ProjectStage;
          progress_percentage: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          stage: ProjectStage;
          progress_percentage?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_updates"]["Insert"]>;
      };
      project_documents: {
        Row: {
          id: string;
          project_id: string;
          file_name: string;
          file_url: string;
          file_type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          file_name: string;
          file_url: string;
          file_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_documents"]["Insert"]>;
      };
      project_photos: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          caption: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          caption?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_photos"]["Insert"]>;
      };
      portfolio_items: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string | null;
          location: string | null;
          year: string | null;
          short_description: string | null;
          description: string | null;
          cover_image_url: string | null;
          gallery_urls: string[];
          services: string[];
          materials: string[];
          is_featured: boolean;
          sort_order: number;
          published_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category?: string | null;
          location?: string | null;
          year?: string | null;
          short_description?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          gallery_urls?: string[];
          services?: string[];
          materials?: string[];
          is_featured?: boolean;
          sort_order?: number;
          published_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["portfolio_items"]["Insert"]>;
      };
    };
    Functions: {
      mark_own_client_portal_active: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
