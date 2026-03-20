import { parseAsciiArt, wrapPos, CHAR_W, CHAR_H } from './utils.js';

const SHIP_ART = `  ^
 /|\\
/___\\`;

const ROT_SPEED = 0.04;
const THRUST = 0.22;
const MAX_SPEED = 8;
const INVINCIBLE_DURATION = 3000;
const BLINK_RATE = 150;

export class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2; // pointing up
    this.glyphs = parseAsciiArt(SHIP_ART);
    this.radius = 10;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.thrustParticles = [];
  }

  get nose() {
    return {
      x: this.x + Math.cos(this.angle) * this.radius,
      y: this.y + Math.sin(this.angle) * this.radius
    };
  }

  makeInvincible() {
    this.invincible = true;
    this.invincibleTimer = INVINCIBLE_DURATION;
  }

  update(dt, keys, canvasW, canvasH) {
    const dtN = dt / 16.67;

    if (keys.left) this.angle -= ROT_SPEED * dtN;
    if (keys.right) this.angle += ROT_SPEED * dtN;

    if (keys.thrust) {
      this.vx += Math.cos(this.angle) * THRUST * dtN;
      this.vy += Math.sin(this.angle) * THRUST * dtN;
      // spawn thrust particles
      if (Math.random() < 0.4) {
        const back = this.angle + Math.PI;
        const spread = (Math.random() - 0.5) * 0.6;
        this.thrustParticles.push({
          x: this.x + Math.cos(back) * 20,
          y: this.y + Math.sin(back) * 20,
          char: Math.random() < 0.5 ? '.' : "'",
          life: 180 + Math.random() * 120
        });
      }
    }

    // cap speed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > MAX_SPEED) {
      this.vx = (this.vx / speed) * MAX_SPEED;
      this.vy = (this.vy / speed) * MAX_SPEED;
    }

    this.x += this.vx * dtN;
    this.y += this.vy * dtN;

    const wrapped = wrapPos(this.x, this.y, canvasW, canvasH);
    this.x = wrapped.x;
    this.y = wrapped.y;

    // update invincibility
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        this.invincibleTimer = 0;
      }
    }

    // update thrust particles
    for (const p of this.thrustParticles) p.life -= dt;
    this.thrustParticles = this.thrustParticles.filter(p => p.life > 0);
  }

  draw(p) {
    // blink when invincible
    if (this.invincible) {
      const blink = Math.floor(this.invincibleTimer / BLINK_RATE) % 2 === 0;
      if (blink) return;
    }

    // draw thrust particles
    p.noStroke();
    p.fill(255, 176, 0, 180);
    for (const tp of this.thrustParticles) {
      const alpha = (tp.life / 300) * 180;
      p.fill(255, 176, 0, alpha);
      p.text(tp.char, tp.x, tp.y);
    }

    p.push();
    p.translate(this.x, this.y);
    p.rotate(this.angle + Math.PI / 2);
    p.fill(255, 176, 0);
    p.noStroke();
    for (const { char, lx, ly } of this.glyphs) {
      p.text(char, lx, ly);
    }
    p.pop();
  }
}
