// ==========================================================================
// Justin's Skillz - Project Configuration
// Path: src/config.js
// ==========================================================================

const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

// Safely assign to window without throwing variable re-declaration errors
if (typeof window.supabaseClient === 'undefined') {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error("Supabase CDN library script was not loaded before config.js!");
  }
}

// Global reference for legacy calls
var supabase = window.supabaseClient;

// Global App Configuration
var SKILLZ_CONFIG = {
  appName: "Justin's Skillz",
  version: "2.1.0",
  // 🔒 Put your exact admin email address(es) here:
  adminEmails: [
    "justin@example.com" // Replace with your actual email
  ]
};