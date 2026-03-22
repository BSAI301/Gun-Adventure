import { WORLD_WIDTH, WORLD_HEIGHT } from './config.js';
import { keys } from './input.js';

export const player = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    w: 24,          // 角色碰撞盒宽度
    h: 24,          // 角色碰撞盒高度
    speed: 0.15,    
    frameIndex: 0,  // 当前动画帧索引
    lastFrameTime: 0,
    frameDelay: 100,// 帧切换间隔（毫秒，可根据需要调整）
    frameCount: 9,  // 总动画帧数（改为9帧）
    frameWidth: 561 / 9, // 单帧宽度（总宽度/帧数）
    frameHeight: 56      // 单帧高度（精灵图高度）
};

export let playerImage = new Image();
playerImage.src = 'src/assets/character1_walk.png'; // 确保路径正确

export function movePlayer(dt) {
    let dx = 0, dy = 0;
    let isMoving = false;

    if (keys['w'] || keys['arrowup']) { dy -= 1; isMoving = true; }
    if (keys['s'] || keys['arrowdown']) { dy += 1; isMoving = true; }
    if (keys['a'] || keys['arrowleft']) { dx -= 1; isMoving = true; }
    if (keys['d'] || keys['arrowright']) { dx += 1; isMoving = true; }

// 动画帧更新逻辑（适配9帧）
    if (isMoving) {
        if (Date.now() - player.lastFrameTime > player.frameDelay) {
            // 循环切换9帧（0-8）
            player.frameIndex = (player.frameIndex + 1) % player.frameCount;
            player.lastFrameTime = Date.now();
        }
    } else {
        // 停止移动时重置为第0帧
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