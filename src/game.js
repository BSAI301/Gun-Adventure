const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// 常量配置
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;
const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;
const MAP_SIZE = { w: 80, h: 60, x: 10, y: 10 };

// 玩家位置
let player = { 
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    w: 20,
    h: 20,
    speed: 0.18,
    solid: false
};
// 固体实体列表（墙壁、障碍物）
let solids = [];

// 装饰物（无碰撞）
let decorations = [];

// 输入状态
const keys = {};
const mouse = { x: 0, y: 0, left: false };

// 摄像机
const camera = { x: 0, y: 0 };

// 背景图片（如果加载失败则用纯色）
let floorImage = new Image();
floorImage.src = 'assets/dungeon_floor.png'; // 请确保图片存在

// ----- 输入处理 -----
window.addEventListener('keydown', e => {
    if (e.key.startsWith('Arrow') || 'wasd'.includes(e.key.toLowerCase())) e.preventDefault();
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.screenX = (e.clientX - rect.left) * scaleX;
    mouse.screenY = (e.clientY - rect.top) * scaleY;
});
canvas.addEventListener('mousedown', e => { e.preventDefault(); if (e.button === 0) mouse.left = true; });
canvas.addEventListener('mouseup', e => { if (e.button === 0) mouse.left = false; });
canvas.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('blur', () => { keys = {}; mouse.left = false; });

// ----- 碰撞检测（矩形）-----
function rectCollide(r1, r2) {
    return !(r2.x >= r1.x + r1.w || r2.x + r2.w <= r1.x ||
             r2.y >= r1.y + r1.h || r2.y + r2.h <= r1.y);
}

// ----- 玩家移动（带碰撞）-----
function movePlayer(dt) {
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;
    if (dx === 0 && dy === 0) return;

    // 归一化对角线
    if (dx && dy) {
        const len = Math.sqrt(dx*dx + dy*dy);
        dx /= len; dy /= len;
    }

    const moveX = dx * player.speed * dt;
    const moveY = dy * player.speed * dt;

    // X轴移动
    if (moveX) {
        let newX = player.x + moveX;
        newX = Math.max(player.w/2, Math.min(WORLD_WIDTH - player.w/2, newX));
        const newRect = { x: newX - player.w/2, y: player.y - player.h/2, w: player.w, h: player.h };
        for (let s of solids) {
            if (rectCollide(newRect, s)) {
                if (moveX > 0) newX = s.x - player.w/2 - 0.1;
                else newX = s.x + s.w + player.w/2 + 0.1;
                break;
            }
        }
        player.x = newX;
    }

    // Y轴移动
    if (moveY) {
        let newY = player.y + moveY;
        newY = Math.max(player.h/2, Math.min(WORLD_HEIGHT - player.h/2, newY));
        const newRect = { x: player.x - player.w/2, y: newY - player.h/2, w: player.w, h: player.h };
        for (let s of solids) {
            if (rectCollide(newRect, s)) {
                if (moveY > 0) newY = s.y - player.h/2 - 0.1;
                else newY = s.y + s.h + player.h/2 + 0.1;
                break;
            }
        }
        player.y = newY;
    }
}

// ----- 摄像机跟随玩家-----
function updateCamera() {
    camera.x = player.x - VIEW_WIDTH / 2;
    camera.y = player.y - VIEW_HEIGHT / 2;
}

// ----- 绘制世界-----
function drawWorld() {
    // 世界外区域为黑色
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    // 世界可见矩形
    const worldLeft = Math.max(0, camera.x);
    const worldRight = Math.min(WORLD_WIDTH, camera.x + VIEW_WIDTH);
    const worldTop = Math.max(0, camera.y);
    const worldBottom = Math.min(WORLD_HEIGHT, camera.y + VIEW_HEIGHT);
    if (worldLeft >= worldRight || worldTop >= worldBottom) return;

    const screenLeft = worldLeft - camera.x;
    const screenTop = worldTop - camera.y;
    const screenW = worldRight - worldLeft;
    const screenH = worldBottom - worldTop;

    // 裁剪到世界可见区域
    ctx.save();
    ctx.beginPath();
    ctx.rect(screenLeft, screenTop, screenW, screenH);
    ctx.clip();

    // 绘制背景（平铺图片或纯色）
    if (floorImage.complete && floorImage.naturalWidth > 0) {
        // 平铺纹理
        const pattern = ctx.createPattern(floorImage, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(screenLeft, screenTop, screenW, screenH);
    } else {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(screenLeft, screenTop, screenW, screenH);
    }

    // 绘制固体（墙壁）
    ctx.fillStyle = '#8b5e3c'; // 棕色
    solids.forEach(s => {
        const sx = s.x - camera.x;
        const sy = s.y - camera.y;
        ctx.fillRect(sx, sy, s.w, s.h);
    });

    // 绘制装饰物（骷髅、宝箱等）
    decorations.forEach(d => {
        const sx = d.x - camera.x;
        const sy = d.y - camera.y;
        ctx.fillStyle = d.color;
        ctx.fillRect(sx, sy, d.w, d.h);
    });

    // 绘制玩家
    const px = player.x - camera.x - player.w/2;
    const py = player.y - camera.y - player.h/2;
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(px, py, player.w, player.h);

    ctx.restore();
}

// ----- 绘制小地图-----
function drawMinimap() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(MAP_SIZE.x, MAP_SIZE.y, MAP_SIZE.w, MAP_SIZE.h);
    ctx.strokeStyle = '#aaa';
    ctx.strokeRect(MAP_SIZE.x, MAP_SIZE.y, MAP_SIZE.w, MAP_SIZE.h);

    // 固体
    ctx.fillStyle = '#8b5e3c';
    solids.forEach(s => {
        const mx = MAP_SIZE.x + (s.x / WORLD_WIDTH) * MAP_SIZE.w;
        const my = MAP_SIZE.y + (s.y / WORLD_HEIGHT) * MAP_SIZE.h;
        ctx.fillRect(mx - 2, my - 2, 4, 4);
    });

    // 玩家
    ctx.fillStyle = '#fff';
    const pmx = MAP_SIZE.x + (player.x / WORLD_WIDTH) * MAP_SIZE.w;
    const pmy = MAP_SIZE.y + (player.y / WORLD_HEIGHT) * MAP_SIZE.h;
    ctx.fillRect(pmx - 2, pmy - 2, 4, 4);
}

// ----- 初始化场景-----
function initScene() {
    // 四周墙壁
    for (let x = 0; x < WORLD_WIDTH; x += 32) {
        solids.push({ x: x, y: 0, w: 16, h: 16 });
        solids.push({ x: x, y: WORLD_HEIGHT - 16, w: 16, h: 16 });
    }
    for (let y = 16; y < WORLD_HEIGHT; y += 32) {
        solids.push({ x: 0, y: y, w: 16, h: 16 });
        solids.push({ x: WORLD_WIDTH - 16, y: y, w: 16, h: 16 });
    }

    // 内部障碍
    solids.push({ x: 200, y: 200, w: 16, h: 16 });
    solids.push({ x: 300, y: 200, w: 16, h: 16 });
    solids.push({ x: 400, y: 200, w: 16, h: 16 });
    solids.push({ x: 500, y: 200, w: 16, h: 16 });
    solids.push({ x: 600, y: 300, w: 16, h: 16 });
    solids.push({ x: 600, y: 400, w: 16, h: 16 });

    // 装饰
    decorations.push({ x: 250, y: 300, w: 14, h: 14, color: '#b08968' }); // 木桶
    decorations.push({ x: 350, y: 350, w: 14, h: 14, color: '#b08968' });
    decorations.push({ x: 450, y: 300, w: 16, h: 12, color: '#d4a373' }); // 宝箱
    decorations.push({ x: 550, y: 400, w: 14, h: 18, color: '#aaa' });    // 骷髅
    decorations.push({ x: 580, y: 420, w: 14, h: 18, color: '#aaa' });
}

// ----- 游戏循环-----
let lastTime = 0;
function gameLoop(now) {
    if (!lastTime) { lastTime = now; requestAnimationFrame(gameLoop); return; }
    const dt = Math.min(100, now - lastTime);
    lastTime = now;

    movePlayer(dt);
    updateCamera();
    drawWorld();
    drawMinimap();

    // 鼠标十字
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mouse.screenX - 8, mouse.screenY);
    ctx.lineTo(mouse.screenX - 3, mouse.screenY);
    ctx.moveTo(mouse.screenX + 3, mouse.screenY);
    ctx.lineTo(mouse.screenX + 8, mouse.screenY);
    ctx.moveTo(mouse.screenX, mouse.screenY - 8);
    ctx.lineTo(mouse.screenX, mouse.screenY - 3);
    ctx.moveTo(mouse.screenX, mouse.screenY + 3);
    ctx.lineTo(mouse.screenX, mouse.screenY + 8);
    ctx.stroke();

    // D20 文字
    ctx.fillStyle = '#ffd966';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('D20', VIEW_WIDTH - 40, 20);

    requestAnimationFrame(gameLoop);
}

initScene();