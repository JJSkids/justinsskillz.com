// 1. Initialize Supabase Pipeline
const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Interactive IDE Elements
const codeEditor = document.getElementById('codeEditor');
const runCodeBtn = document.getElementById('runCodeBtn');
const ideOutput = document.getElementById('ideOutput');

// Dashboard UI Elements
const userGreeting = document.getElementById('userGreeting');
const signOutBtn = document.getElementById('dashboardSignOutBtn');
const adminPortalLink = document.getElementById('adminPortalLink');
const notificationsList = document.getElementById('notificationsList');
const liveFrame = document.getElementById('liveFrame');
const streamOffline = document.getElementById('streamOffline');
const liveDot = document.getElementById('liveDot');

// 2. Security Gate & Session Check
async function checkUserSession() {
    if (!supabase) return;
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // No valid login session found - kick back to landing page
        window.location.href = "index.html";
    } else {
        // Display personalized user greeting
        if (userGreeting) {
            userGreeting.innerText = user.email ? user.email.split('@')[0] : 'Developer';
        }
        
        // Verify if user has System Admin rights
        checkAdminPrivileges(user.id);
        
        // Synchronize live events feed and video streams
        syncLiveEvents();
    }
}

// 3. Admin Authorization Check
async function checkAdminPrivileges(userId) {
    if (!supabase || !adminPortalLink) return;

    const { data, error } = await supabase
        .from('user_roles')
        .select('is_admin')
        .eq('id', userId)
        .single();
        
    if (data && data.is_admin) {
        adminPortalLink.classList.remove('hidden');
    }
}

// 4. Interactive Sandbox Engine (HTML/CSS Compiler)
if (runCodeBtn && codeEditor && ideOutput) {
    runCodeBtn.addEventListener('click', () => {
        const userCode = codeEditor.value;
        const iframeDoc = ideOutput.contentDocument || ideOutput.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(userCode);
        iframeDoc.close();
    });
}

// 5. Real-Time Events Sync & Live Stream Controller
async function syncLiveEvents() {
    if (!supabase) return;

    // Initial load of broadcasted events
    const { data: events } = await supabase
        .from('live_events')
        .select('*')
        .order('id', { ascending: false });

    renderEvents(events || []);

    // Subscribe to live database updates
    supabase
        .channel('live_events_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_events' }, () => {
            syncLiveEvents();
        })
        .subscribe();
}

function renderEvents(events) {
    if (!notificationsList) return;
    
    if (events.length === 0) {
        notificationsList.innerHTML = '<p class="empty-feed" style="font-size:0.85rem; color:#64748b;">No active event listings scheduled.</p>';
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

    // Reset video player container if no active live stream
    if (!streamActive) {
        if (liveFrame) {
            liveFrame.src = '';
            liveFrame.classList.add('hidden');
        }
        if (streamOffline) streamOffline.classList.remove('hidden');
        if (liveDot) liveDot.classList.remove('active');
    }
}

// 6. Complete Log Out Engine (Forgets credentials completely & preserves DB state)
if (signOutBtn) {
    signOutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (supabase) {
            await supabase.auth.signOut();
        }
        
        // Completely clear active local browser memory tokens
        localStorage.clear();
        sessionStorage.clear();
        
        // Return to home page as guest
        window.location.href = "index.html";
    });
}

// Run authorization pipeline on load
document.addEventListener("DOMContentLoaded", checkUserSession);
