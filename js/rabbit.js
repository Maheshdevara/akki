// Intelligent Jumping Rabbit Controller
class JumpingRabbit {
  constructor() {
    this.el = document.getElementById('bunny-actor');
    this.bubble = document.getElementById('bunny-bubble');
    this.isHopping = false;
    this.currentXPercent = 25; // in percentage of screen width
    this.facing = 1; // 1 = right, -1 = left
    this.autoHopTimer = null;
    this.quotes = [
      "Happy 25th Birthday Akshaya! 🌸",
      "Hop hop! Silver Jubilee Queen! 👑",
      "Akshaya is 25 & fabulous! ✨",
      "Carrots & Birthday Cake for Akshaya! 🥕🎂",
      "May all your wishes bloom today! 🌷",
      "Yay Akshaya! Best year ahead! 💖",
      "Hop hop hop! Let's celebrate! 🎉"
    ];

    this.init();
  }

  init() {
    if (!this.el) return;

    // Set initial position
    this.updatePosition(this.currentXPercent, false);

    // Rabbit click listener
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.celebrateJump();
    });

    // Start auto hopping from here and there
    this.scheduleNextHop();
  }

  updatePosition(xPercent, animate = true) {
    this.currentXPercent = Math.max(5, Math.min(85, xPercent));
    this.el.style.left = `${this.currentXPercent}%`;
  }

  scheduleNextHop() {
    if (this.autoHopTimer) clearTimeout(this.autoHopTimer);
    // Hop every 3.5 to 7 seconds randomly
    const delay = 3500 + Math.random() * 3500;
    this.autoHopTimer = setTimeout(() => {
      this.randomHop();
    }, delay);
  }

  // Pick a random spot "here and there" and hop to it
  randomHop() {
    if (this.isHopping) return;

    // Generate random distance hop between 12% and 30% of screen width
    const direction = Math.random() > 0.5 ? 1 : -1;
    const distance = (12 + Math.random() * 20) * direction;
    let targetX = this.currentXPercent + distance;

    // Keep within bounds (5% to 85%)
    if (targetX < 8) targetX = 15 + Math.random() * 25;
    if (targetX > 85) targetX = 55 + Math.random() * 25;

    this.hopTo(targetX);
  }

  // Hop towards a specific X coordinate
  hopTo(targetX, onComplete = null) {
    if (this.isHopping) return;
    this.isHopping = true;

    // Determine facing direction
    this.facing = targetX > this.currentXPercent ? 1 : -1;
    
    // Play hop sound
    if (window.soundEngine) {
      window.soundEngine.playHopSound();
    }

    // Number of little hops depending on distance
    const distance = Math.abs(targetX - this.currentXPercent);
    const hopsCount = distance > 25 ? 2 : 1;
    let hopStep = 0;

    const startX = this.currentXPercent;
    const totalStepDistance = (targetX - startX) / hopsCount;

    const performStep = () => {
      hopStep++;
      const nextX = startX + totalStepDistance * hopStep;

      // Animate hop arc
      const duration = 500; // ms per hop
      const startTime = performance.now();

      const animateFrame = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Parabolic jump arc: height up to 60px
        const jumpY = Math.sin(progress * Math.PI) * -55;
        // Squash & Stretch
        const scaleY = 1 + Math.sin(progress * Math.PI) * 0.25 - (progress > 0.85 ? 0.2 : 0);
        const scaleX = (this.facing) * (1 - Math.sin(progress * Math.PI) * 0.15 + (progress > 0.85 ? 0.2 : 0));

        const curX = (startX + totalStepDistance * (hopStep - 1)) + (totalStepDistance * progress);
        this.el.style.left = `${curX}%`;
        this.el.style.transform = `translateY(${jumpY}px) scale(${scaleX}, ${scaleY})`;

        if (progress < 1) {
          requestAnimationFrame(animateFrame);
        } else {
          // Landing bounce
          this.el.style.transform = `scale(${this.facing * 1.15}, 0.85)`;
          this.createPuffEffect(this.el);

          setTimeout(() => {
            this.el.style.transform = `scale(${this.facing}, 1)`;
            if (hopStep < hopsCount) {
              if (window.soundEngine) window.soundEngine.playHopSound();
              setTimeout(performStep, 100);
            } else {
              this.currentXPercent = targetX;
              this.isHopping = false;
              if (onComplete) onComplete();
              this.scheduleNextHop();
            }
          }, 80);
        }
      };

      requestAnimationFrame(animateFrame);
    };

    performStep();
  }

  // Celebratory high jump when clicked or called
  celebrateJump() {
    if (this.isHopping) return;
    this.isHopping = true;

    if (window.soundEngine) {
      window.soundEngine.playChime(1.2);
    }

    // Show random birthday quote bubble
    const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    this.showSpeechBubble(quote);

    // Trigger grand spin animation
    this.el.classList.add('jump-celebrate');

    // Spawn heart particles around bunny
    const rect = this.el.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.spawnHeart(rect.left + rect.width / 2 + (Math.random() * 40 - 20), rect.top + (Math.random() * 20));
      }, i * 80);
    }

    setTimeout(() => {
      this.el.classList.remove('jump-celebrate');
      this.isHopping = false;
      this.scheduleNextHop();
    }, 1100);
  }

  showSpeechBubble(text) {
    if (!this.bubble) return;
    this.bubble.innerText = text;
    this.bubble.classList.add('active');

    setTimeout(() => {
      this.bubble.classList.remove('active');
    }, 2800);
  }

  createPuffEffect(element) {
    const puff = document.createElement('div');
    puff.innerText = '🌸';
    puff.style.position = 'absolute';
    puff.style.bottom = '0';
    puff.style.left = '45%';
    puff.style.fontSize = '14px';
    puff.style.opacity = '0.9';
    puff.style.pointerEvents = 'none';
    puff.style.transition = 'all 0.5s ease-out';
    element.appendChild(puff);

    setTimeout(() => {
      puff.style.transform = 'translateY(-20px) scale(1.4)';
      puff.style.opacity = '0';
    }, 10);

    setTimeout(() => {
      if (puff.parentNode) puff.parentNode.removeChild(puff);
    }, 600);
  }

  spawnHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    const emojis = ['💖', '✨', '🥕', '🌸', '🎂'];
    heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);

    setTimeout(() => {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, 1500);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.bunny = new JumpingRabbit();
});
