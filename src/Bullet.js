import { wrapPos, parseAsciiArt, CHAR_W, CHAR_H } from './utils.js';

const BULLET_SPEED = 11;
const BULLET_LIFETIME = 1200; // ms

export class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * BULLET_SPEED;
    this.vy = Math.sin(angle) * BULLET_SPEED;
    this.lifetime = BULLET_LIFETIME;
    this.radius = 4;
    this.glyphs = parseAsciiArt('*');
    this.angle = 0;
  }

  update(dt, canvasW, canvasH) {
    const dtN = dt / 16.67;
    this.x += this.vx * dtN;
    this.y += this.vy * dtN;
    this.lifetime -= dt;
    const wrapped = wrapPos(this.x, this.y, canvasW, canvasH);
    this.x = wrapped.x;
    this.y = wrapped.y;
  }

  get alive() {
    return this.lifetime > 0;
  }

  draw(p) {
    p.push();
    p.translate(this.x, this.y);
    p.fill(255, 176, 0);
    p.noStroke();
    p.text('*', 0, 0);
    p.pop();
  }
}
