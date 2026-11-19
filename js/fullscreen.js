/**
 * Akshaya's 25th Birthday Celebration
 * Master Fullscreen Manager for PC and ANY iPhone Model
 * Features:
 * - PC: Native browser Fullscreen API with zero-border monitor mode.
 * - iPhone: Edge-to-edge viewport-fit=cover, minimal-UI collapse, and Home Screen PWA tip.
 * - Once activated, stays in full screen across all pages till the last.
 * - Never asks repeatedly.
 */

(function () {
  'use strict';

  // If inside iframe, child pages delegate to top window
  if (window !== window.top) {
    return;
  }

  const docEl = document.documentElement;
  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      sessionStorage.getItem('akshaya_fs_active') === 'true'
    );
  }

  function showIPhoneTip() {
    if (document.getElementById('iphone-fullscreen-tip')) return;

    // Only show if not already running in standalone PWA mode
    if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const tip = document.createElement('div');
    tip.id = 'iphone-fullscreen-tip';
    tip.className = 'iphone-fullscreen-tip';
    tip.innerHTML = `
      <span>📲 <strong>iPhone Tip:</strong> Tap <strong>Share ⎙</strong> → <strong>"Add to Home Screen"</strong> for 100% full screen without browser bars! ✨</span>
      <button type="button" class="iphone-tip-close" aria-label="Close">✕</button>
    `;

    tip.querySelector('.iphone-tip-close').addEventListener('click', () => {
      tip.style.opacity = '0';
      setTimeout(() => tip.remove(), 400);
    });

    document.body.appendChild(tip);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      if (tip && tip.parentNode) {
        tip.style.opacity = '0';
        setTimeout(() => tip.remove(), 400);
      }
    }, 6000);
  }

  function enterFullscreen() {
    sessionStorage.setItem('akshaya_fs_active', 'true');
    document.body.classList.add('is-in-fullscreen');

    const btn = document.getElementById('global-fs-btn');
    if (btn) {
      btn.classList.add('is-fullscreen');
      btn.style.setProperty('display', 'none', 'important');
    }

    if (isIPhone) {
      // iPhone handling: collapse Safari bars and show 1-time tip
      try {
        window.scrollTo(0, 1);
      } catch (e) {}
      showIPhoneTip();
      return Promise.resolve();
    }

    // PC / Android handling: standard Fullscreen API
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
      return p ? p.catch(() => {}) : Promise.resolve();
    } catch (err) {
      return Promise.resolve();
    }
  }

  function exitFullscreen() {
    sessionStorage.setItem('akshaya_fs_active', 'false');
    document.body.classList.remove('is-in-fullscreen');

    try {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (err) {}

    updateUI();
  }

  function toggleFullscreen() {
    if (isFullscreenActive()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  function createFsButton() {
    if (document.getElementById('global-fs-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'global-fs-btn';
    btn.className = 'global-fs-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Full Screen Mode');
    btn.title = isIPhone ? 'iPhone Immersive Full Screen' : 'PC Full Screen (F11)';
    btn.innerHTML = `
      <span class="fs-icon">⛶</span>
      <span class="fs-label">${isIPhone ? 'Full Screen' : 'Full Screen'}</span>
    `;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      enterFullscreen();
    });

    document.body.appendChild(btn);
    updateUI();
  }

  function updateUI() {
    const btn = document.getElementById('global-fs-btn');
    const active = isFullscreenActive();

    if (active) {
      document.body.classList.add('is-in-fullscreen');
      if (btn) {
        btn.classList.add('is-fullscreen');
        btn.style.setProperty('display', 'none', 'important');
      }
    } else {
      document.body.classList.remove('is-in-fullscreen');
      if (btn) {
        btn.classList.remove('is-fullscreen');
        btn.style.display = 'inline-flex';
      }
    }
  }

  // Cross-browser fullscreen change events
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
    document.addEventListener(evt, () => {
      const isNativeFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (!isNativeFs && sessionStorage.getItem('akshaya_fs_active') !== 'true') {
        sessionStorage.setItem('akshaya_fs_active', 'false');
      }
      updateUI();
    });
  });

  // Expose global methods
  window.enterCelebrationFullscreen = enterFullscreen;
  window.isCelebrationFullscreen = isFullscreenActive;

  // Double tap / double click background to toggle
  let lastTap = 0;
  document.addEventListener('touchend', function (e) {
    const now = new Date().getTime();
    if (now - lastTap < 300 && now - lastTap > 60) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (!['button', 'a', 'input'].includes(tag) && !e.target.closest('button, a, input')) {
        toggleFullscreen();
      }
    }
    lastTap = now;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFsButton);
  } else {
    createFsButton();
  }
})();
