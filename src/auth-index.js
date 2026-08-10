// ==========================================================================
// Justin's Skillz - Diagnostic & Fixed Auth Handler
// Path: src/auth-index.js
// ==========================================================================

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

// 3. Handle Form Submit (Sign Up / Sign In)
async function handleAuthSubmit(event) {
  event.preventDefault();

  if (!supabase) {
    alert("❌ Error: Supabase is not connected! Check your config.js credentials or make sure your Supabase project is not PAUSED.");
    return;
  }

  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  console.log(`[Auth Attempt] Mode: ${isSignUpMode ? 'SignUp' : 'SignIn'}, Email: ${email}`);

  if (isSignUpMode) {
    // --- CREATE NEW ACCOUNT ---
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      console.error("Sign Up Failure:", error);
      alert("❌ Sign Up Failed:\n\n" + error.message);
    } else if (data.user && data.session) {
      alert("🎉 Account created and signed in successfully!");
      closeAuthModal();
      updateAuthUI();
    } else {
      alert("📧 Account created! If 'Confirm Email' is turned on in Supabase, please check your email inbox to confirm your account before signing in.");
      closeAuthModal();
    }

  } else {
    // --- SIGN IN EXISTING ACCOUNT ---
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error("Sign In Failure:", error);
      alert("❌ Sign In Failed:\n\n" + error.message + "\n\n💡 Note: If you haven't created an account yet, click 'Sign Up' first!");
    } else {
      alert("✅ Signed in successfully!");
      closeAuthModal();
      updateAuthUI();
    }
  }
}

// 4. Google Sign In
async function signInWithGoogle() {
  if (!supabase) {
    alert("❌ Supabase client is offline.");
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });

  if (error) {
    alert("❌ Google Sign-In Error:\n\n" + error.message + "\n\nTip: Google Auth requires Google Cloud OAuth credentials configured in your Supabase Dashboard under Auth -> Providers -> Google.");
  }
}

// 5. Sign Out Function
async function signOut() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.clear();
  alert("Signed out successfully.");
  updateAuthUI();
}

// 6. Check if Current User is Admin
function isAdmin(user) {
  if (!user || !user.email) return false;
  const userEmail = user.email.toLowerCase();
  const adminList = (typeof SKILLZ_CONFIG !== 'undefined' && SKILLZ_CONFIG.adminEmails)
    ? SKILLZ_CONFIG.adminEmails.map(e => e.toLowerCase())
    : [];
  return adminList.includes(userEmail);
}

// 7. Update Nav Bar & Admin Links
async function updateAuthUI() {
  const greeting = document.getElementById('user-greeting');
  const btn = document.getElementById('auth-action-btn');
  const adminNavLink = document.getElementById('admin-nav-link');

  let user = null;

  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user || null;
    } catch (err) {
      console.error("Session check failed:", err);
    }
  }

  if (user) {
    const userIsAdmin = isAdmin(user);
    
    if (greeting) {
      greeting.textContent = userIsAdmin ? "👑 Admin: " + user.email : "👋 " + user.email;
    }

    if (adminNavLink) {
      adminNavLink.style.display = userIsAdmin ? "inline-block" : "none";
    }

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

// 8. Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth State Changed:", event);
      updateAuthUI();
    });
  }
});