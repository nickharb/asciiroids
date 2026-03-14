import { Ship } from './Ship.js';
import { Asteroid } from './Asteroid.js';
import { Bullet } from './Bullet.js';
import { Explosion } from './Explosion.js';
import { circleHit, randBetween } from './utils.js';

const STATES = { START: 'START', PLAYING: 'PLAYING', DEAD: 'DEAD', GAME_OVER: 'GAME_OVER' };
const POINTS = { 3: 20, 2: 50, 1: 100 };
const MAX_BULLETS = 4;
const RESPAWN_DELAY = 2000;
const WAVE_FLASH_DURATION = 2000;

export class Game {
  constructor(p) {
    this.p = p;
    this.W = p.width;
    this.H = p.height;
    this.state = STATES.START;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('asciiroids_hi') || '0');
    this.lives = 3;
    this.level = 1;
    this.ship = null;
    this.asteroids = [];
    this.bullets = [];
    this.explosions = [];
    this.keys = { left: false, right: false, thrust: false };
    this.respawnTimer = 0;
    this.waveFlash = 0;
    this.blinkTimer = 0;
    this.speedMult = 1;
  }

  startGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.speedMult = 1;
    this.bullets = [];
    this.explosions = [];
    this.ship = new Ship(this.W / 2, this.H / 2);
    this.ship.makeInvincible();
    this._spawnWave();
    this.state = STATES.PLAYING;
  }

  _spawnWave() {
    this.asteroids = [];
    const count = 2 + this.level;
    for (let i = 0; i < count; i++) {
      // spawn at edges, away from ship center
      let x, y;
      do {
        x = Math.random() * this.W;
        y = Math.random() * this.H;
      } while (Math.abs(x - this.W / 2) < 120 && Math.abs(y - this.H / 2) < 120);
      this.asteroids.push(new Asteroid(x, y, 3, undefined, undefined, this.speedMult));
    }
  }

  onKeyPressed(keyCode) {
    const p = this.p;
    if (this.state === STATES.START || this.state === STATES.GAME_OVER) {
      if (keyCode === p.ENTER) this.startGame();
      return;
    }
    if (this.state === STATES.PLAYING) {
      if (keyCode === 32) this._fireBullet(); // SPACE
    }
  }

  _fireBullet() {
    if (!this.ship) return;
    if (this.bullets.length >= MAX_BULLETS) return;
    const nose = this.ship.nose;
    this.bullets.push(new Bullet(nose.x, nose.y, this.ship.angle));
  }

  update(dt) {
    this.blinkTimer += dt;

    if (this.state === STATES.START || this.state === STATES.GAME_OVER) return;

    const p = this.p;
    // poll held keys
    this.keys.left = p.keyIsDown(p.LEFT_ARROW);
    this.keys.right = p.keyIsDown(p.RIGHT_ARROW);
    this.keys.thrust = p.keyIsDown(p.UP_ARROW);

    if (this.state === STATES.DEAD) {
      this.respawnTimer -= dt;
      this._updateNonShip(dt);
      if (this.respawnTimer <= 0) {
        this.ship = new Ship(this.W / 2, this.H / 2);
        this.ship.makeInvincible();
        this.state = STATES.PLAYING;
      }
      return;
    }

    if (this.state === STATES.PLAYING) {
      this.ship.update(dt, this.keys, this.W, this.H);
      this._updateNonShip(dt);
      this.checkCollisions();

      if (this.asteroids.length === 0) {
        this.level++;
        this.speedMult = 1 + (this.level - 1) * 0.12;
        this.waveFlash = WAVE_FLASH_DURATION;
        this._spawnWave();
      }
    }

    if (this.waveFlash > 0) this.waveFlash -= dt;
  }

  _updateNonShip(dt) {
    for (const a of this.asteroids) a.update(dt, this.W, this.H);
    this.bullets = this.bullets.filter(b => b.alive);
    for (const b of this.bullets) b.update(dt, this.W, this.H);
    this.explosions = this.explosions.filter(e => e.alive);
    for (const e of this.explosions) e.update(dt);
  }

  checkCollisions() {
    const newAsteroids = [];

    // bullets vs asteroids
    for (const b of this.bullets) {
      if (!b.alive) continue;
      for (let i = this.asteroids.length - 1; i >= 0; i--) {
        const a = this.asteroids[i];
        if (circleHit(b.x, b.y, b.radius, a.x, a.y, a.radius)) {
          b.lifetime = 0; // kill bullet
          this.score += POINTS[a.size];
          this.explosions.push(new Explosion(a.x, a.y, 12));
          const frags = a.split(this.speedMult);
          newAsteroids.push(...frags);
          this.asteroids.splice(i, 1);
          break;
        }
      }
    }

    this.asteroids.push(...newAsteroids);

    // ship vs asteroids
    if (!this.ship || this.ship.invincible) return;
    for (const a of this.asteroids) {
      if (circleHit(this.ship.x, this.ship.y, this.ship.radius, a.x, a.y, a.radius)) {
        this.explosions.push(new Explosion(this.ship.x, this.ship.y, 24));
        this.ship = null;
        this.lives--;
        if (this.lives <= 0) {
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('asciiroids_hi', this.highScore);
          }
          this.state = STATES.GAME_OVER;
        } else {
          this.state = STATES.DEAD;
          this.respawnTimer = RESPAWN_DELAY;
        }
        return;
      }
    }
  }

  draw() {
    const p = this.p;
    p.fill(255, 176, 0);
    p.noStroke();
    p.textFont('Courier New');
    p.textSize(14);
    p.textAlign(p.CENTER, p.CENTER);

    if (this.state === STATES.START) {
      this._drawStartScreen();
      return;
    }

    if (this.state === STATES.GAME_OVER) {
      this._drawGameOverScreen();
      return;
    }

    // draw entities
    for (const a of this.asteroids) a.draw(p);
    for (const b of this.bullets) b.draw(p);
    for (const e of this.explosions) e.draw(p);
    if (this.ship) this.ship.draw(p);

    // HUD
    this._drawHUD();

    // wave flash
    if (this.waveFlash > 0) {
      const alpha = Math.min(255, this.waveFlash / WAVE_FLASH_DURATION * 400);
      p.fill(255, 176, 0, alpha);
      p.textSize(20);
      p.text(`-- WAVE ${this.level} --`, this.W / 2, this.H / 2);
      p.textSize(14);
    }
  }

  _drawHUD() {
    const p = this.p;
    p.fill(255, 176, 0);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(14);
    p.text(`SCORE  ${this.score}`, 14, 14);
    p.textAlign(p.RIGHT, p.TOP);
    p.text(`LIVES  ${'I'.repeat(this.lives)}`, this.W - 14, 14);
    p.textAlign(p.CENTER, p.TOP);
    p.text(`WAVE ${this.level}`, this.W / 2, 14);
    p.textAlign(p.CENTER, p.CENTER);
  }

  _drawStartScreen() {
    const p = this.p;
    const title = [
      '    _    ____   ____ ___ ___ ____   ___ ___ ____  ____  ',
      '   / \\  / ___| / ___|_ _|_ _|  _ \\ / _ \\_ _|  _ \\/ ___|',
      '  / _ \\ \\___ \\| |    | | | || |_) | | | | || | | \\___ \\',
      ' / ___ \\ ___) | |___ | | | ||  _ <| |_| | || |_| |___) |',
      '/_/   \\_\\____/ \\____|___|___|_| \\_\\\\___/___|____/|____/ ',
    ];
    p.textSize(11);
    p.fill(255, 176, 0);
    let ty = this.H / 2 - 120;
    for (const line of title) {
      p.text(line, this.W / 2, ty);
      ty += 18;
    }
    p.textSize(14);
    p.text('ASCII ASTEROIDS', this.W / 2, ty + 10);

    p.textSize(13);
    p.text('ARROW KEYS: rotate / thrust', this.W / 2, ty + 50);
    p.text('SPACE: fire', this.W / 2, ty + 70);

    const blink = Math.floor(this.blinkTimer / 500) % 2 === 0;
    if (blink) {
      p.textSize(16);
      p.text('[ PRESS ENTER TO START ]', this.W / 2, ty + 110);
    }
    p.textSize(14);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(`HI  ${this.highScore}`, this.W / 2, this.H - 14);
    p.textAlign(p.CENTER, p.CENTER);
  }

  _drawGameOverScreen() {
    const p = this.p;
    p.textSize(36);
    p.fill(255, 176, 0);
    p.text('GAME OVER', this.W / 2, this.H / 2 - 60);
    p.textSize(18);
    p.text(`SCORE  ${this.score}`, this.W / 2, this.H / 2 - 10);
    p.text(`BEST   ${this.highScore}`, this.W / 2, this.H / 2 + 20);

    const blink = Math.floor(this.blinkTimer / 500) % 2 === 0;
    if (blink) {
      p.textSize(16);
      p.text('[ PRESS ENTER TO RESTART ]', this.W / 2, this.H / 2 + 70);
    }
    p.textSize(14);
  }
}
