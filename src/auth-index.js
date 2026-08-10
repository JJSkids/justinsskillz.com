// ==========================================================================
// Justin's Skillz - Full Auth & Admin Protection Handler
// Path: src/auth-index.js
// ==========================================================================

let isSignUpMode = false;

// 1. Open / Close Modal
function openAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

// 2. Toggle between Sign In & Sign Up
function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  const title = document.getElementById('modal-title');
  const btn = document.getElementById('modal-submit-btn');
  const toggleText = document.getElementById('auth-toggle-text');

  if (isSignUpMode) {
    title.textContent = "Create Account";
    btn.textContent = "Sign Up";
    toggleText.innerHTML = 'Already have an account? <a onclick="toggleAuthMode()">Sign In</a>';
  } else {
    title.textContent = "Sign In";
    btn.textContent = "Sign In";
    toggleText.innerHTML = 'Don\'t have an account? <a onclick="toggleAuthMode()">Sign Up</a>';
  }
}

// 3. Handle Form Submission (Email + Password)
async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!supabase) return alert("Supabase not initialized!");

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (isSignUpMode) {
    // --- SIGN UP ---
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("Sign Up Error: " + error.message);
    } else {
      alert("Account created! If email confirmation is enabled in your Supabase settings, please check your inbox.");
      closeAuthModal();
      updateAuthUI();
    }
  } else {
    // --- SIGN IN ---
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Sign In Error: " + error.message);
    } else {
      closeAuthModal();
      updateAuthUI();
    }
  }
}

// 4. Google Sign In
async function signInWithGoogle() {
  if (!supabase) return alert("Supabase not initialized!");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });

  if (error) alert("Google Sign-In Error: " + error.message);
}

// 5. Sign Out
async function signOut() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem("user_session");
  alert("Signed out successfully!");
  updateAuthUI();
}

// 6. Helper: Check if Current User is Admin
function isAdmin(user) {
  if (!user || !user.email) return false;
  const userEmail = user.email.toLowerCase();
  const adminList = (SKILLZ_CONFIG.adminEmails || []).map(e => e.toLowerCase());
  return adminList.includes(userEmail);
}

// 7. Update Navigation & Admin Status
async function updateAuthUI() {
  const greeting = document.getElementById('user-greeting');
  const btn = document.getElementById('auth-action-btn');
  const adminNavLink = document.getElementById('admin-nav-link');

  let user = null;

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    user = data.session?.user || null;
  }

  if (user) {
    const userIsAdmin = isAdmin(user);
    if (greeting) {
      greeting.textContent = userIsAdmin ? "👑 Admin: " + user.email : "👋 " + user.email;
    }

    // Show Admin Link in Navbar ONLY if user is Admin
    if (adminNavLink) {
      adminNavLink.style.display = userIsAdmin ? "inline-block" : "none";
    }

    if (btn) {
      btn.textContent = "Sign Out";
      btn.onclick = signOut;
    }
  } else {
    if (greeting) greeting.textContent = "👋 Guest";
    if (adminNavLink) adminNavLink.style.display = "none";
    if (btn) {
      btn.textContent = "Sign In";
      btn.onclick = openAuthModal;
    }
  }
}

// 8. Initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  if (supabase) {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        updateAuthUI();
      }
    });
  }
});