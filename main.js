// ==========================================
// 1. SECURE BACKEND API CONFIGURATION
// ==========================================
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

window.onload = () => {
    let supabase;

    // Verify Supabase is ready
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("Supabase CDN library failed to load. Please check your connection.");
        return;
    }

    // ==========================================
    // 2. ACQUIRE DOM INTERFACE ELEMENTS
    // ==========================================
    const themeButton = document.getElementById('themeButton');
    const signInBtn = document.getElementById('signInBtn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const googleAuthBtn = document.getElementById('googleAuthBtn');
    const githubAuthBtn = document.getElementById('githubAuthBtn');

    // ==========================================
    // 3. THEME & DIALOG INTERACTION LOGIC
    // ==========================================

    // Dynamic Theme Switch Engine
    if (themeButton) {
        themeButton.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const nextTheme = isDark ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', nextTheme);
            themeButton.innerHTML = nextTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        });
    }

    // Show authentication modal
    if (signInBtn && authModal) {
        signInBtn.addEventListener('click', () => {
            authModal.classList.remove('hidden');
        });
    }

    // Hide authentication modal
    if (closeModal && authModal) {
        closeModal.addEventListener('click', () => {
            authModal.classList.add('hidden');
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === authModal) {
            authModal.classList.add('hidden');
        }
    });

    // Route to dashboard page
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            window.location.href = "dashboard.html";
        });
    }

    // ==========================================
    // 4. SUPABASE THIRD-PARTY OAUTH ENGINES
    // ==========================================

    // GitHub login redirect setup
    if (githubAuthBtn) {
        githubAuthBtn.addEventListener('click', async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin + window.location.pathname + 'dashboard.html'
                }
            });
            if (error) console.error("GitHub Auth Error:", error.message);
        });
    }

    // Google login redirect setup
    if (googleAuthBtn) {
        googleAuthBtn.addEventListener('click', async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + window.location.pathname + 'dashboard.html'
                }
            });
            if (error) console.error("Google Auth Error:", error.message);
        });
    }

    // Sign out logic
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Sign Out Error:", error.message);
            } else {
                window.location.reload();
            }
        });
    }

    // ==========================================
    // 5. RUNTIME STATE ENGINE SYSTEM LISTENERS
    // ==========================================
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            if (signInBtn) signInBtn.classList.add('hidden');
            if (authModal) authModal.classList.add('hidden');
            if (dashboardBtn) dashboardBtn.classList.remove('hidden');
            if (signOutBtn) signOutBtn.classList.remove('hidden');
        } else {
            if (signInBtn) signInBtn.classList.remove('hidden');
            if (dashboardBtn) dashboardBtn.classList.add('hidden');
            if (signOutBtn) signOutBtn.classList.add('hidden');
        }
    });
};
