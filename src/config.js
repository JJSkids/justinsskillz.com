// Supabase Configuration
const SUPABASE_URL = "hhttps://iifhzdioridrmbcflswa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

// Initialize Supabase Client safely
let supabase = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error("Supabase CDN script failed to load before config.js!");
}

// App Configuration Defaults
const SKILLZ_CONFIG = {
  appName: "Justin's Skillz",
  version: "2.1.0",
  storageKey: "user_session",
  defaultUser: "Justin"
};