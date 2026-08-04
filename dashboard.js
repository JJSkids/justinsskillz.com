// 1. Supabase Initialization
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkrmbcflswaIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Strictly Only Single Admin Email
const ADMIN_EMAILS = ["hellojjskids@gmail.com"];

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

// 2. User Identity Engine
function applyUserIdentity(user) {
    if (!user) return;

    const metadata = user.user_metadata || {};
    
    // Check full name, then username, then raw email
    const rawName = metadata.full_name || metadata.name || metadata.preferred_username || metadata.user_name;
    
    let displayName = "Developer";
    if (rawName) {
        displayName = rawName.split(' ')[0]; // Gets "Justin"
    } else if (user.email) {
        const parts = user.email.split('@')[0];
        displayName = parts.charAt(0).toUpperCase() + parts.slice(1);
    }

    if (userGreeting) userGreeting.innerText = displayName;
    if (sidebarBrand) sidebarBrand.innerText = `${displayName}'s Workspace`;
}

// 3. Admin Unlock Engine
function verifyAdminAccess(user) {
    if (!user) return;

    const userEmail = (user.email || "").toLowerCase();

    // Check if user is strictly the single admin
    if (ADMIN_EMAILS.includes(userEmail)) {
        if (adminPortalLink) {
            adminPortalLink.style.display = 'block';
            adminPortalLink.classList.remove('hidden');
        }
    } else {
        // Non-admins hide portal link
        if (adminPortalLink) {
            adminPortalLink.style.display = 'none';
            adminPortalLink.classList.add('hidden');
        }
    }
}

// 4. Session & Auth Pipeline
async function initDashboard() {
    if (!supabase) {
        syncLiveEvents();
        return;
    }

    // A. Auth listener catches incoming OAuth tokens from hash
    supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            applyUserIdentity(session.user);
            verifyAdminAccess(session.user);

            // Clean OAuth Hash from URL clean path
            if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, null, window.location.pathname);
            }
        } else if (event === 'SIGNED_OUT') {
            window.location.replace("index.html");
        }
    });

    // B. Direct Session Check
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
        applyUserIdentity(session.user);
        verifyAdminAccess(session.user);
    } else {
        // Only redirect if there is NO token in the URL
        if (!window.location.hash.includes('access_token') && !window.location.search.includes('code')) {
            window.location.replace("index.html");
            return;
        }
    }

    syncLiveEvents();
}

// 5. Hard Log Out Function
async function forceSignOut() {
    localStorage.clear();
    sessionStorage.clear();

    try {
        if (supabase) {
            await supabase.auth.signOut();
        }
    } catch (err) {
        console.warn("Signout warning:", err);
    }

    window.location.href = "index.html";
}

// Attach logout listener to sign-out button
document.addEventListener('DOMContentLoaded', () => {
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', forceSignOut);
    }
});

// 6. Live Feed Sync
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

// 7. Compiler Engine
if (runCodeBtn && codeEditor && ideOutput) {
    runCodeBtn.addEventListener('click', () => {
        const userCode = codeEditor.value;
        const iframeDoc = ideOutput.contentDocument || ideOutput.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(userCode);
        iframeDoc.close();
    });
}

// Run initializer
initDashboard();
