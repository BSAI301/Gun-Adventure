const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// 常量配置
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;
const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;
const MAP_SIZE = { w: 80, h: 60, x: 10, y: 10 };

// 玩家配置：新增动画相关属性
let player = { 
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    w: 24,          // 玩家渲染尺寸（放大后）
    h: 24,
    speed: 0.15,
    frameIndex: 0,  // 当前动画帧索引（0-3）
    lastFrameTime: 0, // 上一次切换帧的时间
    frameDelay: 200,  // 每帧停留200ms（控制动画速度）
    frameWidth: 16,   // 单帧原始尺寸（素材单帧16×16）
    frameHeight: 16
};

let solids = [];
const keys = {};
const camera = { x: 0, y: 0 };
const mouse = { screenX: 0, screenY: 0 };

// 资源加载：像素玩家图
let playerImage = new Image();
playerImage.src = 'assets/player_walk.png'; // 改为你的素材文件名

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
    let isMoving = false; // 新增：标记是否在移动（控制动画播放）
    if (keys['w'] || keys['arrowup']) { dy -= 1; isMoving = true; }
    if (keys['s'] || keys['arrowdown']) { dy += 1; isMoving = true; }
    if (keys['a'] || keys['arrowleft']) { dx -= 1; isMoving = true; }
    if (keys['d'] || keys['arrowright']) { dx += 1; isMoving = true; }
    
    // 新增：只有移动时才切换动画帧
    if (isMoving) {
        if (Date.now() - player.lastFrameTime > player.frameDelay) {
            player.frameIndex = (player.frameIndex + 1) % 4; // 4帧循环
            player.lastFrameTime = Date.now();
        }
    } else {
        player.frameIndex = 0; // 停止移动时回到第0帧
    }
    
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
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    // 1. 背景全黑
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));
    // 2. 简易边界
    ctx.strokeStyle = '#333';
    ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 3. 绘制玩家：替换为从Sprite Sheet截取当前帧
    if (playerImage.complete && playerImage.naturalWidth > 0) {
        // 计算当前帧在Sprite Sheet中的位置（横向排列）
        const sx = player.frameIndex * player.frameWidth; // 帧的x坐标（0/16/32/48）
        const sy = 0; // 帧的y坐标（只有1行）
        
        // 绘制：截取当前帧并放大到player.w/player.h尺寸
        ctx.drawImage(
            playerImage, 
            sx, sy,                          // 截取Sprite Sheet的起始坐标
            player.frameWidth, player.frameHeight, // 截取的单帧尺寸
            player.x - player.w/2,           // 画布上的x位置（居中）
            player.y - player.h/2,           // 画布上的y位置（居中）
            player.w, player.h               // 渲染尺寸（放大后）
        );
    } else {
        // 图片加载失败时的占位方块
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