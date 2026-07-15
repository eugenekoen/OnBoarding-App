import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== "https://your-project-id.supabase.co" && 
  supabaseUrl.trim() !== "" &&
  supabaseAnonKey &&
  supabaseAnonKey.trim() !== "";

let supabaseClient: any = null;

if (isConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
  }
}

// Export a proxy so that it never crashes on import/startup, and provides a clear error if invoked when not configured
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!isConfigured || !supabaseClient) {
      throw new Error(
        `Supabase is not configured yet. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables/secrets.`
      );
    }
    return supabaseClient[prop];
  }
});
