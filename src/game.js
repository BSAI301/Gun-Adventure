const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// 常量配置
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;
const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;
const MAP_SIZE = { w: 80, h: 60, x: 10, y: 10 };

// 玩家配置
let player = { 
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    w: 24, 
    h: 24,
    speed: 0.15 
};

let solids = [];
const keys = {};
const camera = { x: 0, y: 0 };
const mouse = { screenX: 0, screenY: 0 };

// 资源加载：像素玩家图
let playerImage = new Image();
playerImage.src = 'assets/test-player.png'; 

// ----- 输入处理 -----
window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
    keys[key] = true;
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.screenX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.screenY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

// 防止常量赋值报错
window.addEventListener('blur', () => { 
    for (let k in keys) keys[k] = false; 
});

// ----- 核心逻辑 -----
function movePlayer(dt) {
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
        if (dx && dy) { const len = Math.sqrt(dx*dx + dy*dy); dx /= len; dy /= len; }
        player.x = Math.max(player.w/2, Math.min(WORLD_WIDTH - player.w/2, player.x + dx * player.speed * dt));
        player.y = Math.max(player.h/2, Math.min(WORLD_HEIGHT - player.h/2, player.y + dy * player.speed * dt));
    }
}

function updateCamera() {
    camera.x = Math.max(0, Math.min(player.x - VIEW_WIDTH / 2, WORLD_WIDTH - VIEW_WIDTH));
    camera.y = Math.max(0, Math.min(player.y - VIEW_HEIGHT / 2, WORLD_HEIGHT - VIEW_HEIGHT));
}

function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false; // 兼容旧版 Firefox
    ctx.webkitImageSmoothingEnabled = false; // 兼容旧版 Chrome/Safari
    // 1. 背景全黑
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));

    // 2. 简易边界
    ctx.strokeStyle = '#333';
    ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 3. 绘制玩家：如果图片加载好了画图片，否则画个蓝色方块占位
    if (playerImage.complete && playerImage.naturalWidth > 0) {
        // 画像素图片
        ctx.drawImage(
            playerImage, 
            player.x - player.w/2, 
            player.y - player.h/2, 
            player.w, 
            player.h
        );
    } else {
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(player.x - player.w/2, player.y - player.h/2, player.w, player.h);
    }

    ctx.restore();

    // 4. UI 绘制
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
    ctx.moveTo(mouse.screenX - 5, mouse.screenY); ctx.lineTo(mouse.screenX + 5, mouse.screenY);
    ctx.moveTo(mouse.screenX, mouse.screenY - 5); ctx.lineTo(mouse.screenX, mouse.screenY + 5);
    ctx.stroke();
}

let lastTime = 0;
function gameLoop(now) {
    const dt = now - lastTime;
    lastTime = now;
    movePlayer(dt || 0);
    updateCamera();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);