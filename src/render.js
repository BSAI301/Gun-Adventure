import { VIEW_WIDTH, VIEW_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT, MAP_SIZE } from './config.js';
import { camera } from './camera.js';
import { player, playerImage } from './player.js';
import { mouse } from './input.js';

let ctx;

export function initRenderer(canvasContext) {
    ctx = canvasContext;
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
}

export function draw() {
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));

    // 世界边界
    ctx.strokeStyle = '#333';
    ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

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
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
    }

    ctx.restore();

    // 绘制 UI
    drawUI();
}

function drawUI() {
    // 小地图
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(MAP_SIZE.x, MAP_SIZE.y, MAP_SIZE.w, MAP_SIZE.h);
    ctx.fillStyle = '#ffd966';
    const pmx = MAP_SIZE.x + (player.x / WORLD_WIDTH) * MAP_SIZE.w;
    const pmy = MAP_SIZE.y + (player.y / WORLD_HEIGHT) * MAP_SIZE.h;
    ctx.fillRect(pmx - 1, pmy - 1, 3, 3);

    // 十字准心
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mouse.screenX - 5, mouse.screenY);
    ctx.lineTo(mouse.screenX + 5, mouse.screenY);
    ctx.moveTo(mouse.screenX, mouse.screenY - 5);
    ctx.lineTo(mouse.screenX, mouse.screenY + 5);
    ctx.stroke();
}