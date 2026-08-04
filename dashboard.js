// 1. Initialize Supabase Pipeline
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkrmbcflswaIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// UI Elements
const userGreeting = document.getElementById('userGreeting');
const sidebarBrand = document.getElementById('sidebarBrand');
const adminPortalLink = document.getElementById('adminPortalLink');
const notificationsList = document.getElementById('notificationsList');
const liveFrame = document.getElementById('liveFrame');
const streamOffline = document.getElementById('streamOffline');
const liveDot = document.getElementById('liveDot');
const codeEditor = document.getElementById('codeEditor');
const runCodeBtn = document.getElementById('runCodeBtn');
const ideOutput = document.getElementById('ideOutput');

// 2. Extract User Name & Update UI
function applyUserIdentity(user) {
    if (!user) return;

    // Check Google / GitHub metadata first, fallback to email prefix, then Developer
    const metadata = user.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || metadata.preferred_username;
    
    let firstName = "";
    if (fullName) {
        firstName = fullName.split(' ')[0];
    } else if (user.email) {
        firstName = user.email.split('@')[0];
    } else {
        firstName = "Developer";
    }

    // Capitalize first letter
    const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    if (userGreeting) {
        userGreeting.innerText = displayName;
    }
    if (sidebarBrand) {
        sidebarBrand.innerText = `${displayName}'s Workspace`;
    }
}

// 3. Robust Session Listener
function initAuthListener() {
    if (!supabase) return;

    // Listen for OAuth token parsing completion
    supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user;

        if (!user) {
            // No session active - send back to landing page
            window.location.replace("index.html");
        } else {
            // Apply name to greeting and sidebar
            applyUserIdentity(user);
            
            // Check admin status
            checkAdminPrivileges(user.id);

            // Clean OAuth hash tokens from browser bar
            if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, null, window.location.pathname);
            }
        }
    });

    // Also run initial database sync
    syncLiveEvents();
}

// 4. Admin Privilege Checker
async function checkAdminPrivileges(userId) {
    if (!supabase || !adminPortalLink) return;

    try {
        const { data } = await supabase
            .from('user_roles')
            .select('is_admin')
            .eq('id', userId)
            .single();
            
        if (data && data.is_admin) {
            adminPortalLink.classList.remove('hidden');
        }
    } catch (e) {
        console.warn("Could not fetch user privileges:", e.message);
    }
}

// 5. Interactive Compiler Engine
if (runCodeBtn && codeEditor && ideOutput) {
    runCodeBtn.addEventListener('click', () => {
        const userCode = codeEditor.value;
        const iframeDoc = ideOutput.contentDocument || ideOutput.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(userCode);
        iframeDoc.close();
    });
}

// 6. Database Live Feed & Events Sync
async function syncLiveEvents() {
    if (!supabase) return;

    try {
        const { data: events, error } = await supabase
            .from('live_events')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            if (notificationsList) {
                notificationsList.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; padding: 0.5rem;">No active events listed.</p>';
            }
            return;
        }

        renderEvents(events || []);
    } catch (err) {
        if (notificationsList) {
            notificationsList.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; padding: 0.5rem;">No active events listed.</p>';
        }
    }
}

function renderEvents(events) {
    if (!notificationsList) return;
    
    if (events.length === 0) {
        notificationsList.innerHTML = '<p class="empty-feed" style="font-size:0.85rem; color:#94a3b8; padding: 0.5rem;">No active event listings scheduled.</p>';
        return;
    }

    notificationsList.innerHTML = '';
    let streamActive = false;

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = `notification-card ${event.status}`;

        let statusBadge = '';
        if (event.status === 'live') {
            statusBadge = `<span class="badge red-live">🔴 LIVE</span>`;
            streamActive = true;
            
            if (liveFrame && event.zoom_url) {
                liveFrame.src = event.zoom_url;
                liveFrame.classList.remove('hidden');
                if (streamOffline) streamOffline.classList.add('hidden');
                if (liveDot) liveDot.classList.add('active');
            }
        } else if (event.status === 'upcoming') {
            statusBadge = `<span class="badge blue-upcoming">⏳ Upcoming</span>`;
        } else {
            statusBadge = `<span class="badge gray-ended">🏁 Ended</span>`;
        }

        card.innerHTML = `
            <div class="card-title-row">
                ${statusBadge}
                <strong>${event.title}</strong>
            </div>
            <p class="event-time">Time: ${event.scheduled_at}</p>
            ${event.status === 'live' && event.zoom_url ? `<a href="${event.zoom_url}" target="_blank" class="join-live-btn">Join Directly</a>` : ''}
        `;
        notificationsList.appendChild(card);
    });

    if (!streamActive) {
        if (liveFrame) {
            liveFrame.src = '';
            liveFrame.classList.add('hidden');
        }
        if (streamOffline) streamOffline.classList.remove('hidden');
        if (liveDot) liveDot.classList.remove('active');
    }
}

// 7. Sign Out Handler
function setupSignOutHandler() {
    const signOutBtn = document.getElementById('dashboardSignOutBtn');

    if (signOutBtn) {
        signOutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                if (supabase) {
                    await supabase.auth.signOut();
                }
            } catch (err) {
                console.error("Sign out issue:", err);
            } finally {
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace("index.html");
            }
        });
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    initAuthListener();
    setupSignOutHandler();
});
