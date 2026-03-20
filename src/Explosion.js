import { randBetween } from './utils.js';

const CHARS = ['*', '+', '.', ',', '~', '\'', '`'];

export class Explosion {
  constructor(x, y, count = 18) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const angle = randBetween(0, Math.PI * 2);
      const speed = randBetween(3, 15);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        life: randBetween(600, 1200),
        maxLife: 0,
      });
      this.particles[this.particles.length - 1].maxLife = this.particles[this.particles.length - 1].life;
    }
  }

  get alive() {
    return this.particles.some(p => p.life > 0);
  }

  update(dt) {
    const dtN = dt / 16.67;
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      p.x += p.vx * dtN;
      p.y += p.vy * dtN;
      p.life -= dt;
    }
  }

  draw(p) {
    p.noStroke();
    for (const part of this.particles) {
      if (part.life <= 0) continue;
      const alpha = (part.life / part.maxLife) * 255;
      p.fill(255, 176, 0, alpha);
      p.text(part.char, part.x, part.y);
    }
  }
}
