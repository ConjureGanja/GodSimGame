// Tile updates (farming, fire spread, regrowth)

import { TILES } from '../config/constants.js';
import { GAME_CONFIG } from '../config/settings.js';
import { PathfindingSystem } from './PathfindingSystem.js';

export class TileSystem {
    static updateTiles(grid, updateCount = GAME_CONFIG.RANDOM_TILE_UPDATES_PER_TICK) {
        const tiles = grid.get();

        for(let i=0; i<updateCount; i++) {
            let x = Math.floor(Math.random() * GAME_CONFIG.GRID_WIDTH);
            let y = Math.floor(Math.random() * GAME_CONFIG.GRID_HEIGHT);
            let t = tiles[y][x];

            // Farming
            if(t === TILES.FARM_SEEDED && Math.random() < 0.01) {
                tiles[y][x] = TILES.FARM_GROWING;
            }
            if(t === TILES.FARM_GROWING && Math.random() < 0.01) {
                tiles[y][x] = TILES.FARM_RIPE;
            }

            // Fire
            if(t === TILES.FIRE) {
                if(Math.random() < 0.1) {
                    tiles[y][x] = TILES.ASH;
                }
                // Spread
                let n = PathfindingSystem.getNeighbors(x, y);
                if(n) {
                    let nt = tiles[n.y][n.x];
                    if((nt === TILES.FOREST || nt === TILES.HOUSE) && Math.random() < 0.2) {
                        tiles[n.y][n.x] = TILES.FIRE;
                    }
                }
            }

            // Nature Regrowth
            if(t === TILES.ASH && Math.random() < 0.01) {
                tiles[y][x] = TILES.GRASS;
            }
            if(t === TILES.GRASS && Math.random() < 0.001) {
                tiles[y][x] = TILES.FOREST;
            }
            if(t === TILES.GRASS && Math.random() < 0.001) {
                tiles[y][x] = TILES.BERRY;
            }
        }
    }
}
