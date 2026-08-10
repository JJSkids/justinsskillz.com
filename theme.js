/* ==========================================================================
   Justin's Skillz - Global Theme Engine
   Path: theme.js
   ========================================================================== */

(function () {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme ? savedTheme : (systemPrefersLight ? 'light' : 'dark');

  document.documentElement.setAttribute('data-theme', initialTheme);

  function updateButtonUI(btn, theme) {
    if (!btn) return;
    btn.innerHTML = theme === 'light' 
      ? '<span class="theme-icon">☀️</span> Light Mode' 
      : '<span class="theme-icon">🌙</span> Dark Mode';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const currentTheme = document.documentElement.getAttribute('data-theme');

    toggleBtns.forEach(btn => updateButtonUI(btn, currentTheme));

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = activeTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);

        toggleBtns.forEach(b => updateButtonUI(b, nextTheme));
      });
    });
  });
})();