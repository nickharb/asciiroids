import { parseAsciiArt, wrapPos, CHAR_W, CHAR_H } from './utils.js';

const SHIP_ART = `  _
!/^\\!
/}={\\`;

// Local draw-space positions derived from SHIP_ART (maxW=5, 3 rows, CHAR_W=10, CHAR_H=14)
const NOSE_LX   = -5;  // col 2 → (2 − 2.5) × 10
const NOSE_LY   = -21; // row 0 → (0 − 1.5) × 14
const ENGINE_LX = -5;  // same column
const ENGINE_LY =  7;  // row 2 → (2 − 1.5) × 14

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
    // Transform art-local (lx, ly) → world using draw rotation (angle + π/2)
    const sa = Math.sin(this.angle), ca = Math.cos(this.angle);
    return {
      x: this.x - NOSE_LX * sa - NOSE_LY * ca,
      y: this.y + NOSE_LX * ca - NOSE_LY * sa,
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
      // Spawn from engine nozzle in world space (same transform as nose)
      const sa = Math.sin(this.angle), ca = Math.cos(this.angle);
      const ely = ENGINE_LY + 6; // slightly behind the engine row
      const spawnX = this.x - ENGINE_LX * sa - ely * ca;
      const spawnY = this.y + ENGINE_LX * ca - ely * sa;
      const back = this.angle + Math.PI;
      const spawnCount = 2 + Math.floor(Math.random() * 3);
      const CORE_CHARS  = ['|', '!', '*', '^'];
      const OUTER_CHARS = ['~', '.', "'", ',', ';'];
      for (let i = 0; i < spawnCount; i++) {
        const isCore = i === 0;
        const spread = (Math.random() - 0.5) * (isCore ? 0.3 : 1.1);
        const speed  = isCore ? 5 + Math.random() * 6 : 2 + Math.random() * 5;
        const chars  = isCore ? CORE_CHARS : OUTER_CHARS;
        const life   = isCore ? 120 + Math.random() * 120 : 160 + Math.random() * 180;
        this.thrustParticles.push({
          x: spawnX,
          y: spawnY,
          vx: Math.cos(back + spread) * speed,
          vy: Math.sin(back + spread) * speed,
          drag: 0.92,
          char: chars[Math.floor(Math.random() * chars.length)],
          life, maxLife: life,
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
    for (const tp of this.thrustParticles) {
      const d = Math.pow(tp.drag, dtN);
      tp.vx *= d;
      tp.vy *= d;
      tp.x += tp.vx * dtN;
      tp.y += tp.vy * dtN;
      tp.life -= dt;
    }
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
    for (const tp of this.thrustParticles) {
      const t = tp.life / tp.maxLife;
      // core chars flash white-hot; outer chars are plain orange
      const isBright = tp.char === '|' || tp.char === '!' || tp.char === '*' || tp.char === '^';
      if (isBright) {
        const g = Math.floor(176 + (255 - 176) * Math.min(1, t * 2));
        p.fill(255, g, 0, t * 240);
      } else {
        p.fill(255, 176, 0, t * 180);
      }
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
