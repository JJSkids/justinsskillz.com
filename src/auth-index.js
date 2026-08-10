// ==========================================================================
// Justin's Skillz - Auth & Admin Protection Handler
// Path: src/auth-index.js
// ==========================================================================

// Safely retrieve the Supabase instance
function getSupabase() {
  return window.supabaseClient || window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
}

let isSignUpMode = false;

// 1. Open / Close Auth Modal
function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
}

// 2. Toggle Mode (Sign In vs Sign Up)
function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  const title = document.getElementById('modal-title');
  const btn = document.getElementById('modal-submit-btn');
  const toggleText = document.getElementById('auth-toggle-text');

  if (isSignUpMode) {
    if (title) title.textContent = "Create Account";
    if (btn) btn.textContent = "Sign Up";
    if (toggleText) toggleText.innerHTML = 'Already have an account? <a onclick="toggleAuthMode()">Sign In</a>';
  } else {
    if (title) title.textContent = "Sign In";
    if (btn) btn.textContent = "Sign In";
    if (toggleText) toggleText.innerHTML = 'Don\'t have an account? <a onclick="toggleAuthMode()">Sign Up</a>';
  }
}

// 3. Handle Form Submit
async function handleAuthSubmit(event) {
  event.preventDefault();
  const client = getSupabase();

  if (!client || !client.auth) {
    alert("❌ Error: Supabase is not connected! Check that the Supabase CDN script is loaded before config.js in your HTML.");
    return;
  }

  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (isSignUpMode) {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) {
      alert("❌ Sign Up Failed:\n\n" + error.message);
    } else if (data.user && data.session) {
      alert("🎉 Account created and signed in!");
      closeAuthModal();
      updateAuthUI();
    } else {
      alert("📧 Account created! If email confirmation is enabled in Supabase, please check your inbox.");
      closeAuthModal();
    }
  } else {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      alert("❌ Sign In Failed:\n\n" + error.message);
    } else {
      alert("✅ Signed in successfully!");
      closeAuthModal();
      updateAuthUI();
    }
  }
}

// 4. Google Sign In
async function signInWithGoogle() {
  const client = getSupabase();
  if (!client || !client.auth) {
    alert("❌ Supabase client is offline.");
    return;
  }

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });

  if (error) alert("❌ Google Sign-In Error:\n\n" + error.message);
}

// 5. Sign Out Function
async function signOut() {
  const client = getSupabase();
  if (client && client.auth) {
    await client.auth.signOut();
  }
  localStorage.clear();
  alert("Signed out successfully.");
  updateAuthUI();
}

// 6. Check Admin Status
function isAdmin(user) {
  if (!user || !user.email) return false;
  const userEmail = user.email.toLowerCase();
  const adminList = (typeof SKILLZ_CONFIG !== 'undefined' && SKILLZ_CONFIG.adminEmails)
    ? SKILLZ_CONFIG.adminEmails.map(e => e.toLowerCase())
    : [];
  return adminList.includes(userEmail);
}

// 7. Update UI
async function updateAuthUI() {
  const greeting = document.getElementById('user-greeting');
  const btn = document.getElementById('auth-action-btn');
  const adminNavLink = document.getElementById('admin-nav-link');

  const client = getSupabase();
  let user = null;

  if (client && client.auth) {
    try {
      const { data } = await client.auth.getSession();
      user = data.session?.user || null;
    } catch (err) {
      console.error("Session check failed:", err);
    }
  }

  if (user) {
    const userIsAdmin = isAdmin(user);
    if (greeting) greeting.textContent = userIsAdmin ? "👑 Admin: " + user.email : "👋 " + user.email;
    if (adminNavLink) adminNavLink.style.display = userIsAdmin ? "inline-block" : "none";
    if (btn) {
      btn.textContent = "Sign Out";
      btn.onclick = (e) => { e.preventDefault(); signOut(); };
    }
  } else {
    if (greeting) greeting.textContent = "👋 Guest";
    if (adminNavLink) adminNavLink.style.display = "none";
    if (btn) {
      btn.textContent = "Sign In";
      btn.onclick = (e) => { e.preventDefault(); openAuthModal(); };
    }
  }
}

// 8. Event Listener Setup
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  const client = getSupabase();
  if (client && client.auth) {
    client.auth.onAuthStateChange((event) => {
      console.log("Auth event:", event);
      updateAuthUI();
    });
  }
});