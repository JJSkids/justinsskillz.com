// ==========================================================================
// Justin's Skillz - Admin Script Handler
// Path: src/admin.js
// ==========================================================================

document.getElementById('reset-session-btn')?.addEventListener('click', () => {
  localStorage.clear();
  alert("Session cache cleared!");
  window.location.href = '../index.html';
});