import { parseAsciiArt, wrapPos, randBetween, CHAR_W, CHAR_H } from './utils.js';

const ASTEROID_ART = {
  3: [
    `  /----\\
 /  /\\  \\
|  /  \\ |
|  \\  / |
 \\  \\/  /
  \\----/`,
    `  _----_
 /  /\\  \\
| /    \\ |
|  \\  /  |
 \\  \\/  /
  \\----/`,
    `  /\\  /\\
  \\  \\/  /
  |      |
  \\  /\\ /
  \\/  X
  /\\  /\\`
  ],
  2: [
    `  /--\\
 / /\\ \\
 \\ \\/ /
  \\--/`,
    `  /-\\
 /   \\
 \\   /
  \\_/`
  ],
  1: [
    ` /--\\
 \\--/`,
    ` /\\
 \\/`
  ]
};

const RADII = { 3: 32, 2: 18, 1: 10 };
const SPEEDS = { 3: 1.5, 2: 2.5, 1: 4 };

export class Asteroid {
  constructor(x, y, size, vx, vy, speedMult = 1) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = RADII[size];
    const arts = ASTEROID_ART[size];
    this.glyphs = parseAsciiArt(arts[Math.floor(Math.random() * arts.length)]);
    if (vx !== undefined && vy !== undefined) {
      this.vx = vx;
      this.vy = vy;
    } else {
      const angle = randBetween(0, Math.PI * 2);
      const speed = SPEEDS[size] * speedMult;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    }
    this.angle = 0;
    this.rotationSpeed = randBetween(-0.03, 0.03);
    // ensure non-zero rotation
    if (Math.abs(this.rotationSpeed) < 0.01) this.rotationSpeed = 0.02;
  }

  update(dt, canvasW, canvasH) {
    const dtN = dt / 16.67;
    this.x += this.vx * dtN;
    this.y += this.vy * dtN;
    this.angle += this.rotationSpeed * dtN;
    const wrapped = wrapPos(this.x, this.y, canvasW, canvasH);
    this.x = wrapped.x;
    this.y = wrapped.y;
  }

  split(speedMult = 1) {
    if (this.size <= 1) return [];
    const newSize = this.size - 1;
    const angleOff = randBetween(0.3, 0.9);
    const speed = SPEEDS[newSize] * speedMult;
    return [
      new Asteroid(this.x, this.y, newSize,
        Math.cos(this.angle + angleOff) * speed,
        Math.sin(this.angle + angleOff) * speed,
        speedMult
      ),
      new Asteroid(this.x, this.y, newSize,
        Math.cos(this.angle - angleOff) * speed,
        Math.sin(this.angle - angleOff) * speed,
        speedMult
      )
    ];
  }

  draw(p) {
    p.push();
    p.translate(this.x, this.y);
    p.rotate(this.angle);
    p.fill(255, 176, 0);
    p.noStroke();
    for (const { char, lx, ly } of this.glyphs) {
      p.text(char, lx, ly);
    }
    p.pop();
  }
}
