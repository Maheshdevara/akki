/**
 * Akshaya's 25th Birthday Celebration
 * Global Fullscreen & Adaptive Viewport Manager
 * Supports: Laptop / Desktop Fullscreen Mode + Mobile Phone Immersive View
 */

(function () {
  'use strict';

  // Prevent multiple initializations if script loaded twice
  if (window.__akshayaFsInitialized) return;
  window.__akshayaFsInitialized = true;

  const docEl = document.documentElement;

  // Determine if Fullscreen API is supported
  const isFsSupported = !!(
    docEl.requestFullscreen ||
    docEl.webkitRequestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.msRequestFullscreen
  );

  function isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function enterFullscreen() {
    if (isFullscreenActive()) return Promise.resolve();

    try {
      let p;
      if (docEl.requestFullscreen) {
        p = docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        p = docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        p = docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        p = docEl.msRequestFullscreen();
      }

      if (p && p.then) {
        return p.then(() => {
          sessionStorage.setItem('akshaya_fs_mode', 'true');
          updateButtonUI();
        }).catch((err) => {
          // Ignored if user gesture requirement fails
        });
      } else {
        sessionStorage.setItem('akshaya_fs_mode', 'true');
        updateButtonUI();
        return Promise.resolve();
      }
    } catch (err) {
      return Promise.resolve();
    }
  }

  function exitFullscreen() {
    if (!isFullscreenActive()) return Promise.resolve();

    try {
      let p;
      if (document.exitFullscreen) {
        p = document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        p = document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        p = document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        p = document.msExitFullscreen();
      }

      sessionStorage.setItem('akshaya_fs_mode', 'false');
      if (p && p.then) {
        return p.then(updateButtonUI).catch(() => {});
      } else {
        updateButtonUI();
        return Promise.resolve();
      }
    } catch (err) {
      return Promise.resolve();
    }
  }

  function toggleFullscreen() {
    if (isFullscreenActive()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  // Inject or bind the floating Full Screen Button
  function createFsButton() {
    if (document.getElementById('global-fs-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'global-fs-btn';
    btn.className = 'global-fs-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Toggle Fullscreen Mode');
    btn.title = 'Full Screen (Laptop & Phone)';
    btn.innerHTML = `
      <span class="fs-icon" id="fs-icon">⛶</span>
      <span class="fs-label" id="fs-label">Full Screen</span>
    `;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleFullscreen();
    });

    document.body.appendChild(btn);
  }

  function updateButtonUI() {
    const icon = document.getElementById('fs-icon');
    const label = document.getElementById('fs-label');
    const btn = document.getElementById('global-fs-btn');
    if (!btn) return;

    if (isFullscreenActive()) {
      if (icon) icon.textContent = '✕';
      if (label) label.textContent = 'Exit Screen';
      btn.classList.add('is-fullscreen');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      if (icon) icon.textContent = '⛶';
      if (label) label.textContent = 'Full Screen';
      btn.classList.remove('is-fullscreen');
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  // Cross-browser event listeners for fullscreen changes
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
    document.addEventListener(evt, updateButtonUI);
  });

  // Automatically request fullscreen on first user gesture (laptop click or phone tap)
  function handleFirstUserGesture(e) {
    // If the click was directly on the toggle button itself, let button handler process
    if (e.target && e.target.closest && e.target.closest('#global-fs-btn')) return;

    // Check user preference (defaults to true if not explicitly disabled)
    const pref = sessionStorage.getItem('akshaya_fs_mode');
    if (pref !== 'false' && !isFullscreenActive()) {
      enterFullscreen();
    }

    // Remove one-time gesture listeners
    window.removeEventListener('click', handleFirstUserGesture, true);
    window.removeEventListener('touchstart', handleFirstUserGesture, true);
    window.removeEventListener('keydown', handleFirstUserGesture, true);
  }

  window.addEventListener('click', handleFirstUserGesture, true);
  window.addEventListener('touchstart', handleFirstUserGesture, true);
  window.addEventListener('keydown', handleFirstUserGesture, true);

  // Double click / double tap empty background area to toggle fullscreen
  let lastTap = 0;
  document.addEventListener('touchend', function (e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 320 && tapLength > 50) {
      // Double tap detected: check if tapping on background / non-interactive element
      const tag = (e.target.tagName || '').toLowerCase();
      if (!['button', 'a', 'input', 'textarea'].includes(tag) && !e.target.closest('button, a, input')) {
        toggleFullscreen();
      }
    }
    lastTap = currentTime;
  });

  // Mobile viewport height fix (100dvh compatibility helper)
  function updateVhProperty() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  window.addEventListener('resize', updateVhProperty);
  window.addEventListener('orientationchange', updateVhProperty);
  updateVhProperty();

  // Mount button when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createFsButton();
      updateButtonUI();
    });
  } else {
    createFsButton();
    updateButtonUI();
  }
})();
