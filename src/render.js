// render.js
// 渲染模块：负责所有绘制操作

import { VIEW_WIDTH, VIEW_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT, MAP_SIZE } from './config.js';
import { camera } from './camera.js';
import { player, playerImage } from './player.js';
import { mouse } from './input.js';
import { bullets } from './bullet.js';   // 新增
import { enemies } from './enemy.js';    // 新增

let ctx;

export function initRenderer(canvasContext) {
    ctx = canvasContext;
    // 关闭抗锯齿，保持像素风格
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
}

export function draw() {
    // 清空画布（黑色背景）
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));

    // 绘制世界边界（灰色线框）
    ctx.strokeStyle = '#333';
    ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 绘制敌人（红色方块）
    ctx.fillStyle = '#e74c3c';
    for (let enemy of enemies) {
        if (enemy.alive) {
            // 敌人位置是中心点，绘制时减去宽高的一半
            ctx.fillRect(enemy.x - enemy.w / 2, enemy.y - enemy.h / 2, enemy.w, enemy.h);
        }
    }

    // 绘制子弹（黄色小方块）
    ctx.fillStyle = '#f1c40f';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x - bullet.w / 2, bullet.y - bullet.h / 2, bullet.w, bullet.h);
    }

    // 绘制玩家
    if (playerImage.complete && playerImage.naturalWidth > 0) {
        const sx = player.frameIndex * player.frameWidth;
        const sy = 0;
        ctx.drawImage(
            playerImage,
            sx, sy,
            player.frameWidth, player.frameHeight,
            player.x - player.w / 2,
            player.y - player.h / 2,
            player.w, player.h
        );
    } else {
        // 如果图片未加载，用蓝色方块代替
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
    }

    ctx.restore();

    // 绘制 UI（小地图和十字准心）
    drawUI();
}

function drawUI() {
    // 小地图背景
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(MAP_SIZE.x, MAP_SIZE.y, MAP_SIZE.w, MAP_SIZE.h);
    // 玩家在小地图上的点
    ctx.fillStyle = '#ffd966';
    const pmx = MAP_SIZE.x + (player.x / WORLD_WIDTH) * MAP_SIZE.w;
    const pmy = MAP_SIZE.y + (player.y / WORLD_HEIGHT) * MAP_SIZE.h;
    ctx.fillRect(pmx - 1, pmy - 1, 3, 3);

    // 十字准心（跟随鼠标）
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mouse.screenX - 5, mouse.screenY);
    ctx.lineTo(mouse.screenX + 5, mouse.screenY);
    ctx.moveTo(mouse.screenX, mouse.screenY - 5);
    ctx.lineTo(mouse.screenX, mouse.screenY + 5);
    ctx.stroke();
}