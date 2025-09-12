import './sass/main.scss';

import Game from './class/Game';
import { createTimer } from './utils/utils';

Game.checkStorage();

const miTimer = createTimer();
const miGame = new Game(miTimer);

// let gameLoop = () => {
//     requestAnimationFrame(gameLoop);
// }

// gameLoop();