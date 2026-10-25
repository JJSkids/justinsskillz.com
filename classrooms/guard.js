/**
 * QUEST HQ / AGENT ALPHA - REALTIME SUPABASE HYBRID ENGINE
 * Domain: justinsskillz.web.app
 * Features: Real-time WebSocket sync across devices + Web Audio chimes + Toast Notifications.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Your Active Supabase Project Credentials
export const SUPABASE_URL = 'https://iifhzdioridrmbcflswa.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZmh6ZGlvcmlkcm1iY2Zsc3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjQ5MDUsImV4cCI6MjA5OTY0MDkwNX0.Pq5n0mIl-3lBli16OVrl-6fHZStv_V_y19izQJZT088';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SESSION_KEY = 'dojo_user_session';
const DB_KEY = 'dojo_flexible_db';

let audioCtx = null;

// Initialize Web Audio Synthesizer
function playRealtimeChime() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    } catch (e) {
        // Audio policy fallback if not interacted yet
    }
}

// Render Glassmorphic Toast Notification
function showRealtimeToast(message = "Cloud sync update received!") {
    let toastContainer = document.getElementById('dojo-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'dojo-toast-container';
        toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-slate-100 text-xs font-bold shadow-2xl backdrop-blur-md transform translate-y-4 opacity-0 transition-all duration-300';
    toast.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
        <span>⚡ ${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// Fallback Default State Structure
const DEFAULT_FLEXIBLE_STATE = {
    meta: {
        className: "Agent Alpha Hub",
        classCode: "ALPHA101",
        version: "3.0.0",
        lastSynced: new Date().toISOString()
    },
    customProperties: {
        themeColor: '#8b5cf6',
        bossHP: 500
    },
    students: [
        { 
            id: 's1', 
            name: 'Justin', 
            points: 120, 
            level: 5, 
            avatar: '🧙‍♂️',
            attributes: { strength: 14, intelligence: 18 },
            badges: ['Code Ninja']
        },
        { 
            id: 's2', 
            name: 'Sophia', 
            points: 95, 
            level: 4, 
            avatar: '🦊',
            attributes: { strength: 10, intelligence: 16 },
            badges: ['Team Player']
        }
    ],
    activityLog: []
};

function getBasePath() {
    const path = window.location.pathname;
    const idx = path.indexOf('/classrooms');
    if (idx !== -1) {
        return path.substring(0, idx + '/classrooms'.length);
    }
    return '';
}

// ------------------------------------------------------------------
// Flexible DB Controller with Realtime Supabase Engine
// ------------------------------------------------------------------
export const DojoDB = {
    get: function () {
        const raw = localStorage.getItem(DB_KEY);
        if (!raw) {
            this.saveLocal(DEFAULT_FLEXIBLE_STATE);
            return DEFAULT_FLEXIBLE_STATE;
        }
        try {
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_FLEXIBLE_STATE, ...parsed };
        } catch (e) {
            this.saveLocal(DEFAULT_FLEXIBLE_STATE);
            return DEFAULT_FLEXIBLE_STATE;
        }
    },

    save: async function (dbData) {
        dbData.meta = dbData.meta || {};
        dbData.meta.lastSynced = new Date().toISOString();
        
        // 1. Instant local update
        this.saveLocal(dbData);

        // 2. Cloud Broadcast
        try {
            const { error } = await supabase
                .from('app_state')
                .upsert({
                    id: 'default_state',
                    data: dbData,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.warn('[DojoDB] Supabase Sync Error:', error.message);
            }
        } catch (err) {
            console.error('[DojoDB] Supabase Sync Exception:', err);
        }
    },

    saveLocal: function (dbData) {
        localStorage.setItem(DB_KEY, JSON.stringify(dbData));
        window.dispatchEvent(new CustomEvent('dojo_state_updated', { detail: dbData }));
    },

    pullFromCloud: async function () {
        try {
            const { data, error } = await supabase
                .from('app_state')
                .select('data')
                .eq('id', 'default_state')
                .single();

            if (!error && data && data.data) {
                this.saveLocal(data.data);
                return data.data;
            }
        } catch (e) {
            console.warn('[DojoDB] Using local fallback state.');
        }
        return this.get();
    },

    subscribeToRealtime: function () {
        console.log('[DojoDB] Realtime WebSocket active...');
        
        supabase
            .channel('public:app_state')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'app_state',
                    filter: 'id=eq.default_state'
                },
                (payload) => {
                    if (payload.new && payload.new.data) {
                        // Play chime and trigger visual toast
                        playRealtimeChime();
                        showRealtimeToast("Live sync updated from cloud!");
                        
                        // Save & dispatch DOM state event
                        this.saveLocal(payload.new.data);
                    }
                }
            )
            .subscribe();
    },

    setFlexibleProp: function (key, value) {
        const db = this.get();
        db.customProperties = db.customProperties || {};
        db.customProperties[key] = value;
        this.save(db);
    },

    upsertStudent: function (studentId, studentPatch) {
        const db = this.get();
        const index = db.students.findIndex(s => s.id === studentId);

        if (index !== -1) {
            db.students[index] = { ...db.students[index], ...studentPatch };
        } else {
            db.students.push({
                id: studentId || 's_' + Date.now(),
                name: studentPatch.name || 'Agent',
                points: studentPatch.points || 0,
                level: studentPatch.level || 1,
                avatar: studentPatch.avatar || '🐉',
                ...studentPatch
            });
        }
        this.save(db);
    }
};

export async function protectRoute(redirectUrl = '../login.html') {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        const base = getBasePath();
        window.location.replace(redirectUrl || `${base}/login.html`);
        return null;
    }
    return session.user;
}

export async function logout(redirectUrl = '../login.html') {
    await supabase.auth.signOut();
    localStorage.removeItem(SESSION_KEY);
    const base = getBasePath();
    window.location.replace(redirectUrl || `${base}/login.html`);
}

// Auto init engine
(async function initEngine() {
    await DojoDB.pullFromCloud();
    DojoDB.subscribeToRealtime();
})();