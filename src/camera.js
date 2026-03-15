import { WORLD_WIDTH, WORLD_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT } from './config.js';

export const camera = { x: 0, y: 0 };

export function updateCamera(player) {
    camera.x = Math.max(0, Math.min(player.x - VIEW_WIDTH / 2, WORLD_WIDTH - VIEW_WIDTH));
    camera.y = Math.max(0, Math.min(player.y - VIEW_HEIGHT / 2, WORLD_HEIGHT - VIEW_HEIGHT));
}