/**
 * Akshaya 25th Birthday Celebration — Master Audio Controller
 * Plays "Happy Birthday" background score continuously across all pages
 * starting from Page 1 right after the lock screen is unlocked.
 */
(function() {
  'use strict';

  const AUDIO_SRC = 'audio/bday_music.mp3';
  const FALLBACK_SRC = 'bday_music.mp3';

  // Check if current page is the lock screen
  const isLockPage = window.location.pathname.endsWith('lock.html') || 
                     window.location.pathname === '/' || 
                     window.location.pathname.endsWith('index.html');

  // Master music controller on window
  window.CelebrationMusic = {
    audio: null,
    isPlaying: false,
    isMuted: sessionStorage.getItem('celebration_music_muted') === 'true',

    init() {
      // If we are in an iframe, communicate with top window if available
      if (window.top && window.top !== window && window.top.CelebrationMusicMaster) {
        this.wireTopMaster();
        return;
      }

      // Standalone or top window audio manager
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.preload = 'auto';

        const source1 = document.createElement('source');
        source1.src = AUDIO_SRC;
        source1.type = 'audio/mpeg';
        const source2 = document.createElement('source');
        source2.src = FALLBACK_SRC;
        source2.type = 'audio/mpeg';

        this.audio.appendChild(source1);
        this.audio.appendChild(source2);

        // Restore playback position across pages
        const savedTime = parseFloat(sessionStorage.getItem('celebration_music_time') || '0');
        if (savedTime > 0 && !isNaN(savedTime)) {
          this.audio.currentTime = savedTime;
        }

        // Save progress periodically
        this.audio.addEventListener('timeupdate', () => {
          if (this.audio.currentTime > 0) {
            sessionStorage.setItem('celebration_music_time', this.audio.currentTime.toString());
          }
        });

        this.audio.addEventListener('play', () => {
          this.isPlaying = true;
          this.updateUi();
        });

        this.audio.addEventListener('pause', () => {
          this.isPlaying = false;
          this.updateUi();
        });
      }

      // If unlocked, play music starting on page 1 onwards
      const isUnlocked = sessionStorage.getItem('celebration_unlocked') === 'true' || 
                         sessionStorage.getItem('celebration_music_enabled') === 'true';

      if (isUnlocked && !this.isMuted) {
        this.play();
      }

      this.injectMusicUi();

      // Ensure autoplay on first user interaction if blocked by browser policy
      const unlockAudio = () => {
        const canPlay = sessionStorage.getItem('celebration_unlocked') === 'true' || 
                        sessionStorage.getItem('celebration_music_enabled') === 'true';
        if (canPlay && (!this.audio || this.audio.paused) && !this.isMuted) {
          this.play();
        }
      };
      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    },

    wireTopMaster() {
      this.injectMusicUi();
    },

    play() {
      if (window.top && window.top !== window && window.top.CelebrationMusicMaster) {
        window.top.CelebrationMusicMaster.play();
        return;
      }

      if (!this.audio) return;
      this.audio.muted = false;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          sessionStorage.setItem('celebration_music_enabled', 'true');
          this.updateUi();
        }).catch(() => {
          // Browser requires user gesture; handled by pointerdown listener
        });
      }
    },

    pause() {
      if (window.top && window.top !== window && window.top.CelebrationMusicMaster) {
        window.top.CelebrationMusicMaster.pause();
        return;
      }
      if (this.audio) {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUi();
      }
    },

    toggle() {
      if (window.top && window.top !== window && window.top.CelebrationMusicMaster) {
        window.top.CelebrationMusicMaster.toggle();
        this.updateUi();
        return;
      }

      if (this.isPlaying) {
        this.pause();
        this.isMuted = true;
        sessionStorage.setItem('celebration_music_muted', 'true');
      } else {
        this.isMuted = false;
        sessionStorage.setItem('celebration_music_muted', 'false');
        this.play();
      }
      this.updateUi();
    },

    injectMusicUi() {
      if (document.getElementById('global-music-toggle')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'global-music-toggle';
      btn.className = 'global-music-btn';
      btn.setAttribute('aria-label', 'Toggle Background Music');
      btn.title = 'Toggle Birthday Music (Happy Birthday Background Score)';

      btn.innerHTML = `
        <span class="music-icon-wrap">
          <svg class="music-svg-note" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </span>
        <span class="music-btn-text" id="music-btn-text">Music</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      document.body.appendChild(btn);
      this.updateUi();
    },

    updateUi() {
      const btn = document.getElementById('global-music-toggle');
      const text = document.getElementById('music-btn-text');
      if (!btn) return;

      let currentlyPlaying = this.isPlaying;
      if (window.top && window.top !== window && window.top.CelebrationMusicMaster) {
        currentlyPlaying = window.top.CelebrationMusicMaster.isPlaying;
      }

      if (currentlyPlaying) {
        btn.classList.add('playing');
        btn.classList.remove('muted');
        if (text) text.textContent = 'Music ON';
      } else {
        btn.classList.remove('playing');
        btn.classList.add('muted');
        if (text) text.textContent = 'Music OFF';
      }
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.CelebrationMusic.init());
  } else {
    window.CelebrationMusic.init();
  }
})();
