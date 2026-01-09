// Grid management and terrain generation

import { TILES } from '../config/constants.js';
import { GAME_CONFIG } from '../config/settings.js';

export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
    }

    generate() {
        this.tiles = [];
        for(let y=0; y<this.height; y++) {
            let row = [];
            for(let x=0; x<this.width; x++) {
                // Simple radial island generation
                let dx = x - this.width/2;
                let dy = y - this.height/2;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let noise = Math.sin(x/10) * Math.cos(y/10) + Math.random()*0.5;

                let t = TILES.DEEP_WATER;
                if(dist < 55 + noise*10) t = TILES.WATER;
                if(dist < 50 + noise*10) t = TILES.SAND;
                if(dist < 45 + noise*10) t = TILES.GRASS;
                if(dist < 35 + noise*10 && Math.random() > 0.3) t = TILES.FOREST;
                if(dist < 10 + noise*5) t = TILES.MOUNTAIN; // Central peak

                if(t === TILES.GRASS && Math.random() < 0.05) t = TILES.BERRY;

                row.push(t);
            }
            this.tiles.push(row);
        }
    }

    getTile(x, y) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        return this.tiles[Math.floor(y)][Math.floor(x)];
    }

    setTile(x, y, type) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        this.tiles[Math.floor(y)][Math.floor(x)] = type;
        return true;
    }

    // Get raw array for iteration
    get() {
        return this.tiles;
    }
}
