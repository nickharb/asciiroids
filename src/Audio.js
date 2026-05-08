import gameOverUrl   from './audio/game-over.wav';
import shipDeathUrl  from './audio/ship-death.wav';
import shipNewUrl    from './audio/ship-new.wav';
import thrust1Url    from './audio/thrust-1.wav';
import thrust2Url    from './audio/thrust-2.wav';
import thrust3Url    from './audio/thrust-3.wav';
import thrust4Url    from './audio/thrust-4.wav';
import laser1Url     from './audio/laser-1.wav';
import laser2Url     from './audio/laser-2.wav';
import laser3Url     from './audio/laser-3.wav';
import laser4Url     from './audio/laser-4.wav';
import boom1Url      from './audio/boom-1.wav';
import boom2Url      from './audio/boom-2.wav';
import boom3Url      from './audio/boom-3.wav';

const LASERS   = [laser1Url, laser2Url, laser3Url, laser4Url];
const BOOMS    = [boom1Url,  boom2Url,  boom3Url];
const THRUSTS  = [thrust1Url, thrust2Url, thrust3Url, thrust4Url];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeAudio(url, loop = false) {
  const a = new Audio(url);
  a.loop = loop;
  return a;
}

class AudioManager {
  constructor() {
    this._gameOverPlayed = false;

    this._gameOver  = makeAudio(gameOverUrl);
    this._shipDeath = makeAudio(shipDeathUrl);
    this._shipNew   = makeAudio(shipNewUrl);
    this._thrusts   = THRUSTS.map(u => makeAudio(u));
    this._lasers    = LASERS.map(u => makeAudio(u));
    this._booms     = BOOMS.map(u => makeAudio(u));
  }

  _play(audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  playGameOver() {
    if (this._gameOverPlayed) return;
    this._gameOverPlayed = true;
    this._play(this._gameOver);
  }

  playLaser()     { this._play(pick(this._lasers)); }
  playBoom()      { this._play(pick(this._booms)); }
  playShipDeath() { this._play(this._shipDeath); }
  playShipNew()   { this._play(this._shipNew); }

  playThrust() { this._play(pick(this._thrusts)); }

  resetForNewGame() {
    this._gameOverPlayed = false;
  }
}

export const audio = new AudioManager();
