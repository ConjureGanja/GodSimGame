// Spatial queries and pathfinding utilities

import { GAME_CONFIG } from '../config/settings.js';

export class PathfindingSystem {
    static dist(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    static findNearest(me, agents, type, range) {
        let close = null, min = range;
        for(let a of agents) {
            if(a.type === type && a !== me && a.alive) {
                let d = this.dist(me, a);
                if(d < min) { min = d; close = a; }
            }
        }
        return close;
    }

    static findNearestTile(me, grid, types, range) {
        const tiles = grid.get();
        let ix = Math.floor(me.x), iy = Math.floor(me.y);
        let r = Math.floor(range);
        let close = null, min = range;

        for(let y = iy-r; y <= iy+r; y++) {
            for(let x = ix-r; x <= ix+r; x++) {
                if(y<0 || y>=GAME_CONFIG.GRID_HEIGHT || x<0 || x>=GAME_CONFIG.GRID_WIDTH) continue;
                if(types.includes(tiles[y][x])) {
                    let d = Math.sqrt((x-me.x)**2 + (y-me.y)**2);
                    if(d < min) { min = d; close = {x:x+0.5, y:y+0.5}; }
                }
            }
        }
        return close;
    }

    static countTilesNear(me, grid, types, range) {
        const tiles = grid.get();
        let count = 0;
        let ix = Math.floor(me.x), iy = Math.floor(me.y);
        let r = Math.floor(range);
        for(let y = iy-r; y <= iy+r; y++) {
            for(let x = ix-r; x <= ix+r; x++) {
                if(y>=0 && y<GAME_CONFIG.GRID_HEIGHT && x>=0 && x<GAME_CONFIG.GRID_WIDTH && types.includes(tiles[y][x])) count++;
            }
        }
        return count;
    }

    static getNeighbors(x, y) {
        let dirs = [[0,1], [0,-1], [1,0], [-1,0]];
        let d = dirs[Math.floor(Math.random()*4)];
        let nx = x + d[0], ny = y + d[1];
        if(nx >= 0 && nx < GAME_CONFIG.GRID_WIDTH && ny >= 0 && ny < GAME_CONFIG.GRID_HEIGHT) return {x:nx, y:ny};
        return null;
    }
}
