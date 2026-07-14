// ==========================================
// 1. SECURE BACKEND API CONFIGURATION
// ==========================================
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

// Connect to your online Supabase backend cluster database
// Change the second 'supabase' to 'supabase.createClient' or use the library window alias
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Dynamic Theme Switch Engine (Updates data-theme values in style.css variables)
themeButton.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    themeButton.innerHTML = nextTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Controls to show/hide the Authentication interface overlay
signInBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

// Close the overlay modal safely if the user clicks anywhere outside the dialog window boundary
window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        authModal.classList.add('hidden');
    }
});

// Route the Dashboard Access control link to your secure file path
dashboardBtn.addEventListener('click', () => {
    window.location.href = "dashboard.html";
});

// ==========================================
// 4. SUPABASE THIRD-PARTY OAUTH ENGINES
// ==========================================

// Fire the Google identity authorization pipeline sequence
googleAuthBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/dashboard.html'
        }
    });
    if (error) console.error("Google Auth Error Triggered:", error.message);
});

// Fire the GitHub identity authorization pipeline sequence
githubAuthBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.origin + '/dashboard.html'
        }
    });
    if (error) console.error("GitHub Auth Error Triggered:", error.message);
});

// Clean up clear session token storage objects locally on user exit signout request
signOutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Sign Out Error:", error.message);
    } else {
        window.location.reload(); // Refresh the DOM parameters back to default view state
    }
});

// ==========================================
// 5. RUNTIME STATE ENGINE SYSTEM LISTENERS
// ==========================================

// Global Listener loop evaluating if an authentication signature cookie is active right now
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        // Active verified profile user token context exists
        signInBtn.classList.add('hidden');
        authModal.classList.add('hidden');
        dashboardBtn.classList.remove('hidden');
        signOutBtn.classList.remove('hidden');
    } else {
        // Null guest browser profile state configuration parameters
        signInBtn.classList.remove('hidden');
        dashboardBtn.classList.add('hidden');
        signOutBtn.classList.add('hidden');
    }
});
