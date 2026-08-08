// Initialize Supabase Client
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Render Navigation State based on User session
function renderUserUI(user) {
    const navContainer = document.getElementById('navAuthContainer');
    if (!navContainer) return;

    if (user) {
        const metadata = user.user_metadata || {};
        const name = metadata.full_name || metadata.name || metadata.preferred_username || 'Developer';
        const firstName = name.split(' ')[0];

        navContainer.innerHTML = `
            <a href="dashboard.html" class="btn btn-secondary" style="margin-right: 0.5rem;">👋 ${firstName}'s Workspace</a>
            <button id="indexSignOutBtn" type="button" class="btn btn-danger">Sign Out</button>
        `;
    } else {
        navContainer.innerHTML = `
            <button id="navSignInBtn" type="button" class="btn btn-primary">Sign In</button>
        `;
    }
}

// Setup Session Listeners
async function setupAuth() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    renderUserUI(session?.user || null);

    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            renderUserUI(session.user);
            const modal = document.getElementById('authModal');
            if (modal) modal.style.display = 'none';
        } else if (event === 'SIGNED_OUT') {
            renderUserUI(null);
        }
    });
}

// Helper to construct dynamic absolute redirect URL
function getOAuthRedirectUrl() {
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    return window.location.origin + directory + 'dashboard.html';
}

// Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    setupAuth();

    const modal = document.getElementById('authModal');
    const closeModalBtn = document.getElementById('closeAuthModal');
    const googleOAuthBtn = document.getElementById('googleOAuthBtn');
    const githubOAuthBtn = document.getElementById('githubOAuthBtn');
    const navContainer = document.getElementById('navAuthContainer');

    // Event Delegation: handles dynamic Sign In / Sign Out button clicks
    if (navContainer) {
        navContainer.addEventListener('click', async (e) => {
            if (e.target && e.target.id === 'navSignInBtn') {
                if (modal) modal.style.display = 'flex';
            }
            
            if (e.target && e.target.id === 'indexSignOutBtn') {
                e.target.disabled = true;
                await window.supabaseClient.auth.signOut();
                localStorage.clear();
                sessionStorage.clear();
                renderUserUI(null);
            }
        });
    }

    // Modal Dismiss Controls
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    }

    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    // Google OAuth Trigger
    if (googleOAuthBtn) {
        googleOAuthBtn.addEventListener('click', async () => {
            await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: getOAuthRedirectUrl() }
            });
        });
    }

    // GitHub OAuth Trigger
    if (githubOAuthBtn) {
        githubOAuthBtn.addEventListener('click', async () => {
            await window.supabaseClient.auth.signInWithOAuth({
                provider: 'github',
                options: { redirectTo: getOAuthRedirectUrl() }
            });
        });
    }
});
