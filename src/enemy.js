// enemy.js
// 敌人模块：管理敌人的生成、AI更新和存储

import { WORLD_WIDTH, WORLD_HEIGHT } from './config.js';
import { player } from './player.js';

export const enemies = [];

const ENEMY_SIZE = 20;          // 敌人宽高
const ENEMY_SPEED = 0.05;       // 移动速度（像素/毫秒）
const ENEMY_HEALTH = 1;         // 生命值

/**
 * 生成一个敌人（随机位置）
 */
export function spawnEnemy() {
    enemies.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        w: ENEMY_SIZE,
        h: ENEMY_SIZE,
        speed: ENEMY_SPEED,
        health: ENEMY_HEALTH,
        alive: true
    });
}

/**
 * 初始化生成指定数量的敌人
 * @param {number} count - 敌人数量
 */
export function initEnemies(count = 3) {
    for (let i = 0; i < count; i++) {
        spawnEnemy();
    }
}

/**
 * 更新所有敌人（简单AI：向玩家移动）
 * @param {number} dt - 两帧间隔时间（毫秒）
 */
export function updateEnemies(dt) {
    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 1) {
            enemy.x += (dx / len) * enemy.speed * dt;
            enemy.y += (dy / len) * enemy.speed * dt;
        }

        // 边界限制（防止跑出世界）
        enemy.x = Math.max(enemy.w / 2, Math.min(WORLD_WIDTH - enemy.w / 2, enemy.x));
        enemy.y = Math.max(enemy.h / 2, Math.min(WORLD_HEIGHT - enemy.h / 2, enemy.y));
    }
}