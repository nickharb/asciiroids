export const CHAR_W = 10;
export const CHAR_H = 14;

export function parseAsciiArt(str, charW = CHAR_W, charH = CHAR_H) {
  const lines = str.split('\n').filter((_, i, arr) => {
    // remove leading/trailing empty lines
    const first = arr.findIndex(l => l.trim().length > 0);
    const last = arr.length - 1 - [...arr].reverse().findIndex(l => l.trim().length > 0);
    return i >= first && i <= last;
  });
  const maxW = Math.max(...lines.map(l => l.length));
  const glyphs = [];
  lines.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      if (char !== ' ') {
        glyphs.push({
          char,
          lx: (col - maxW / 2) * charW,
          ly: (row - lines.length / 2) * charH
        });
      }
    }
  });
  return glyphs;
}

export function circleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx, dy = ay - by;
  return dx * dx + dy * dy < (ar + br) * (ar + br);
}

export function wrapPos(x, y, w, h) {
  return {
    x: ((x % w) + w) % w,
    y: ((y % h) + h) % h
  };
}

export function randBetween(a, b) {
  return a + Math.random() * (b - a);
}
