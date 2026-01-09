// Base Agent class for all moving entities

import { TILES, SLOW_PASSABLE } from '../config/constants.js';
import { GAME_CONFIG } from '../config/settings.js';

export class Agent {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
        this.dx = 0;
        this.dy = 0;
        this.age = 0;
    }

    move(speedFactor, grid) {
        // Apply Velocity
        let nextX = this.x + this.dx * speedFactor;
        let nextY = this.y + this.dy * speedFactor;

        // Collision Detection
        if(this.canWalk(nextX, this.y, grid)) this.x = nextX;
        else this.dx *= -0.5; // Bounce/Slide

        if(this.canWalk(this.x, nextY, grid)) this.y = nextY;
        else this.dy *= -0.5;

        // Friction
        this.dx *= 0.9;
        this.dy *= 0.9;

        // Wandering
        if(Math.random() < 0.1) {
            this.dx += (Math.random()-0.5) * 0.2;
            this.dy += (Math.random()-0.5) * 0.2;
        }
    }

    canWalk(x, y, grid) {
        let tx = Math.floor(x);
        let ty = Math.floor(y);
        if(tx < 0 || tx >= GAME_CONFIG.GRID_WIDTH || ty < 0 || ty >= GAME_CONFIG.GRID_HEIGHT) return false;
        let t = grid[ty][tx];
        // Slow down in water
        if(SLOW_PASSABLE.includes(t)) return true; // Add drag logic elsewhere
        if(t === TILES.DEEP_WATER || t === TILES.MOUNTAIN) return false;
        return true;
    }
}
