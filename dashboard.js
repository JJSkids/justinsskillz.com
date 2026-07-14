// 1. Initialize our secure pipeline connection to Supabase
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userGreeting = document.getElementById('userGreeting');
const signOutBtn = document.getElementById('dashboardSignOutBtn');

// 2. THE SECURITY GATE FUNCTION: Run check immediately on page load
async function checkUserSession() {
    // Request current auth verification profile from Supabase instance memory
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // SECURITY ALERT: No active login session profile token found. Kick them out!
        window.location.href = "../index.html";
    } else {
        // WELCOME USER: Customize user dashboard display dynamically using OAuth email prefix profile text
        userGreeting.innerText = user.email.split('@')[0];
    }
}

// 3. LOG OUT CORE ROUTINE ENGINE
signOutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    // Redirect instantly back to public homepage frame
    window.location.href = "../index.html";
});

// Run security validation process immediately when script hits the engine
checkUserSession();