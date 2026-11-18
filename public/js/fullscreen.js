/**
 * Akshaya's 25th Birthday Celebration
 * Master Fullscreen Manager
 * Behavior: Once pressed, it stays in fullscreen throughout the journey till the last page.
 * Never asks again once active.
 */

(function () {
  'use strict';

  // 1. If loaded inside iframe, child pages never ask or display duplicate buttons
  if (window !== window.top) {
    return;
  }

  // 2. Running in TOP WINDOW (Master Presentation Shell):
  const docEl = document.documentElement;

  function isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      sessionStorage.getItem('akshaya_fs_active') === 'true'
    );
  }

  function enterFullscreen() {
    // Record choice: once pressed, never ask again
    sessionStorage.setItem('akshaya_fs_active', 'true');
    document.body.classList.add('is-in-fullscreen');

    const btn = document.getElementById('global-fs-btn');
    if (btn) {
      btn.classList.add('is-fullscreen');
      btn.style.setProperty('display', 'none', 'important');
    }

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

  function createFsButton() {
    if (document.getElementById('global-fs-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'global-fs-btn';
    btn.className = 'global-fs-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Full Screen Mode');
    btn.innerHTML = `
      <span class="fs-icon">⛶</span>
      <span class="fs-label">Full Screen</span>
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
      // If user pressed ESC or exited native fullscreen
      if (!isNativeFs && sessionStorage.getItem('akshaya_fs_active') !== 'true') {
        sessionStorage.setItem('akshaya_fs_active', 'false');
      }
      updateUI();
    });
  });

  // Expose global methods for frame coordination
  window.enterCelebrationFullscreen = enterFullscreen;
  window.isCelebrationFullscreen = isFullscreenActive;

  // Double click / double tap background to toggle fullscreen
  let lastTap = 0;
  document.addEventListener('touchend', function (e) {
    const now = new Date().getTime();
    if (now - lastTap < 300 && now - lastTap > 60) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (!['button', 'a', 'input'].includes(tag)) {
        if (isFullscreenActive()) {
          exitFullscreen();
        } else {
          enterFullscreen();
        }
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
