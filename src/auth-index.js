// Triggers Supabase Google OAuth Login
async function signInWithGoogle() {
  if (!supabase) {
    alert("Supabase client is not loaded. Check your config.js credentials!");
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href // Redirect back to the exact current page
    }
  });

  if (error) {
    console.error("Error logging in:", error.message);
    alert("Sign-in failed: " + error.message);
  }
}

// Signs out active user
async function signOut() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(SKILLZ_CONFIG.storageKey);
  await updateAuthUI();
}

// Updates Navbar Greeting and Sign-In Button State
async function updateAuthUI() {
  const greeting = document.getElementById('user-greeting');
  const btn = document.getElementById('auth-action-btn');

  let user = null;

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    user = data.session?.user;
  }

  if (user) {
    const displayName = user.user_metadata?.full_name || user.email || SKILLZ_CONFIG.defaultUser;
    if (greeting) greeting.textContent = "👋 Hello " + displayName;
    if (btn) {
      btn.textContent = "Sign Out";
      btn.onclick = signOut;
    }
  } else {
    if (greeting) greeting.textContent = "👋 Guest";
    if (btn) {
      btn.textContent = "Sign In with Google";
      btn.onclick = signInWithGoogle;
    }
  }
}

// Initialize Auth Status on Page Load & Listen for OAuth Changes
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