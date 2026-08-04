// 1. Supabase Initialization
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkrmbcflswaIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const PRIMARY_ADMIN_EMAIL = "hellojjskids@gmail.com";

// DOM Elements
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

// 2. User Display Name Logic
function applyUserIdentity(user) {
    if (!user) return;

    const metadata = user.user_metadata || {};
    const rawName = metadata.full_name || metadata.name || metadata.preferred_username;
    
    let displayName = "Justin"; // Default brand name fallback
    if (rawName) {
        displayName = rawName.split(' ')[0];
    } else if (user.email) {
        const parts = user.email.split('@')[0];
        displayName = parts.charAt(0).toUpperCase() + parts.slice(1);
    }

    if (userGreeting) userGreeting.innerText = displayName;
    if (sidebarBrand) sidebarBrand.innerText = `${displayName}'s Workspace`;
}

// 3. Admin Authorization Engine
function verifyAdminAccess(user) {
    if (!adminPortalLink || !user) return;

    // Direct Email Match for Admin
    if (user.email && user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
        adminPortalLink.style.display = 'block';
        return;
    }

    // Database Fallback
    if (supabase) {
        supabase.from('user_roles').select('is_admin').eq('id', user.id).single()
            .then(({ data }) => {
                if (data && data.is_admin) {
                    adminPortalLink.style.display = 'block';
                }
            })
            .catch(() => {});
    }
}

// 4. Session Listener
function initDashboard() {
    if (!supabase) {
        syncLiveEvents();
        return;
    }

    // Fetch active session or listen for OAuth hash return
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            applyUserIdentity(session.user);
            verifyAdminAccess(session.user);
        }
    });

    supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            applyUserIdentity(session.user);
            verifyAdminAccess(session.user);

            if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, null, window.location.pathname);
            }
        }
    });

    syncLiveEvents();
}

// 5. Fail-Safe Log Out Engine
async function forceSignOut() {
    try {
        if (supabase) {
            await supabase.auth.signOut();
        }
    } catch (e) {
        console.warn("Signout warning:", e);
    } finally {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("index.html");
    }
}

// 6. Live Feed & Database Sync
async function syncLiveEvents() {
    if (!notificationsList) return;

    if (!supabase) {
        notificationsList.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; padding: 0.5rem;">No active events scheduled.</p>';
        return;
    }

    try {
        const { data: events, error } = await supabase
            .from('live_events')
            .select('*')
            .order('id', { ascending: false });

        if (error || !events || events.length === 0) {
            notificationsList.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; padding: 0.5rem;">No active events scheduled.</p>';
            return;
        }

        renderEvents(events);
    } catch (err) {
        notificationsList.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; padding: 0.5rem;">No active events scheduled.</p>';
    }
}

function renderEvents(events) {
    notificationsList.innerHTML = '';
    let streamActive = false;

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = `notification-card ${event.status}`;

        let statusBadge = event.status === 'live' 
            ? `<span class="badge red-live">🔴 LIVE</span>`
            : `<span class="badge gray-ended">🏁 Scheduled</span>`;

        if (event.status === 'live') {
            streamActive = true;
            if (liveFrame && event.zoom_url) {
                liveFrame.src = event.zoom_url;
                liveFrame.classList.remove('hidden');
                if (streamOffline) streamOffline.classList.add('hidden');
                if (liveDot) liveDot.classList.add('active');
            }
        }

        card.innerHTML = `
            <div class="card-title-row">
                ${statusBadge}
                <strong>${event.title}</strong>
            </div>
            <p class="event-time">Time: ${event.scheduled_at}</p>
        `;
        notificationsList.appendChild(card);
    });

    if (!streamActive && liveFrame) {
        liveFrame.src = '';
        liveFrame.classList.add('hidden');
        if (streamOffline) streamOffline.classList.remove('hidden');
        if (liveDot) liveDot.classList.remove('active');
    }
}

// 7. HTML/CSS Compiler Sandbox
if (runCodeBtn && codeEditor && ideOutput) {
    runCodeBtn.addEventListener('click', () => {
        const userCode = codeEditor.value;
        const iframeDoc = ideOutput.contentDocument || ideOutput.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(userCode);
        iframeDoc.close();
    });
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
});
