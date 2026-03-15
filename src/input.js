export const keys = {};
export const mouse = { screenX: 0, screenY: 0 };

export function initInput(canvas) {
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
        keys[key] = true;
    });
    window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.screenX = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouse.screenY = (e.clientY - rect.top) * (canvas.height / rect.height);
    });

    window.addEventListener('blur', () => {
        for (let k in keys) keys[k] = false;
    });
}