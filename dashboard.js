const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// IDE Elements
const codeEditor = document.getElementById('codeEditor');
const runCodeBtn = document.getElementById('runCodeBtn');
const ideOutput = document.getElementById('ideOutput');

// DOM Elements
const userGreeting = document.getElementById('userGreeting');
const signOutBtn = document.getElementById('dashboardSignOutBtn');
const adminPortalLink = document.getElementById('adminPortalLink');
const notificationsList = document.getElementById('notificationsList');
const liveFrame = document.getElementById('liveFrame');
const streamOffline = document.getElementById('streamOffline');
const liveDot = document.getElementById('liveDot');

// 1. Session Gate and Authorization Check
async function checkUserSession() {
    if (!supabase) return;
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "index.html";
    } else {
        if (userGreeting) {
            userGreeting.innerText = user.email.split('@')[0];
        }
        
        // Check if user is an administrator
        checkAdminPrivileges(user.id);
        
        // Start streaming real-time notifications and class schedules
        syncLiveEvents();
    }
}

// 2. Admin Authentication Verification Gate
async function checkAdminPrivileges(userId) {
    const { data, error } = await supabase
        .from('user_roles')
        .select('is_admin')
        .eq('id', userId)
        .single();
        
    if (data && data.is_admin) {
        adminPortalLink.classList.remove('hidden');
    }
}

// 3. Interactive Code Sandbox Engine
if (runCodeBtn && codeEditor && ideOutput) {
    runCodeBtn.addEventListener('click', () => {
        const userCode = codeEditor.value;
        const iframeDoc = ideOutput.contentDocument || ideOutput.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(userCode);
        iframeDoc.close();
    });
}

// 4. Real-time Events & Stream Coordination
async function syncLiveEvents() {
    if (!supabase) return;

    // Load static items on page load
    const { data: events } = await supabase
        .from('live_events')
        .select('*')
        .order('id', { ascending: false });

    renderEvents(events || []);

    // Real-time listening for updates from the DB
    supabase
        .channel('live_events_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_events' }, payload => {
            syncLiveEvents(); // Reload everything when anything changes in the database
        })
        .subscribe();
}

function renderEvents(events) {
    if (!notificationsList) return;
    
    if (events.length === 0) {
        notificationsList.innerHTML = '<p class="empty-feed">No active event listings scheduled.</p>';
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
            // Load Zoom Embed URI dynamically
            if (liveFrame && event.zoom_url) {
                liveFrame.src = event.zoom_url;
                liveFrame.classList.remove('hidden');
                streamOffline.classList.add('hidden');
                liveDot.classList.add('active');
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

    // Reset player if no classes are active
    if (!streamActive) {
        if (liveFrame) {
            liveFrame.src = '';
            liveFrame.classList.add('hidden');
        }
        streamOffline.classList.remove('hidden');
        liveDot.classList.remove('active');
    }
}

// Log Out Handler
if (signOutBtn && supabase) {
    signOutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = "index.html";
    });
}

checkUserSession();
