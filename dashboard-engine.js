// Production-Grade Interactive Platform Curriculum Database
const platformDatabase = {
    math: {
        title: "Interactive Mathematics Modules",
        desc: "Explore vector maps, modular arithmetic cycles, coordinate tracking, and calculus components.",
        tipTitle: "Linear Matrix Spaces",
        tipBody: "In game development, changing matrix input elements allows you to transform vectors instantly to handle scale, rotation, and shear adjustments.",
        modules: [
            { title: "2x2 Matrix Space Sandbox", desc: "Map shapes on active coordinate axes using linear transformation grids.", icon: "fa-border-all", badge: "Linear Algebra", url: "labs/matrix.html" },
            { title: "The Modular Arithmetic Clock", desc: "Compute remainders and cryptographic groups using visual modulo operators.", icon: "fa-rotate", badge: "Number Theory", url: "labs/modulo.html" },
            { title: "Vector Forces & Projectile Physics", desc: "Interact with angles, velocities, and dot product force calculations.", icon: "fa-arrows-up-down-left-right", badge: "Kinematics", url: "labs/vectors.html" }
        ]
    },
    coding: {
        title: "Algorithmic Code IDE Development Labs",
        desc: "Write front-end scripts, execute runtime validation modules, and parse sorting algorithms.",
        tipTitle: "Regular Expressions Logic",
        tipBody: "Regular Expressions (Regex) look hard because they test precise string data rules. Use them to check email strings or extract numbers from unformatted files.",
        modules: [
            { title: "Live Frontend IDE Framework Workspace", desc: "Compile raw HTML, clean CSS patterns, and functional JavaScript scripts live.", icon: "fa-code", badge: "IDE Environment", url: "labs/ide.html" },
            { title: "Regex Real-Time Pattern Matcher", desc: "Build validation components to filter user text arrays safely.", icon: "fa-filter", badge: "String Parsing", url: "labs/regex.html" },
            { title: "Asynchronous Main Thread Execution", desc: "Debug event loops, synchronous tasks, delays, and state intervals.", icon: "fa-hourglass-half", badge: "Runtime Engine", url: "labs/async.html" }
        ]
    },
    logic: {
        title: "Discrete Systems & Computational Logic Tracks",
        desc: "Connect boolean algebra operations, track structural conditions, and evaluate maps.",
        tipTitle: "Boolean Logic Gates",
        tipBody: "XOR (Exclusive OR) outputs absolute True only if your two inputs are completely different from each other. If both match, it drops to False.",
        modules: [
            { title: "Discrete Boolean Logic Gate Simulator", desc: "Map variable switches through AND, OR, NOT, and XOR operator nodes.", icon: "fa-toggle-off", badge: "Boolean Algebra", url: "labs/boolean.html" },
            { title: "Recursive Graphical Fractal Trees", desc: "Write functions that execute self-calls to construct complex shapes.", icon: "fa-network-wired", badge: "Recursion Functions", url: "labs/fractals.html" },
            { title: "Dijkstra Weighted Path Routing Matrix", desc: "Test search algorithms across grid coordinate systems to calculate optimal maps.", icon: "fa-route", badge: "Graph Theory", url: "labs/pathfinding.html" }
        ]
    }
};

// Application State Pointer Tracker Variable
let currentActiveKey = 'math';

// Display current component module dashboard view
function renderDashboardView() {
    const currentData = platformDatabase[currentActiveKey];
    
    // Sync active contextual text components inside DOM
    document.getElementById('category-title').innerText = currentData.title;
    document.getElementById('category-desc').innerText = currentData.desc;
    document.getElementById('tip-title').innerText = currentData.tipTitle;
    document.getElementById('tip-body').innerText = currentData.tipBody;
    
    // Sync Top Counter Status Box text info
    const capitalizedKey = currentActiveKey.charAt(0).toUpperCase() + currentActiveKey.slice(1);
    document.getElementById('current-track-display').innerText = capitalizedKey;

    // Flush and reset target grid module list wrapper
    const container = document.getElementById('modules-list');
    container.innerHTML = '';

    // Loop pass directly across active database arrays nodes
    currentData.modules.forEach(mod => {
        const elementCard = document.createElement('div');
        elementCard.className = "bg-[#0f172a] hover:bg-slate-800/40 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-200 group gap-4";
        
        elementCard.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:text-cyan-400 transition-colors">
                    <i class="fa-solid ${mod.icon} text-lg"></i>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">${mod.badge}</span>
                    <h3 class="text-sm font-extrabold text-slate-200 mt-1">${mod.title}</h3>
                    <p class="text-slate-400 text-xs mt-0.5 leading-relaxed">${mod.desc}</p>
                </div>
            </div>
            <button onclick="launchLab('${mod.url}')" class="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm">
                Launch Lab <i class="fa-solid fa-arrow-right ml-1 text-[10px]"></i>
            </button>
        `;
        container.appendChild(elementCard);
    });
}

// Handle navigation track switching transformations
function switchCategory(targetKey) {
    currentActiveKey = targetKey;
    
    // Adjust active navigation side button state modifier flags dynamically
    ['math', 'coding', 'logic'].forEach(key => {
        const buttonElement = document.getElementById(`nav-${key}`);
        if(key === targetKey) {
            buttonElement.className = "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-indigo-600 text-white shadow-lg shadow-indigo-600/10";
        } else {
            buttonElement.className = "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200";
        }
    });

    renderDashboardView();
}

// Route directly to active interactive lab configurations
function launchLab(targetUrl) {
    window.location.href = `https://github.io{encodeURIComponent(targetUrl)}`;
}

// Spin initialization execution routines when layout triggers
window.onload = () => {
    renderDashboardView();
};
