// 1. Initialize our secure pipeline connection to Supabase
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const userGreeting = document.getElementById('userGreeting');
const signOutBtn = document.getElementById('dashboardSignOutBtn');

// 2. THE SECURITY GATE & DATA RETRIEVAL FUNCTION
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

        // Fetch or Initialize user progress from the secure cloud database
        await loadOrCreateUserProgress(user);
    }
}

// 3. SECURE DATABASE SYNC ENGINE (Replaces the need for user.json)
async function loadOrCreateUserProgress(user) {
    // Try to get existing progress
    let { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('id', user.id)
        .single();

    // If no progress profile exists yet, save their starting stats
    if (error && error.code === 'PGRST116') {
        const { data: newProgress, insertError } = await supabase
            .from('user_progress')
            .insert([
                { id: user.id, email: user.email, current_tier: 'Level 1', active_paths: 6 }
            ])
            .select()
            .single();
            
        progress = newProgress;
    }

    if (progress) {
        // Update the screen elements with their saved database stats!
        const tierElement = document.querySelector('.stat-box:nth-child(1) .stat-number');
        const pathsElement = document.querySelector('.stat-box:nth-child(2) .stat-number');
        
        if (tierElement) tierElement.innerText = progress.current_tier;
        if (pathsElement) pathsElement.innerText = `${progress.active_paths} paths`;
    }
}

// 4. LOG OUT ENGINE (Forgets local credentials securely, leaves DB untouched)
if (signOutBtn && supabase) {
    signOutBtn.addEventListener('click', async () => {
        // This command tells Supabase to instantly clear all tokens, cookies, and keys from the local browser storage
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Sign Out Error:", error.message);
        } else {
            // Redirect to index.html as a guest
            window.location.href = "index.html";
        }
    });
}

// Run authorization check immediately on page load
checkUserSession();
