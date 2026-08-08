// Attach to shared global client
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Update UI welcome header
function updateDashboardUser(user) {
    const metadata = user.user_metadata || {};
    const rawName = metadata.full_name || metadata.name || metadata.preferred_username || user.email || 'Developer';
    const displayName = rawName.includes('@') ? rawName.split('@')[0] : rawName.split(' ')[0];
    
    const welcomeHeading = document.getElementById('welcomeUser');
    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome back, ${displayName}!`;
    }
}

// Verify Session & Direct Access
async function initDashboard() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (session?.user) {
        updateDashboardUser(session.user);
    } else if (!window.location.hash.includes('access_token')) {
        window.location.href = "index.html";
        return;
    }

    window.supabaseClient.auth.onAuthStateChange((event, session) => {
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

// Sign Out Handler
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();

    const signOutBtn = document.getElementById('dashboardSignOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            signOutBtn.disabled = true;
            signOutBtn.textContent = 'Signing out...';
            
            await window.supabaseClient.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }
});
