/**
 * CLASS DOJO PLATFORM ENGINE & STATE CONTROLLER
 */

// Initial Seed Data
const INITIAL_STUDENTS = [
    { id: 's1', name: 'Justin', points: 12, color: '#00c853', eyeCount: 1 },
    { id: 's2', name: 'Sophia', points: 15, color: '#7c4dff', eyeCount: 2 },
    { id: 's3', name: 'Alex', points: 8, color: '#0288d1', eyeCount: 3 },
    { id: 's4', name: 'Emma', points: 20, color: '#f59e0b', eyeCount: 2 },
    { id: 's5', name: 'Lucas', points: 5, color: '#ec4899', eyeCount: 1 },
    { id: 's6', name: 'Maya', points: 11, color: '#06b6d4', eyeCount: 2 }
];

class DojoApp {
    constructor() {
        this.students = this.loadStudents();
        this.selectedStudent = null;
        this.audioCtx = null;
        
        if (document.getElementById('students-container')) {
            this.initDashboard();
        }
    }

    // --- State Persistence ---
    loadStudents() {
        const saved = localStorage.getItem('dojo_students_data');
        return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    }

    saveStudents() {
        localStorage.setItem('dojo_students_data', JSON.stringify(this.students));
        this.updateTotalPointsHeader();
    }

    // --- Web Audio Sound Synthesizer ---
    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(freq, type = 'sine', duration = 0.15) {
        this.initAudio();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playPositiveSound() {
        this.playTone(523.25, 'sine', 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.15), 100); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.25), 200); // G5
    }

    playNegativeSound() {
        this.playTone(300, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(220, 'sawtooth', 0.25), 120);
    }

    // --- Procedural SVG Monster Generator ---
    generateMonsterSVG(color, eyeCount = 2) {
        let eyesSVG = '';
        if (eyeCount === 1) {
            eyesSVG = `<circle cx="50" cy="42" r="14" fill="#fff"/><circle cx="50" cy="42" r="6" fill="#0f172a"/>`;
        } else if (eyeCount === 2) {
            eyesSVG = `
                <circle cx="36" cy="42" r="10" fill="#fff"/><circle cx="36" cy="42" r="4" fill="#0f172a"/>
                <circle cx="64" cy="42" r="10" fill="#fff"/><circle cx="64" cy="42" r="4" fill="#0f172a"/>`;
        } else {
            eyesSVG = `
                <circle cx="28" cy="45" r="8" fill="#fff"/><circle cx="28" cy="45" r="3" fill="#0f172a"/>
                <circle cx="50" cy="38" r="10" fill="#fff"/><circle cx="50" cy="38" r="4" fill="#0f172a"/>
                <circle cx="72" cy="45" r="8" fill="#fff"/><circle cx="72" cy="45" r="3" fill="#0f172a"/>`;
        }

        return `
            <svg class="monster-svg" viewBox="0 0 100 100">
                <path d="M 20 50 Q 20 20 50 20 Q 80 20 80 50 Q 80 85 50 85 Q 20 85 20 50 Z" fill="${color}" />
                ${eyesSVG}
                <path d="M 35 68 Q 50 78 65 68" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>
            </svg>
        `;
    }

    // --- Dashboard Controller ---
    initDashboard() {
        this.renderStudentGrid();
        this.updateTotalPointsHeader();
    }

    renderStudentGrid() {
        const container = document.getElementById('students-container');
        if (!container) return;

        container.innerHTML = this.students.map(student => `
            <div class="student-card" onclick="dojoApp.openFeedbackModal('${student.id}')">
                <div class="point-bubble">${student.points}</div>
                ${this.generateMonsterSVG(student.color, student.eyeCount)}
                <div class="student-name">${student.name}</div>
            </div>
        `).join('');
    }

    updateTotalPointsHeader() {
        const total = this.students.reduce((sum, s) => sum + s.points, 0);
        const el = document.getElementById('total-class-points');
        if (el) el.textContent = `${total} PTS`;
    }

    openFeedbackModal(studentId) {
        this.selectedStudent = this.students.find(s => s.id === studentId);
        document.getElementById('modal-student-header').textContent = `Give Feedback to ${this.selectedStudent.name}`;
        document.getElementById('feedback-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('feedback-modal').classList.add('hidden');
        this.selectedStudent = null;
    }

    applyPoint(delta, behavior, icon) {
        if (!this.selectedStudent) return;

        this.selectedStudent.points += delta;
        this.saveStudents();
        this.renderStudentGrid();

        if (delta > 0) this.playPositiveSound();
        else this.playNegativeSound();

        this.logActivity(`${icon} ${this.selectedStudent.name} got ${delta > 0 ? '+' : ''}${delta} for ${behavior}`, delta < 0);
        this.closeModal();
    }

    awardWholeClass() {
        this.students.forEach(s => s.points += 1);
        this.saveStudents();
        this.renderStudentGrid();
        this.playPositiveSound();
        this.logActivity(`✨ Whole Class received +1 Dojo point!`, false);
    }

    pickRandomStudent() {
        if (this.students.length === 0) return;
        const randomStudent = this.students[Math.floor(Math.random() * this.students.length)];
        this.playPositiveSound();
        alert(`🎲 Selected Random Student: ${randomStudent.name}!`);
    }

    logActivity(text, isNegative = false) {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;
        const li = document.createElement('li');
        li.className = `feed-item ${isNegative ? 'negative' : ''}`;
        li.textContent = text;
        feed.prepend(li);
    }
}

// Global Instantiate
const dojoApp = new DojoApp();
function closeModal() { dojoApp.closeModal(); }
function applyPoint(delta, behavior, icon) { dojoApp.applyPoint(delta, behavior, icon); }
function awardWholeClass() { dojoApp.awardWholeClass(); }
function pickRandomStudent() { dojoApp.pickRandomStudent(); }

// --- Monster Island Engine ---
window.initIslandEngine = function() {
    const canvas = document.getElementById('island-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const students = dojoApp.loadStudents();
    
    // Assign random velocities for floating physics
    const islandMonsters = students.map((s, idx) => ({
        ...s,
        x: 150 + (idx * 100) % 600,
        y: 200 + (idx * 50) % 200,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 35
    }));

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        islandMonsters.forEach(m => {
            const dist = Math.hypot(m.x - mx, m.y - my);
            if (dist < m.radius) {
                dojoApp.playPositiveSound();
                m.vy = -4; // Jump animation
            }
        });
    });

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Floating Green Island Base
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2 + 80, 380, 160, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2 + 100, 320, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        // Update & Render Monsters
        islandMonsters.forEach(m => {
            m.x += m.vx;
            m.y += m.vy;

            // Simple bounce boundaries
            if (m.x < 150 || m.x > canvas.width - 150) m.vx *= -1;
            if (m.y < 180 || m.y > canvas.height - 180) m.vy *= -1;

            // Draw Monster Circle
            ctx.fillStyle = m.color;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(m.x - 10, m.y - 8, 8, 0, Math.PI * 2);
            ctx.arc(m.x + 10, m.y - 8, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(m.x - 10, m.y - 8, 3, 0, Math.PI * 2);
            ctx.arc(m.x + 10, m.y - 8, 3, 0, Math.PI * 2);
            ctx.fill();

            // Name Tag & Points
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText(`${m.name} (${m.points}pt)`, m.x, m.y + 50);
        });

        requestAnimationFrame(loop);
    }

    loop();
};