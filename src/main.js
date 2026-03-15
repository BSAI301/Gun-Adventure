// main.js
// 游戏入口模块，包含主循环

import { VIEW_WIDTH, VIEW_HEIGHT } from './config.js';
import { initInput, mouse } from './input.js';
import { camera, updateCamera } from './camera.js';
import { player, movePlayer } from './player.js';
import { initWorld } from './world.js';
import { initRenderer, draw } from './render.js';

// 导入新增模块
import { bullets, spawnBullet, updateBullets } from './bullet.js';
import { enemies, initEnemies, updateEnemies } from './enemy.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;
const ctx = canvas.getContext('2d');

initInput(canvas);
initWorld();
initEnemies(5); // 生成5个敌人用于测试
initRenderer(ctx);

let lastTime = 0;
let lastLeftPressed = false; // 记录上一帧鼠标左键状态，用于检测按下瞬间

function gameLoop(now) {
    const dt = Math.min(100, now - lastTime); // 限制最大步长，防止卡顿时子弹飞得太远
    lastTime = now;

    // 玩家移动
    movePlayer(dt || 0);

    // 发射子弹：检测鼠标左键按下瞬间（单击发射）
    if (mouse.leftPressed && !lastLeftPressed) {
        // 将屏幕鼠标坐标转换为世界坐标（考虑摄像机偏移）
        const worldX = mouse.screenX + camera.x;
        const worldY = mouse.screenY + camera.y;
        spawnBullet(player.x, player.y, worldX, worldY);
    }
    lastLeftPressed = mouse.leftPressed;

    // 更新子弹和敌人
    updateBullets(dt);
    updateEnemies(dt);

    // 子弹-敌人碰撞检测
    handleBulletEnemyCollisions();

    // 摄像机跟随玩家
    updateCamera(player);

    // 渲染场景
    draw();

    requestAnimationFrame(gameLoop);
}

/**
 * 子弹与敌人的碰撞处理
 * 检测所有活跃子弹与存活敌人的碰撞，子弹消失，敌人扣血（若生命≤0则死亡）
 */
function handleBulletEnemyCollisions() {
    // 遍历子弹（从后往前，以便安全删除）
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        // 遍历敌人（从后往前）
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.alive) continue;

            // 矩形碰撞检测（轴对齐包围盒）
            if (bullet.x < enemy.x + enemy.w &&
                bullet.x + bullet.w > enemy.x &&
                bullet.y < enemy.y + enemy.h &&
                bullet.y + bullet.h > enemy.y) {
                // 碰撞：移除子弹
                bullets.splice(i, 1);
                // 敌人扣血
                enemy.health -= bullet.damage;
                if (enemy.health <= 0) {
                    enemy.alive = false;
                }
                break; // 子弹已消失，跳出内层循环
            }
        }
    }

    // 移除所有死亡的敌人
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (!enemies[i].alive) {
            enemies.splice(i, 1);
        }
    }
}

// 启动游戏循环
requestAnimationFrame(gameLoop);