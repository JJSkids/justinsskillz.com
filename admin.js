const SUPABASE_URL = "https://iifhzdioridrmbcflswa.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088";

let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const eventForm = document.getElementById('eventForm');
const adminLogList = document.getElementById('adminLogList');
const signOutBtn = document.getElementById('dashboardSignOutBtn');

// 1. Double-Secure Verification System Gate
async function enforceAdminGate() {
    if (!supabase) return;
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const { data, error } = await supabase
        .from('user_roles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!data || !data.is_admin) {
        // Kick them out immediately if they are not an administrator!
        alert("ACCESS DENIED: Admins only.");
        window.location.href = "dashboard.html";
    } else {
        loadAdminEventFeed();
    }
}

// 2. Submit Live Event Broadcaster Details
if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('eventTitle').value;
        const scheduled_at = document.getElementById('eventTime').value;
        const zoom_url = document.getElementById('eventUrl').value;
        const status = document.getElementById('eventStatus').value;

        // If starting this as "Live Now", set all other events to "ended" first
        if (status === 'live') {
            await supabase
                .from('live_events')
                .update({ status: 'ended' })
                .eq('status', 'live');
        }

        const { error } = await supabase
            .from('live_events')
            .insert([{ title, scheduled_at, zoom_url, status }]);

        if (error) {
            alert("Error broadcasting event: " + error.message);
        } else {
            alert("Successfully Broadcasted!");
            eventForm.reset();
            loadAdminEventFeed();
        }
    });
}

// 3. Load past notifications with Admin status changers
async function loadAdminEventFeed() {
    const { data: events } = await supabase
        .from('live_events')
        .select('*')
        .order('id', { ascending: false });

    if (!adminLogList) return;
    adminLogList.innerHTML = '';

    events.forEach(event => {
        const div = document.createElement('div');
        div.className = 'admin-log-card';
        div.innerHTML = `
            <div>
                <strong>${event.title}</strong> (${event.status})
                <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">${event.scheduled_at}</p>
            </div>
            <div class="admin-card-actions">
                <button onclick="updateEventStatus(${event.id}, 'live')" class="btn-tiny live-btn">Live</button>
                <button onclick="updateEventStatus(${event.id}, 'ended')" class="btn-tiny end-btn">End</button>
                <button onclick="deleteEvent(${event.id})" class="btn-tiny delete-btn">❌</button>
            </div>
        `;
        adminLogList.appendChild(div);
    });
}

// Event Status Changer Functions (Exposed globally)
window.updateEventStatus = async function(id, nextStatus) {
    if (nextStatus === 'live') {
        // Stop any other live streams
        await supabase.from('live_events').update({ status: 'ended' }).eq('status', 'live');
    }
    
    await supabase.from('live_events').update({ status: nextStatus }).eq('id', id);
    loadAdminEventFeed();
};

window.deleteEvent = async function(id) {
    if (confirm("Delete this broadcast event listing?")) {
        await supabase.from('live_events').delete().eq('id', id);
        loadAdminEventFeed();
    }
};

if (signOutBtn && supabase) {
    signOutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = "index.html";
    });
}

enforceAdminGate();
