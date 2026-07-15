// 1. Initialize our secure pipeline connection to Supabase
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const userGreeting = document.getElementById('userGreeting');
const signOutBtn = document.getElementById('dashboardSignOutBtn');

// 2. THE SECURITY GATE FUNCTION
async function checkUserSession() {
    if (!supabase) return;
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // No active session? Send them back to index.html
        window.location.href = "index.html";
    } else {
        // Welcome User dynamically using their email prefix
        if (userGreeting) {
            userGreeting.innerText = user.email.split('@')[0];
        }
    }
}

// 3. LOG OUT ENGINE
if (signOutBtn && supabase) {
    signOutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = "index.html";
    });
}

// Run validation immediately
checkUserSession();
