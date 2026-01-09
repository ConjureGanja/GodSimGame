// Canvas rendering system

import { TILES, COLORS } from '../config/constants.js';
import { GAME_CONFIG } from '../config/settings.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.tileSize = GAME_CONFIG.TILE_SIZE;
        this.width = GAME_CONFIG.GRID_WIDTH;
        this.height = GAME_CONFIG.GRID_HEIGHT;

        // Setup canvas size
        this.canvas.width = this.width * this.tileSize;
        this.canvas.height = this.height * this.tileSize;
    }

    clear() {
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid(grid) {
        const tiles = grid.get();
        for(let y=0; y<this.height; y++) {
            for(let x=0; x<this.width; x++) {
                let t = tiles[y][x];
                this.ctx.fillStyle = COLORS[t] || '#000';
                this.ctx.fillRect(x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);

                // Special rendering for monuments
                if(t === TILES.TEMPLE) {
                    // Add glow effect to temples
                    this.ctx.fillStyle = '#fef08a';
                    this.ctx.fillRect(
                        x * this.tileSize + this.tileSize * 0.25,
                        y * this.tileSize + this.tileSize * 0.125,
                        this.tileSize * 0.5,
                        this.tileSize * 0.375
                    );
                }
                if(t === TILES.STATUE) {
                    // Add shine to statues
                    this.ctx.fillStyle = '#f3f4f6';
                    this.ctx.fillRect(
                        x * this.tileSize + this.tileSize * 0.375,
                        y * this.tileSize + this.tileSize * 0.25,
                        this.tileSize * 0.25,
                        this.tileSize * 0.5
                    );
                }
                if(t === TILES.SHRINE) {
                    // Add glow to shrines
                    this.ctx.fillStyle = '#e9d5ff';
                    this.ctx.fillRect(
                        x * this.tileSize + this.tileSize * 0.375,
                        y * this.tileSize + this.tileSize * 0.375,
                        this.tileSize * 0.25,
                        this.tileSize * 0.25
                    );
                }
            }
        }
    }

    drawAgents(agents) {
        agents.forEach(a => a.draw(this.ctx, this.tileSize));
    }

    drawPrayerParticles(particles) {
        particles.forEach(p => {
            let alpha = p.life / 30;
            this.ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`; // Gold color
            this.ctx.beginPath();
            this.ctx.arc(p.x * this.tileSize, p.y * this.tileSize, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawCursor(mousePos, karmaColor) {
        let mx = Math.floor(mousePos.x);
        let my = Math.floor(mousePos.y);
        if(mx >=0 && mx < this.width && my >=0 && my < this.height) {
            // Karma aura (glow around cursor)
            this.ctx.strokeStyle = karmaColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(mx*this.tileSize, my*this.tileSize, this.tileSize, this.tileSize);

            // Outer glow (semi-transparent using globalAlpha)
            const previousAlpha = this.ctx.globalAlpha;
            this.ctx.globalAlpha = 0.25;
            this.ctx.strokeStyle = karmaColor;
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect((mx-0.5)*this.tileSize, (my-0.5)*this.tileSize, this.tileSize*2, this.tileSize*2);
            this.ctx.globalAlpha = previousAlpha;
            this.ctx.lineWidth = 1; // Reset
        }
    }

    draw(grid, agents, prayerParticles, mousePos, karmaColor) {
        this.clear();
        this.drawGrid(grid);
        this.drawAgents(agents);
        this.drawPrayerParticles(prayerParticles);
        this.drawCursor(mousePos, karmaColor);
    }
}
