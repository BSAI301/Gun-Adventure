import { VIEW_WIDTH, VIEW_HEIGHT } from './config.js';
import { initInput } from './input.js';
import { camera, updateCamera } from './camera.js';
import { player, movePlayer } from './player.js';
import { initWorld } from './world.js';
import { initRenderer, draw } from './render.js';

// 初始化 Canvas
const canvas = document.getElementById('gameCanvas');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;
const ctx = canvas.getContext('2d');

initInput(canvas);
initWorld();           // 目前为空，但保留
initRenderer(ctx);

// 游戏循环
let lastTime = 0;
function gameLoop(now) {
    const dt = now - lastTime;
    lastTime = now;
    movePlayer(dt || 0);
    updateCamera(player);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);