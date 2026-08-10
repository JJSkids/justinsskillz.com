function detectDeviceMode() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isSmallScreen = window.innerWidth <= 768;

  if (isTouch || isSmallScreen) {
    document.body.classList.add('mobile-mode');
    document.body.classList.remove('desktop-mode');
  } else {
    document.body.classList.add('desktop-mode');
    document.body.classList.remove('mobile-mode');
  }
}

window.addEventListener('load', detectDeviceMode);
window.addEventListener('resize', detectDeviceMode);