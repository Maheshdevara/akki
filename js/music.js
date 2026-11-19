/**
 * Continuous Birthday Soundtrack Engine
 * Plays seamlessly starting from Page 1 throughout Akshaya's 25th celebration
 */
(function() {
  const isTopWindow = (window === window.top);

  // If inside child iframe (page1, page2, surprise, page4, page5):
  if (!isTopWindow) {
    function notifyParentStart() {
      try {
        window.parent.postMessage({ type: 'START_BGM' }, '*');
      } catch (e) {}
    }

    notifyParentStart();
    window.addEventListener('load', notifyParentStart);
    window.addEventListener('click', notifyParentStart, { once: true });
    window.addEventListener('touchstart', notifyParentStart, { once: true });
    return;
  }

  // If in top shell (index.html) or standalone:
  let audio = document.getElementById('bgm-player');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'bgm-player';
    audio.src = 'audio/bday_music.mp3';
    audio.preload = 'auto';
    audio.loop = true;
    audio.playsInline = true;
    document.body.appendChild(audio);
  }

  let musicBtn = document.getElementById('master-music-btn');
  if (!musicBtn) {
    musicBtn = document.createElement('button');
    musicBtn.id = 'master-music-btn';
    musicBtn.className = 'global-music-btn muted';
    musicBtn.setAttribute('aria-label', 'Toggle Birthday Music');
    musicBtn.innerHTML = '<span class="music-icon">🎵</span><span class="music-label">Birthday Music</span>';
    musicBtn.style.display = 'none';
    document.body.appendChild(musicBtn);
  }

  const iconEl = musicBtn.querySelector('.music-icon');
  const labelEl = musicBtn.querySelector('.music-label');

  function updateButtonUI(isPlaying) {
    if (isPlaying) {
      musicBtn.classList.add('playing');
      musicBtn.classList.remove('muted');
      if (iconEl) iconEl.textContent = '🎵';
      if (labelEl) labelEl.textContent = 'Music On';
    } else {
      musicBtn.classList.remove('playing');
      musicBtn.classList.add('muted');
      if (iconEl) iconEl.textContent = '🔇';
      if (labelEl) labelEl.textContent = 'Muted';
    }
  }

  let userHasMuted = false;

  function playMusic() {
    if (userHasMuted) return;
    musicBtn.style.display = 'inline-flex';
    audio.play().then(() => {
      updateButtonUI(true);
      try { sessionStorage.setItem('bgm_active', '1'); } catch(e) {}
    }).catch(err => {
      // Autoplay waiting for user gesture
      const unlockAutoplay = () => {
        if (!userHasMuted) {
          audio.play().then(() => updateButtonUI(true)).catch(() => {});
        }
        window.removeEventListener('click', unlockAutoplay);
        window.removeEventListener('touchstart', unlockAutoplay);
      };
      window.addEventListener('click', unlockAutoplay, { once: true });
      window.addEventListener('touchstart', unlockAutoplay, { once: true });
    });
  }

  function pauseMusic() {
    audio.pause();
    updateButtonUI(false);
  }

  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) {
      userHasMuted = false;
      playMusic();
    } else {
      userHasMuted = true;
      pauseMusic();
    }
  });

  // Handle postMessage communication from celebration pages
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'START_BGM') {
      playMusic();
    } else if (event.data.type === 'DUCK_BGM') {
      audio.volume = 0.25;
      setTimeout(() => { audio.volume = 1.0; }, 6000);
    }
  });

  window.triggerStartFromPage1 = playMusic;

  try {
    if (sessionStorage.getItem('bgm_active') === '1') {
      playMusic();
    }
  } catch (e) {}
})();
