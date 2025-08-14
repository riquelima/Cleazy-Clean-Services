import { createClient } from '@supabase/supabase-js';
import { type Database } from './database.types';

// As credenciais do Supabase agora estão diretamente no código.
const supabaseUrl = 'https://yvkuvdkhayurkfhsikpu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2a3V2ZGtoYXl1cmtmaHNpa3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzI5ODgsImV4cCI6MjA2OTU0ODk4OH0.PACvsoe4P1oTciZMy5-ucBtZMgtEyGIi46K0Htno9pQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As credenciais do Supabase (URL e Chave) estão faltando em services/supabaseClient.ts");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);