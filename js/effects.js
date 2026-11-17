// Petals, Confetti & Interactive Celebration Effects
class ParticleEffects {
  constructor() {
    this.canvas = document.getElementById('effects-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 45;
    this.colors = ['#ff8da1', '#ffc2d1', '#ffd166', '#a0c4ff', '#b9fbc0', '#f1c0e8'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const isFlowerPetal = Math.random() > 0.4;
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -20,
      radius: 4 + Math.random() * 8,
      speedY: 1 + Math.random() * 2,
      speedX: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      opacity: 0.6 + Math.random() * 0.4,
      isFlowerPetal: isFlowerPetal,
      swingAngle: Math.random() * Math.PI * 2,
      swingSpeed: 0.02 + Math.random() * 0.03
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.swingAngle += p.swingSpeed;
      p.x += p.speedX + Math.sin(p.swingAngle) * 0.7;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity;

      if (p.isFlowerPetal) {
        // Draw delicate sakura / rose petal shape
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.radius);
        this.ctx.quadraticCurveTo(p.radius * 0.9, -p.radius * 0.5, p.radius * 0.5, p.radius);
        this.ctx.quadraticCurveTo(0, p.radius * 0.7, -p.radius * 0.5, p.radius);
        this.ctx.quadraticCurveTo(-p.radius * 0.9, -p.radius * 0.5, 0, -p.radius);
        this.ctx.fill();
      } else {
        // Sparkle / Confetti rectangle
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.radius / 2, -p.radius / 2, p.radius, p.radius * 0.6);
      }

      this.ctx.restore();

      // Wrap around
      if (p.y > this.canvas.height + 20) {
        this.particles[i] = this.createParticle(false);
      }
    }

    requestAnimationFrame(() => this.animate());
  }

  // Trigger massive confetti explosion
  burstConfetti(originX, originY) {
    const burstCount = 60;
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      const confetti = {
        x: originX,
        y: originY,
        radius: 6 + Math.random() * 6,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 4,
        gravity: 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        opacity: 1,
        life: 0,
        maxLife: 100 + Math.random() * 50
      };

      const animateBurst = () => {
        confetti.x += confetti.speedX;
        confetti.y += confetti.speedY;
        confetti.speedY += confetti.gravity;
        confetti.rotation += confetti.rotationSpeed;
        confetti.life++;
        confetti.opacity = Math.max(0, 1 - (confetti.life / confetti.maxLife));

        this.ctx.save();
        this.ctx.translate(confetti.x, confetti.y);
        this.ctx.rotate(confetti.rotation);
        this.ctx.globalAlpha = confetti.opacity;
        this.ctx.fillStyle = confetti.color;
        this.ctx.fillRect(-confetti.radius / 2, -confetti.radius / 2, confetti.radius, confetti.radius * 0.6);
        this.ctx.restore();

        if (confetti.life < confetti.maxLife) {
          requestAnimationFrame(animateBurst);
        }
      };

      requestAnimationFrame(animateBurst);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.particleEffects = new ParticleEffects();
});
