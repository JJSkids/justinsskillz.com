// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Verify Session & Direct Access
async function initDashboard() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session?.user) {
        updateDashboardUser(session.user);
    } else if (!window.location.hash.includes('access_token')) {
        // Redirect back to landing page if not logged in
        window.location.href = "index.html";
        return;
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
            updateDashboardUser(session.user);
        } else if (event === 'SIGNED_OUT') {
            window.location.href = "index.html";
        }
    });
}

// Update UI welcome header
function updateDashboardUser(user) {
    const metadata = user.user_metadata || {};
    const rawName = metadata.full_name || metadata.name || metadata.preferred_username || 'Developer';
    
    const welcomeHeading = document.getElementById('welcomeUser');
    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome back, ${rawName.split(' ')[0]}!`;
    }
}

// Sign Out Handler
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();

    const signOutBtn = document.getElementById('dashboardSignOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            signOutBtn.disabled = true;
            signOutBtn.textContent = 'Signing out...';
            
            await supabaseClient.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }
});
