// input.js
// 输入模块：处理键盘和鼠标输入

export const keys = {};
export const mouse = { screenX: 0, screenY: 0, leftPressed: false };

export function initInput(canvas) {
    // 键盘事件
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            e.preventDefault();
        }
        keys[key] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // 鼠标移动（屏幕坐标）
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.screenX = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouse.screenY = (e.clientY - rect.top) * (canvas.height / rect.height);
    });

    // 鼠标按下/抬起（左键）
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            mouse.leftPressed = true;
            e.preventDefault(); // 防止拖拽选中
        }
    });
    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            mouse.leftPressed = false;
        }
    });
    canvas.addEventListener('mouseleave', () => {
        mouse.leftPressed = false; // 鼠标离开画布视为松开
    });

    // 窗口失去焦点时重置所有按键
    window.addEventListener('blur', () => {
        for (let k in keys) keys[k] = false;
        mouse.leftPressed = false;
    });
}