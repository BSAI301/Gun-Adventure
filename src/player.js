import { WORLD_WIDTH, WORLD_HEIGHT } from './config.js';
import { keys } from './input.js';

export const player = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    w: 24,
    h: 24,
    speed: 0.15,
    frameIndex: 0,
    lastFrameTime: 0,
    frameDelay: 200,
    frameWidth: 16,
    frameHeight: 16
};

export let playerImage = new Image();
playerImage.src = 'assets/player_walk.png'; // 确保路径正确

export function movePlayer(dt) {
    let dx = 0, dy = 0;
    let isMoving = false;

    if (keys['w'] || keys['arrowup']) { dy -= 1; isMoving = true; }
    if (keys['s'] || keys['arrowdown']) { dy += 1; isMoving = true; }
    if (keys['a'] || keys['arrowleft']) { dx -= 1; isMoving = true; }
    if (keys['d'] || keys['arrowright']) { dx += 1; isMoving = true; }

    // 动画帧更新
    if (isMoving) {
        if (Date.now() - player.lastFrameTime > player.frameDelay) {
            player.frameIndex = (player.frameIndex + 1) % 4;
            player.lastFrameTime = Date.now();
        }
    } else {
        player.frameIndex = 0;
    }

    if (dx !== 0 || dy !== 0) {
        if (dx && dy) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }
        player.x = Math.max(player.w / 2, Math.min(WORLD_WIDTH - player.w / 2, player.x + dx * player.speed * dt));
        player.y = Math.max(player.h / 2, Math.min(WORLD_HEIGHT - player.h / 2, player.y + dy * player.speed * dt));
    }
}