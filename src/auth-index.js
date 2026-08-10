function updateAuthUI() {
  const user = localStorage.getItem(SKILLZ_CONFIG.storageKey);
  const greeting = document.getElementById('user-greeting');
  const btn = document.getElementById('auth-action-btn');

  if (user) {
    if (greeting) greeting.textContent = "👋 Hello " + user + "'s Workspace Dashboard";
    if (btn) {
      btn.textContent = "Sign Out";
      btn.onclick = () => { localStorage.removeItem(SKILLZ_CONFIG.storageKey); updateAuthUI(); };
    }
  } else {
    if (greeting) greeting.textContent = "👋 Hello Guest";
    if (btn) {
      btn.textContent = "Sign In";
      btn.onclick = () => { localStorage.setItem(SKILLZ_CONFIG.storageKey, SKILLZ_CONFIG.defaultUser); updateAuthUI(); };
    }
  }
}

document.addEventListener('DOMContentLoaded', updateAuthUI);