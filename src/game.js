const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 400, y: 300 };
let bullets = [];
let lastShotTime = 0;
const shotCooldown = 200; // 毫秒

const keys = {};

window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

canvas.addEventListener('click', (e) => {
    // 冷却判断
    const now = Date.now();
    if (now - lastShotTime < shotCooldown) return;
    lastShotTime = now;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return;

    const speed = 5;
    const vx = (dx / length) * speed;
    const vy = (dy / length) * speed;

    bullets.push({ x: player.x, y: player.y, vx, vy });
});

function update() {
    if (keys['w'] || keys['W'] || keys['ArrowUp']) player.y -= 3;
    if (keys['s'] || keys['S'] || keys['ArrowDown']) player.y += 3;
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) player.x -= 3;
    if (keys['d'] || keys['D'] || keys['ArrowRight']) player.x += 3;

    player.x = Math.max(0, Math.min(canvas.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height, player.y));

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x - 10, player.y - 10, 20, 20);

    ctx.fillStyle = 'yellow';
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();