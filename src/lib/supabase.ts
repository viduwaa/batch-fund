import { createClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          student_id: string;
          email: string;
          department: 'ITT' | 'MTT' | 'EET' | 'FDT' | 'BPT';
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          student_id: string;
          email: string;
          department: 'ITT' | 'MTT' | 'EET' | 'FDT' | 'BPT';
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: any[];
      };
      collections: {
        Row: {
          id: string;
          title: string;
          description: string;
          amount_per_person: number;
          status: 'active' | 'closed' | 'cancelled';
          created_by: string | null;
          due_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          amount_per_person: number;
          status?: 'active' | 'closed' | 'cancelled';
          created_by?: string | null;
          due_date: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['collections']['Insert']>;
        Relationships: any[];
      };
      contributions: {
        Row: {
          id: string;
          collection_id: string;
          user_id: string;
          amount: number;
          paid_amount: number;
          status: 'pending' | 'partial' | 'paid' | 'overdue';
          confirmed_by: string | null;
          confirmed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          user_id: string;
          amount: number;
          paid_amount?: number;
          status?: 'pending' | 'partial' | 'paid' | 'overdue';
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['contributions']['Insert']>;
        Relationships: any[];
      };
      expenses: {
        Row: {
          id: string;
          collection_id: string;
          description: string;
          amount: number;
          receipt_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          description: string;
          amount: number;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
        Relationships: any[];
      };
    };
    Views: {
      master_ledger_view: {
        Row: {
          id: string;
          date: string;
          type: 'income' | 'expense';
          description: string;
          amount: number;
          collection_id: string;
          reference_name: string | null;
          student_id: string | null;
          department: string | null;
          running_balance: number;
        };
        Relationships: any[];
      };
    };
    Functions: {
      generate_collection_report: {
        Args: { p_collection_id: string };
        Returns: Json;
      };
    };
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
