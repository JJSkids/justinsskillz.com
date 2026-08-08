// Global Supabase initialization
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

let isSignUpMode = false;

// Render Navigation State based on User session
function renderUserUI(user) {
    const navContainer = document.getElementById('navAuthContainer');
    if (!navContainer) return;

    if (user) {
        const metadata = user.user_metadata || {};
        const rawName = metadata.full_name || metadata.name || metadata.preferred_username || user.email || 'Developer';
        const displayName = rawName.includes('@') ? rawName.split('@')[0] : rawName.split(' ')[0];

        navContainer.innerHTML = `
            <a href="dashboard.html" class="btn btn-secondary" style="margin-right: 0.5rem;">👋 ${displayName}'s Workspace</a>
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

function showMessage(msg, isError = true) {
    const msgBox = document.getElementById('authMessage');
    if (!msgBox) return;
    msgBox.style.display = 'block';
    msgBox.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
    msgBox.style.color = isError ? '#fca5a5' : '#86efac';
    msgBox.style.border = `1px solid ${isError ? '#ef4444' : '#22c55e'}`;
    msgBox.textContent = msg;
}

document.addEventListener('DOMContentLoaded', () => {
    setupAuth();

    const modal = document.getElementById('authModal');
    const closeModalBtn = document.getElementById('closeAuthModal');
    const googleOAuthBtn = document.getElementById('googleOAuthBtn');
    const githubOAuthBtn = document.getElementById('githubOAuthBtn');
    const navContainer = document.getElementById('navAuthContainer');
    
    const emailAuthForm = document.getElementById('emailAuthForm');
    const authToggleBtn = document.getElementById('authToggleBtn');
    const authToggleText = document.getElementById('authToggleText');
    const modalTitle = document.getElementById('modalTitle');
    const emailAuthSubmitBtn = document.getElementById('emailAuthSubmitBtn');

    // Dynamic Sign In / Sign Out button clicks
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

    // Toggle between Sign In and Sign Up
    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            
            if (isSignUpMode) {
                modalTitle.textContent = "Create an Account";
                emailAuthSubmitBtn.textContent = "Sign Up with Email";
                authToggleText.textContent = "Already have an account?";
                authToggleBtn.textContent = "Sign In";
            } else {
                modalTitle.textContent = "Welcome to Justin's Skillz";
                emailAuthSubmitBtn.textContent = "Sign In with Email";
                authToggleText.textContent = "Don't have an account?";
                authToggleBtn.textContent = "Sign Up";
            }
            const msgBox = document.getElementById('authMessage');
            if (msgBox) msgBox.style.display = 'none';
        });
    }

    // Handle Email/Password Form Submission
    if (emailAuthForm) {
        emailAuthForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            
            emailAuthSubmitBtn.disabled = true;
            emailAuthSubmitBtn.textContent = isSignUpMode ? "Signing up..." : "Signing in...";

            if (isSignUpMode) {
                const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
                emailAuthSubmitBtn.disabled = false;
                emailAuthSubmitBtn.textContent = "Sign Up with Email";

                if (error) {
                    showMessage(error.message, true);
                } else if (data.user && data.session) {
                    renderUserUI(data.user);
                    if (modal) modal.style.display = 'none';
                } else {
                    showMessage("Check your email for a confirmation link!", false);
                }
            } else {
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
                emailAuthSubmitBtn.disabled = false;
                emailAuthSubmitBtn.textContent = "Sign In with Email";

                if (error) {
                    showMessage(error.message, true);
                } else if (data.user) {
                    renderUserUI(data.user);
                    if (modal) modal.style.display = 'none';
                }
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
