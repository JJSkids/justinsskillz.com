// src/cookie-banner.js
document.addEventListener('DOMContentLoaded', () => {
  // Check if user has already made a choice
  const cookieConsent = localStorage.getItem('justin_cookie_consent');
  if (cookieConsent) return;

  // Create banner container
  const banner = document.createElement('div');
  banner.id = 'cookieConsentBanner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-card, #181b25);
    border-top: 1px solid var(--border-subtle, #2d3242);
    color: var(--text-main, #f3f4f6);
    padding: 1.25rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    z-index: 9999;
    box-shadow: 0 -10px 30px rgba(0,0,0,0.35);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    animation: slideUp 0.3s ease-out;
  `;

  banner.innerHTML = `
    <div style="flex: 1; line-height: 1.5;">
      🍪 <strong>Cookie & Storage Notice:</strong> We use local storage and cookies to save your lesson progress, math lab stats, and theme preferences. 
    </div>
    <div style="display: flex; gap: 0.75rem; align-items: center; flex-shrink: 0;">
      <button type="button" id="acceptCookiesBtn" style="background: var(--accent-purple, #a855f7); color: white; border: none; padding: 0.55rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;">Accept</button>
      <button type="button" id="declineCookiesBtn" style="background: transparent; border: 1px solid var(--border-subtle, #2d3242); color: var(--text-muted, #9ca3af); padding: 0.55rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer;">Decline</button>
    </div>
  `;

  // Add slide-up animation style dynamically
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(styleTag);
  document.body.appendChild(banner);

  // Button actions
  document.getElementById('acceptCookiesBtn').addEventListener('click', () => {
    localStorage.setItem('justin_cookie_consent', 'accepted');
    banner.style.transform = 'translateY(100%)';
    setTimeout(() => banner.remove(), 300);
  });

  document.getElementById('declineCookiesBtn').addEventListener('click', () => {
    localStorage.setItem('justin_cookie_consent', 'declined');
    banner.style.transform = 'translateY(100%)';
    setTimeout(() => banner.remove(), 300);
  });
});