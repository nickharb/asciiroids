import p5 from 'p5';
import { Game } from './Game.js';

new p5(p => {
  let game;

  p.setup = () => {
    p.createCanvas(900, 650);
    p.textFont('Courier New');
    p.textSize(14);
    p.textAlign(p.CENTER, p.CENTER);
    game = new Game(p);
  };

  p.draw = () => {
    p.background(0);
    game.update(p.deltaTime);
    game.draw();
  };

  p.keyPressed = () => {
    game.onKeyPressed(p.keyCode);
    // prevent browser scroll on arrow/space
    if ([32, 37, 38, 39, 40].includes(p.keyCode)) return false;
  };
});
