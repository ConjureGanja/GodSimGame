// Demon agent - hostile enemy that hunts humans

import { Agent } from './Agent.js';
import { TILES } from '../config/constants.js';

export class Demon extends Agent {
    constructor(x, y) {
        super(x, y, 'demon');
        this.hp = 200;
    }

    update(grid, agents, helpers, callbacks) {
        // helpers: { findNearest, dist }
        // callbacks: { spawnFloat }

        let prey = helpers.findNearest(this, agents, 'human', 20);
        if(prey) {
            let ang = Math.atan2(prey.y - this.y, prey.x - this.x);
            this.dx += Math.cos(ang) * 0.2;
            this.dy += Math.sin(ang) * 0.2;
            if(helpers.dist(this, prey) < 1) {
                prey.hunger = -10; // Kill
                prey.alive = false;
                this.hp += 10;
                callbacks.spawnFloat(prey.x, prey.y, "CRUNCH", "red");
            }
        } else {
            // Burn stuff while walking
            if(Math.random() < 0.1) {
                let tx = Math.floor(this.x), ty = Math.floor(this.y);
                if(grid[ty][tx] === TILES.FOREST || grid[ty][tx] === TILES.HOUSE) grid[ty][tx] = TILES.FIRE;
            }
            this.move(0.3, grid);
        }
        this.move(0.6, grid);
    }

    draw(ctx, tileSize) {
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(this.x*tileSize, this.y*tileSize, 4, 0, Math.PI*2);
        ctx.fill();
        // Horns
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(this.x*tileSize-3, this.y*tileSize-5, 2, 3);
        ctx.fillRect(this.x*tileSize+1, this.y*tileSize-5, 2, 3);
    }
}
