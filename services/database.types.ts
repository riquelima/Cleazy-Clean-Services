
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
      cleazy_users: {
        Row: {
          id: number;
          created_at: string;
          username: string;
          password: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          username: string;
          password: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          username?: string;
          password?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
