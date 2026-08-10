document.getElementById('reset-session-btn')?.addEventListener('click', () => {
  localStorage.clear();
  alert("Session cache cleared!");
  window.location.href = '../index.html';
});