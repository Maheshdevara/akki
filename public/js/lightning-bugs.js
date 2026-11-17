/**
 * Lightning Bugs (Fireflies) Bioluminescent Particle Simulation
 * Realistic glowing fireflies that wander, flutter wings, pulse light, and react to interaction.
 */
(function() {
  function initLightningBugs() {
    let canvas = document.getElementById('lightning-bugs-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'lightning-bugs-canvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '8'; // Sits above backdrop, behind cards/modals
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    function onResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);

    // Mouse tracking for subtle avoidance
    let mouse = { x: -1000, y: -1000, active: false };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    // Lightning Bug Class
    const BUG_COUNT = Math.min(38, Math.max(22, Math.floor((width * height) / 32000)));
    const bugs = [];

    const BUG_PALETTES = [
      { r: 255, g: 234, b: 121 }, // Bright Warm Gold
      { r: 255, g: 215, b: 0 },   // Neon Amber Gold
      { r: 217, g: 249, b: 157 }, // Soft Bioluminescent Lime
      { r: 163, g: 230, b: 53 },  // Fresh Firefly Green
      { r: 254, g: 240, b: 138 }  // Pale Glow White-Yellow
    ];

    class LightningBug {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : (Math.random() > 0.5 ? height + 20 : -20);
        this.z = 0.4 + Math.random() * 0.8; // Depth factor (0.4 to 1.2)
        this.speed = (0.5 + Math.random() * 0.9) * this.z;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.04;
        
        // Wing flutter
        this.wingAngle = 0;
        this.wingSpeed = 0.25 + Math.random() * 0.35;

        // Bioluminescent organic blink cycle
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.035;
        this.flashIntensity = 0;

        // Color
        this.palette = BUG_PALETTES[Math.floor(Math.random() * BUG_PALETTES.length)];
        this.baseRadius = 1.8 * this.z;
        this.glowRadius = (16 + Math.random() * 18) * this.z;
      }

      update() {
        // Natural wandering with soft curves
        this.angle += this.angleSpeed + (Math.random() - 0.5) * 0.08;
        if (Math.random() < 0.02) {
          this.angleSpeed = (Math.random() - 0.5) * 0.06;
        }

        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed - 0.15; // Gentle upward buoyancy

        // Soft avoidance from mouse cursor
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 1) {
            const force = (110 - dist) / 110;
            vx += (dx / dist) * force * 2.2;
            vy += (dy / dist) * force * 2.2;
          }
        }

        this.x += vx;
        this.y += vy;

        // Wing flutter oscillation
        this.wingAngle += this.wingSpeed;

        // Organic light breathing / blinking
        this.pulsePhase += this.pulseSpeed;
        const rawPulse = Math.sin(this.pulsePhase);
        // Intermittent flash profile (slow glow with sudden spark)
        this.flashIntensity = Math.max(0, Math.pow(Math.max(0, rawPulse), 2.2));

        // Screen wrap
        if (this.x < -30) this.x = width + 30;
        else if (this.x > width + 30) this.x = -30;

        if (this.y < -40) this.y = height + 30;
        else if (this.y > height + 40) this.y = -30;
      }

      draw() {
        if (this.flashIntensity < 0.04) return;

        const { r, g, b } = this.palette;
        const alpha = Math.min(1, this.flashIntensity * 0.95);

        // 1. Outer Soft Bioluminescent Halo
        const glowRad = this.glowRadius * (0.8 + this.flashIntensity * 0.4);
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRad);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`);
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`);
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.08})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // 2. Shiny Inner Core Dot
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseRadius * (0.85 + this.flashIntensity * 0.3), 0, Math.PI * 2);
        ctx.fill();

        // 3. Delicate Translucent Fluttering Wings
        const wingSpan = (4.5 + Math.sin(this.wingAngle) * 2.5) * this.z;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
        ctx.lineWidth = 0.8 * this.z;

        ctx.beginPath();
        ctx.ellipse(this.x - 2 * this.z, this.y - 1.5 * this.z, wingSpan, 1.8 * this.z, -0.4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(this.x + 2 * this.z, this.y - 1.5 * this.z, wingSpan, 1.8 * this.z, 0.4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
    }

    // Populate Bugs
    for (let i = 0; i < BUG_COUNT; i++) {
      bugs.push(new LightningBug());
    }

    // Main Animation Loop
    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < bugs.length; i++) {
        bugs[i].update();
        bugs[i].draw();
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightningBugs);
  } else {
    initLightningBugs();
  }
})();
