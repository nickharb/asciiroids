import { randBetween } from './utils.js';

const BURST_CHARS  = ['*', '#', '@', '!', 'X', '+', '&', '%'];
const DEBRIS_CHARS = ['.', ',', "'", '`', '~', '-', ';', ':'];

export class Explosion {
  constructor(x, y, count = 18) {
    this.particles = [];

    // Fast bright burst — radiate outward quickly, fade white→orange→transparent
    for (let i = 0; i < count; i++) {
      const angle = randBetween(0, Math.PI * 2);
      const speed = randBetween(8, 28);
      const life  = randBetween(250, 650);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        drag: 0.88,
        char: BURST_CHARS[Math.floor(Math.random() * BURST_CHARS.length)],
        life, maxLife: life,
        tier: 'burst',
      });
    }

    // Slow debris — linger and drift, plain orange fade
    const debris = Math.floor(count * 1.2);
    for (let i = 0; i < debris; i++) {
      const angle = randBetween(0, Math.PI * 2);
      const speed = randBetween(0.5, 5);
      const life  = randBetween(700, 1600);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        drag: 0.97,
        char: DEBRIS_CHARS[Math.floor(Math.random() * DEBRIS_CHARS.length)],
        life, maxLife: life,
        tier: 'debris',
      });
    }
  }

  get alive() {
    return this.particles.some(p => p.life > 0);
  }

  update(dt) {
    const dtN = dt / 16.67;
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      const d = Math.pow(p.drag, dtN);
      p.vx *= d;
      p.vy *= d;
      p.x += p.vx * dtN;
      p.y += p.vy * dtN;
      p.life -= dt;
    }
  }

  draw(p) {
    p.noStroke();
    for (const part of this.particles) {
      if (part.life <= 0) continue;
      const t = part.life / part.maxLife;
      if (part.tier === 'burst') {
        // white-hot at birth → orange → gone
        const g = Math.floor(176 + (255 - 176) * Math.min(1, t * 2.5));
        const b = Math.floor(255 * Math.min(1, t * 5));
        p.fill(255, g, b, t * 255);
      } else {
        p.fill(255, 176, 0, t * 210);
      }
      p.text(part.char, part.x, part.y);
    }
  }
}
