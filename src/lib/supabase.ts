import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://mock.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "mock-key";

// We use the service role key on the server to bypass RLS for now,
// or the anon key if service role is not provided.
export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = !!process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_URL !== "https://mock.supabase.co";
