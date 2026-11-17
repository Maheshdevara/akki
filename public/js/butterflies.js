/**
 * Neon Gold Butterflies with Black Outlines & Firecracker Blast
 * Akshaya's 25th Birthday Celebration
 * 
 * Features:
 * 1. 20 Neon Gold Butterflies with crisp Black Outlines & delicate black veins.
 * 2. On clicking "Unlock Your Surprise 🦋🥳":
 *    - All butterflies rush together into an energetic golden core.
 *    - BLAST LIKE A CELEBRATORY FIRECRACKER!
 *    - 300+ golden firecracker sparklers, popping micro-bursts & shockwaves!
 *    - Smooth transition to surprise.html.
 */

class GoldNeonButterflyEngine {
  constructor(canvasId, posterSelector) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.posterEl = document.querySelector(posterSelector);

    this.butterflyCount = 20;
    this.butterflies = [];
    this.goldenPollen = [];
    this.firecrackerParticles = [];
    this.fireworkShockwaves = [];

    // State machine: 'NATURAL_ROAM' -> 'CONVERGE_CORE' -> 'FIRECRACKER_BLAST' -> 'REDIRECT'
    this.state = 'NATURAL_ROAM';
    this.stateStartTime = 0;
    this.transitionCallback = null;
    this.animFrameId = null;

    this.initCanvas();
    this.createButterflies();
    this.bindEvents();
    this.animate();
  }

  initCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  bindEvents() {
    this.resizeHandler = () => this.initCanvas();
    window.addEventListener('resize', this.resizeHandler);
  }

  getProtectedZones() {
    if (!this.posterEl) return [];
    const rect = this.posterEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return [];

    return [
      {
        // Face area
        cx: rect.left + rect.width * 0.38,
        cy: rect.top + rect.height * 0.34,
        rx: rect.width * 0.16,
        ry: rect.height * 0.15,
        padding: 18
      },
      {
        // Birthday text
        cx: rect.left + rect.width * 0.77,
        cy: rect.top + rect.height * 0.48,
        rx: rect.width * 0.22,
        ry: rect.height * 0.40,
        padding: 22
      }
    ];
  }

  createButterflies() {
    this.butterflies = [];
    for (let i = 0; i < this.butterflyCount; i++) {
      this.butterflies.push(this.makeSingleButterfly(i));
    }
  }

  makeSingleButterfly(id) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 140 + Math.random() * (this.width / 2.6);
    const x = (this.width / 2) + Math.cos(angle) * dist;
    const y = (this.height / 2) + Math.sin(angle) * (this.height * 0.42);
    const scale = 0.58 + Math.random() * 0.42;

    return {
      id: id,
      x: Math.max(30, Math.min(this.width - 30, x)),
      y: Math.max(30, Math.min(this.height - 30, y)),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      targetHeading: Math.random() * Math.PI * 2,
      currentHeading: 0,
      baseSpeed: 0.95 + Math.random() * 0.95,
      scale: scale,
      baseScale: scale,
      flapPhase: Math.random() * Math.PI * 2,
      flapSpeed: 0.16 + Math.random() * 0.06,
      flutterTimer: Math.random() * 60,
      isGliding: false,
      glideTimer: 0,
      wanderCountdown: Math.random() * 90,
      pollenTimer: 0
    };
  }

  // Flight Physics
  updateFlight(b, zones) {
    if (!b.isGliding) {
      b.flapPhase += b.flapSpeed;
      b.flutterTimer--;
      if (b.flutterTimer <= 0) {
        b.isGliding = true;
        b.glideTimer = 25 + Math.random() * 45;
      }
    } else {
      b.flapPhase += b.flapSpeed * 0.15;
      b.glideTimer--;
      if (b.glideTimer <= 0) {
        b.isGliding = false;
        b.flutterTimer = 35 + Math.random() * 55;
      }
    }

    b.wanderCountdown--;
    if (b.wanderCountdown <= 0) {
      b.wanderCountdown = 70 + Math.random() * 80;
      b.targetHeading += (Math.random() - 0.5) * 1.5;
    }

    const targetVx = Math.cos(b.targetHeading) * b.baseSpeed;
    const targetVy = Math.sin(b.targetHeading) * b.baseSpeed - (b.isGliding ? 0.05 : 0.2);

    b.vx += (targetVx - b.vx) * 0.035;
    b.vy += (targetVy - b.vy) * 0.035;

    // Avoid protected zones
    zones.forEach(zone => {
      const dx = b.x - zone.cx;
      const dy = b.y - zone.cy;
      const dist = ((dx * dx) / ((zone.rx + zone.padding) * (zone.rx + zone.padding))) +
                   ((dy * dy) / ((zone.ry + zone.padding) * (zone.ry + zone.padding)));

      if (dist < 1.0) {
        const repelForce = (1.0 - dist) * 1.8;
        const angle = Math.atan2(dy / zone.ry, dx / zone.rx);
        b.vx += Math.cos(angle) * repelForce;
        b.vy += Math.sin(angle) * repelForce;
        b.targetHeading = angle + (Math.random() - 0.5) * 0.4;
      }
    });

    const pad = 40;
    if (b.x < pad) b.vx += 0.18;
    if (b.x > this.width - pad) b.vx -= 0.18;
    if (b.y < pad) b.vy += 0.18;
    if (b.y > this.height - pad) b.vy -= 0.18;

    b.x += b.vx;
    b.y += b.vy + Math.sin(b.flapPhase) * (b.isGliding ? 0.2 : 0.8);

    const moveHeading = Math.atan2(b.vy, b.vx);
    let delta = moveHeading - b.currentHeading;
    while (delta < -Math.PI) delta += Math.PI * 2;
    while (delta > Math.PI) delta -= Math.PI * 2;
    b.currentHeading += delta * 0.06;

    b.pollenTimer++;
    if (b.pollenTimer % 6 === 0 && Math.random() > 0.45) {
      this.spawnPollen(b.x, b.y);
    }
  }

  // Button Trigger: Converge & Blast
  triggerSurpriseTransition(callback) {
    if (this.state !== 'NATURAL_ROAM') return;
    this.state = 'CONVERGE_CORE';
    this.stateStartTime = performance.now();
    this.transitionCallback = callback;
  }

  spawnPollen(x, y, speed = 0.4) {
    this.goldenPollen.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * speed,
      vy: 0.1 + Math.random() * speed,
      radius: 1.0 + Math.random() * 2.0,
      color: '#ffd700',
      opacity: 0.85,
      life: 0,
      maxLife: 40 + Math.random() * 25
    });
  }

  updateAndDrawPollen() {
    const ctx = this.ctx;
    for (let i = this.goldenPollen.length - 1; i >= 0; i--) {
      const p = this.goldenPollen[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      const progress = p.life / p.maxLife;
      const alpha = Math.max(0, p.opacity * (1 - progress));

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 6;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1 - progress * 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (p.life >= p.maxLife) {
        this.goldenPollen.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // FIRECRACKER BLAST EXPLOSION (Sparklers, Glitter Crackles & Fireworks Rings)
  // =========================================================================
  createFirecrackerBlast(originX, originY) {
    this.firecrackerParticles = [];
    const count = 320; // 320+ high-energy firecracker sparklers

    // Firecracker colors: radiant gold, blazing amber, glittering white-hot sparks
    const sparkColors = ['#ffd700', '#ffea79', '#ffffff', '#ff9900', '#ff5500', '#ffeaa7'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // High initial velocity for explosive firework blast
      const speed = 3.5 + Math.random() * 22.0;
      const isSparkler = Math.random() > 0.4;

      this.firecrackerParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        friction: 0.94 + Math.random() * 0.03, // air friction
        gravity: 0.14 + Math.random() * 0.08,  // natural firework fall
        size: isSparkler ? (2.5 + Math.random() * 4.5) : (1.5 + Math.random() * 3.0),
        isSparkler: isSparkler,
        trail: [], // sparkler trail
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        opacity: 1.0,
        life: 0,
        maxLife: 65 + Math.random() * 40
      });
    }

    // 4 Glowing Firework Shockwave Rings
    for (let w = 0; w < 4; w++) {
      this.fireworkShockwaves.push({
        x: originX,
        y: originY,
        radius: 10 + w * 20,
        maxRadius: Math.max(this.width, this.height) * 0.85,
        opacity: 0.95,
        color: w % 2 === 0 ? '#ffd700' : '#ffffff',
        speed: 18 + w * 5
      });
    }

    // Trigger visual screen flash
    const flash = document.getElementById('blast-flash-overlay');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 220);
    }
  }

  updateAndDrawFirecrackerBlast() {
    const ctx = this.ctx;

    // 1. Shockwave rings
    for (let i = this.fireworkShockwaves.length - 1; i >= 0; i--) {
      const w = this.fireworkShockwaves[i];
      w.radius += w.speed;
      const progress = w.radius / w.maxRadius;
      w.opacity = Math.max(0, 0.95 * (1 - progress));

      ctx.save();
      ctx.globalAlpha = w.opacity;
      ctx.strokeStyle = w.color;
      ctx.shadowColor = w.color;
      ctx.shadowBlur = 25;
      ctx.lineWidth = 4.0 * (1 - progress);
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (w.radius >= w.maxRadius) {
        this.fireworkShockwaves.splice(i, 1);
      }
    }

    // 2. Firecracker sparkler particles
    for (let i = this.firecrackerParticles.length - 1; i >= 0; i--) {
      const p = this.firecrackerParticles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      const progress = p.life / p.maxLife;
      p.opacity = Math.max(0, 1.0 - progress);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;

      // Draw firework spark with velocity streak
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 2.5) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
        ctx.stroke();
      } else {
        // Crackling sparkling bead
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (p.life >= p.maxLife) {
        this.firecrackerParticles.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // NEON GOLD BUTTERFLY WITH CRISP BLACK OUTLINE & VEINS
  // =========================================================================
  drawGoldNeonButterfly(b) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.currentHeading + Math.PI / 2);
    ctx.scale(b.scale, b.scale);

    const flapVal = Math.cos(b.flapPhase);
    const absFlap = Math.max(0.12, Math.abs(flapVal));

    // Outer Neon Gold Aura Glow
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;

    // Left Wing (3D Folded with Black Outline)
    ctx.save();
    ctx.scale(-absFlap, 1);
    this.drawGoldWingHalf(ctx);
    ctx.restore();

    // Right Wing (3D Folded with Black Outline)
    ctx.save();
    ctx.scale(absFlap, 1);
    this.drawGoldWingHalf(ctx);
    ctx.restore();

    // Crisp Black Butterfly Body with Golden Antennae
    this.drawBlackGoldBody(ctx);

    ctx.restore();
  }

  // Single Wing Half: Radiant Neon Gold Fill + Bold Black Outline & Black Veins
  drawGoldWingHalf(ctx) {
    // 1. Forewing (Upper Wing)
    ctx.save();
    // Vibrant Neon Gold Gradient Fill
    const foreGrad = ctx.createRadialGradient(2, -2, 1, 14, -8, 26);
    foreGrad.addColorStop(0, '#ffffff'); // Intense white-hot diamond core
    foreGrad.addColorStop(0.2, '#fff176'); // Bright sunny gold
    foreGrad.addColorStop(0.55, '#ffd700'); // Radiant neon gold
    foreGrad.addColorStop(0.85, '#ffae19'); // Deep warm amber
    foreGrad.addColorStop(1, '#e67e22');

    ctx.fillStyle = foreGrad;
    // SOLID CRISP BLACK OUTLINE
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 1.6;

    // Scalloped forewing curve
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.bezierCurveTo(4, -14, 15, -22, 22, -16); // Arched top edge
    ctx.bezierCurveTo(21, -8, 18, -1, 16, 4);     // Scalloped margin
    ctx.bezierCurveTo(11, 4, 4, 2, 0, 0);        // Inner margin to body
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // Draw Black Outline

    // Fine Black Filigree Wing Veins
    ctx.strokeStyle = 'rgba(10, 10, 10, 0.85)';
    ctx.lineWidth = 0.75;
    const veins = [
      [[0, -1], [7, -7], [16, -14], [21, -15]],
      [[7, -7], [15, -8], [19, -8]],
      [[7, -7], [13, -3], [17, -2]],
      [[0, 0], [6, 0], [12, 1], [15, 3]]
    ];
    veins.forEach(v => {
      ctx.beginPath();
      ctx.moveTo(v[0][0], v[0][1]);
      for (let k = 1; k < v.length; k++) ctx.lineTo(v[k][0], v[k][1]);
      ctx.stroke();
    });

    // Decorative Black & Gold Edge Dots
    ctx.fillStyle = '#0a0a0a';
    [[20, -13], [18, -7], [17, -2], [15, 2]].forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 1.1, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 2. Hindwing (Lower Wing)
    ctx.save();
    const hindGrad = ctx.createRadialGradient(2, 3, 1, 9, 8, 20);
    hindGrad.addColorStop(0, '#ffffff');
    hindGrad.addColorStop(0.3, '#ffea79');
    hindGrad.addColorStop(0.7, '#ffd700');
    hindGrad.addColorStop(1, '#ff9900');

    ctx.fillStyle = hindGrad;
    // SOLID CRISP BLACK OUTLINE
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.bezierCurveTo(5, 3, 13, 4, 15, 10);
    ctx.bezierCurveTo(15, 16, 11, 21, 7, 21);
    ctx.bezierCurveTo(3, 21, 1, 15, 0, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // Draw Black Outline

    // Hindwing Black Veins
    ctx.strokeStyle = 'rgba(10, 10, 10, 0.8)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(6, 6, 10, 14);
    ctx.moveTo(6, 6);
    ctx.lineTo(13, 8);
    ctx.stroke();

    // Black Eyespot with Gold Center
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(8, 13, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(8, 13, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Slender Jet Black Body with Neon Gold Antennae
  drawBlackGoldBody(ctx) {
    ctx.save();

    // Abdomen (Jet Black with Gold Rings)
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.ellipse(0, 3, 1.3, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gold Thorax Highlight
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, -2, 1.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black Head
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(0, -5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Black Antennae with Glowing Gold Pearl Tips
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-0.5, -5.5);
    ctx.quadraticCurveTo(-3, -10, -5, -14);
    ctx.moveTo(0.5, -5.5);
    ctx.quadraticCurveTo(3, -10, 5, -14);
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-5, -14, 1.1, 0, Math.PI * 2);
    ctx.arc(5, -14, 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Animation Loop
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const now = performance.now();
    const zones = this.getProtectedZones();

    this.updateAndDrawPollen();
    this.updateAndDrawFirecrackerBlast();

    if (this.state === 'NATURAL_ROAM') {
      for (let i = 0; i < this.butterflies.length; i++) {
        this.updateFlight(this.butterflies[i], zones);
        this.drawGoldNeonButterfly(this.butterflies[i]);
      }
    }
    // Phase 1: All Butterflies Converge Rapidly Inward (0.0s – 1.0s)
    else if (this.state === 'CONVERGE_CORE') {
      const elapsed = now - this.stateStartTime;
      const duration = 1000;
      const progress = Math.min(elapsed / duration, 1);

      const centerX = this.width / 2;
      const centerY = this.height / 2;

      this.butterflies.forEach((b) => {
        // Direct, high-energy acceleration into center
        const dx = centerX - b.x;
        const dy = centerY - b.y;
        b.x += dx * (0.08 + progress * 0.15);
        b.y += dy * (0.08 + progress * 0.15);
        b.currentHeading = Math.atan2(dy, dx);
        b.flapPhase += 0.45; // rapid flapping

        // Golden sparkler trails
        if (Math.random() > 0.3) {
          this.spawnPollen(b.x, b.y, 2.5);
        }

        this.drawGoldNeonButterfly(b);
      });

      // Draw charging golden energy core
      if (progress > 0.5) {
        this.ctx.save();
        const coreAlpha = (progress - 0.5) * 2;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = '#ffd700';
        this.ctx.shadowBlur = 35;
        this.ctx.globalAlpha = coreAlpha;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 8 + progress * 16, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      if (progress >= 1) {
        // TRIGGER THE FIRECRACKER BLAST!
        this.state = 'FIRECRACKER_BLAST';
        this.stateStartTime = now;
        this.createFirecrackerBlast(centerX, centerY);
        if (window.onFirecrackerBlast) window.onFirecrackerBlast();
      }
    }
    // Phase 2: Firecracker Blast & Dissolve to Next Page (1.0s – 2.8s)
    else if (this.state === 'FIRECRACKER_BLAST') {
      const elapsed = now - this.stateStartTime;
      const duration = 1600;
      const progress = Math.min(elapsed / duration, 1);

      const stage = document.getElementById('landing-stage');
      if (stage && progress > 0.45) {
        stage.classList.add('page-leaving');
      }

      if (progress >= 1 && this.transitionCallback) {
        const cb = this.transitionCallback;
        this.transitionCallback = null;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        window.removeEventListener('resize', this.resizeHandler);
        cb();
        return;
      }
    }

    this.animFrameId = requestAnimationFrame(() => this.animate());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.butterflySim = new GoldNeonButterflyEngine('butterfly-canvas', '.frame-main-poster');
});
