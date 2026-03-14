const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 玩家位置
let player = { x: 400, y: 300 };

// 移动状态
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function update() {
    // 根据按键更新玩家位置
    if (keys['w'] || keys['W'] || keys['ArrowUp']) player.y -= 3;
    if (keys['s'] || keys['S'] || keys['ArrowDown']) player.y += 3;
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) player.x -= 3;
    if (keys['d'] || keys['D'] || keys['ArrowRight']) player.x += 3;

    // 边界限制
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width) player.x = canvas.width;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height) player.y = canvas.height;
}

function draw() {
    // 清空画布
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 画玩家（一个白色方块）
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x - 10, player.y - 10, 20, 20);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();