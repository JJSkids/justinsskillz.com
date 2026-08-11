// ==========================================================================
// Justin's Skillz - Dashboard Auth Greeting Handler
// Path: src/auth-dashboard.js
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const user = localStorage.getItem(SKILLZ_CONFIG.storageKey) || SKILLZ_CONFIG.defaultUser;
  const greeting = document.getElementById('user-greeting');
  if (greeting) greeting.textContent = "👋 Hello " + user + "'s Workspace Dashboard";
});