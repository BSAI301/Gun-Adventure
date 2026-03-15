// bullet.js
// 子弹模块：管理子弹的生成、更新和存储

import { WORLD_WIDTH, WORLD_HEIGHT } from './config.js';

export const bullets = [];

const BULLET_SPEED = 0.3;      // 子弹移动速度（像素/毫秒）
const BULLET_SIZE = 4;          // 子弹宽高（正方形）
const BULLET_DAMAGE = 1;        // 子弹伤害值

/**
 * 生成一颗子弹
 * @param {number} x - 发射者x坐标（玩家x）
 * @param {number} y - 发射者y坐标（玩家y）
 * @param {number} targetX - 目标点x（鼠标世界坐标）
 * @param {number} targetY - 目标点y
 */
export function spawnBullet(x, y, targetX, targetY) {
    const dx = targetX - x;
    const dy = targetY - y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return; // 避免除零

    const vx = (dx / len) * BULLET_SPEED;
    const vy = (dy / len) * BULLET_SPEED;

    bullets.push({
        x, y,
        vx, vy,
        w: BULLET_SIZE,
        h: BULLET_SIZE,
        damage: BULLET_DAMAGE,
        active: true
    });
}

/**
 * 更新所有子弹的位置，移除超出边界的子弹
 * @param {number} dt - 两帧间隔时间（毫秒）
 */
export function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // 超出世界边界则移除
        if (b.x < 0 || b.x > WORLD_WIDTH || b.y < 0 || b.y > WORLD_HEIGHT) {
            bullets.splice(i, 1);
        }
    }
}