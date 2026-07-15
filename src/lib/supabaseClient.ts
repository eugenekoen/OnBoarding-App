import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// If keys aren't set yet (e.g. initial setup), the client will gracefully warn
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
