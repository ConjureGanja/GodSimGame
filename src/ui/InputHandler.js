// Input handling - Mouse and keyboard

import { TILES } from '../config/constants.js';
import { GAME_CONFIG } from '../config/settings.js';
import { PathfindingSystem } from '../systems/PathfindingSystem.js';

export class InputHandler {
    constructor(canvas, toolbar) {
        this.canvas = canvas;
        this.toolbar = toolbar;
        this.isMouseDown = false;
        this.mousePos = { x: 0, y: 0 };
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            let rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = (e.clientX - rect.left) / GAME_CONFIG.TILE_SIZE;
            this.mousePos.y = (e.clientY - rect.top) / GAME_CONFIG.TILE_SIZE;
        });

        this.canvas.addEventListener('mousedown', () => {
            this.isMouseDown = true;
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
    }

    getMousePos() {
        return this.mousePos;
    }

    isPressed() {
        return this.isMouseDown;
    }

    useTool(grid, agents, tick, faithSystem, particleSystem, spawnUnit) {
        if(!this.isMouseDown) return;

        let x = Math.floor(this.mousePos.x);
        let y = Math.floor(this.mousePos.y);
        if(x < 0 || x >= GAME_CONFIG.GRID_WIDTH || y < 0 || y >= GAME_CONFIG.GRID_HEIGHT) return;

        const currentTool = this.toolbar.getCurrentTool();
        const tiles = grid.get();

        // Terrain tools (neutral karma)
        if(currentTool === 'forest') {
            tiles[y][x] = TILES.FOREST;
            faithSystem.adjustKarma(GAME_CONFIG.KARMA_PLANT_FOREST);
        }
        if(currentTool === 'water') tiles[y][x] = TILES.WATER;
        if(currentTool === 'land') tiles[y][x] = TILES.GRASS;
        if(currentTool === 'mountain') tiles[y][x] = TILES.MOUNTAIN;
        if(currentTool === 'berry') {
            tiles[y][x] = TILES.BERRY;
            faithSystem.adjustKarma(GAME_CONFIG.KARMA_PLANT_BERRY);
        }
        if(currentTool === 'fire') {
            tiles[y][x] = TILES.FIRE;
            faithSystem.adjustKarma(GAME_CONFIG.KARMA_FIRE);
        }

        // Single-click tools (rate limited)
        if(tick % 5 === 0) {
            if(currentTool === 'human') {
                spawnUnit('human', x, y);
                faithSystem.adjustKarma(GAME_CONFIG.KARMA_SPAWN_HUMAN);
            }
            if(currentTool === 'demon') {
                spawnUnit('demon', x, y);
                faithSystem.adjustKarma(GAME_CONFIG.KARMA_SPAWN_DEMON);
            }
            if(currentTool === 'meteor') {
                for(let dy=-2; dy<=2; dy++) for(let dx=-2; dx<=2; dx++) {
                    if(tiles[y+dy] && tiles[y+dy][x+dx] !== undefined) tiles[y+dy][x+dx] = TILES.ASH;
                }
                agents.forEach(a => { if(PathfindingSystem.dist({x,y}, a) < 3) a.alive = false; });
                faithSystem.adjustKarma(GAME_CONFIG.KARMA_METEOR);
            }
            if(currentTool === 'bless') {
                // Feed and Heal nearby humans
                agents.forEach(a => {
                    if(a.type === 'human' && PathfindingSystem.dist({x,y}, a) < 5) {
                        a.hunger = 100;
                        particleSystem.spawnFloat(a.x, a.y, "Blessed!", "cyan");
                    }
                });
                // Regrow plants
                for(let dy=-3; dy<=3; dy++) for(let dx=-3; dx<=3; dx++) {
                    let ty = y+dy, tx = x+dx;
                    if(tiles[ty] && tiles[ty][tx] === TILES.ASH) tiles[ty][tx] = TILES.GRASS;
                    if(tiles[ty] && tiles[ty][tx] === TILES.GRASS) tiles[ty][tx] = TILES.FOREST;
                }
                faithSystem.adjustKarma(GAME_CONFIG.KARMA_BLESS);
            }

            // --- DIVINE POWER TOOLS (Cost Faith) ---
            if(currentTool === 'massBless') {
                if(faithSystem.getFaith() >= GAME_CONFIG.MASS_BLESS_COST) {
                    // Mass blessing in large radius
                    agents.forEach(a => {
                        if(a.type === 'human' && PathfindingSystem.dist({x,y}, a) < 15) {
                            a.hunger = 100;
                            particleSystem.spawnFloat(a.x, a.y, "⚡Blessed!", "gold");
                        }
                    });
                    faithSystem.faith -= GAME_CONFIG.MASS_BLESS_COST;
                    faithSystem.adjustKarma(GAME_CONFIG.KARMA_MASS_BLESS);
                    particleSystem.spawnFloat(x, y, "DIVINE BLESSING!", "gold");
                } else {
                    particleSystem.spawnFloat(x, y, "Need 20 Faith!", "red");
                }
            }

            if(currentTool === 'divineGrowth') {
                if(faithSystem.getFaith() >= GAME_CONFIG.DIVINE_GROWTH_COST) {
                    // Instant growth in area
                    for(let dy=-5; dy<=5; dy++) for(let dx=-5; dx<=5; dx++) {
                        let ty = y+dy, tx = x+dx;
                        if(tiles[ty] && tiles[ty][tx] !== undefined) {
                            if(tiles[ty][tx] === TILES.GRASS) tiles[ty][tx] = TILES.FOREST;
                            if(tiles[ty][tx] === TILES.FARM_SEEDED) tiles[ty][tx] = TILES.FARM_RIPE;
                            if(tiles[ty][tx] === TILES.FARM_GROWING) tiles[ty][tx] = TILES.FARM_RIPE;
                            if(tiles[ty][tx] === TILES.ASH) tiles[ty][tx] = TILES.GRASS;
                        }
                    }
                    faithSystem.faith -= GAME_CONFIG.DIVINE_GROWTH_COST;
                    faithSystem.adjustKarma(GAME_CONFIG.KARMA_DIVINE_GROWTH);
                    particleSystem.spawnFloat(x, y, "DIVINE GROWTH!", "lime");
                } else {
                    particleSystem.spawnFloat(x, y, "Need 15 Faith!", "red");
                }
            }

            if(currentTool === 'holyFire') {
                if(faithSystem.getFaith() >= GAME_CONFIG.HOLY_PURGE_COST) {
                    // Purify area - remove fire and demons
                    for(let dy=-8; dy<=8; dy++) for(let dx=-8; dx<=8; dx++) {
                        let ty = y+dy, tx = x+dx;
                        if(tiles[ty] && tiles[ty][tx] === TILES.FIRE) tiles[ty][tx] = TILES.GRASS;
                    }
                    // Damage demons in area
                    agents.forEach(a => {
                        if(a.type === 'demon' && PathfindingSystem.dist({x,y}, a) < 8) {
                            a.hp -= 100;
                            if(a.hp <= 0) a.alive = false;
                            particleSystem.spawnFloat(a.x, a.y, "PURGED!", "cyan");
                        }
                    });
                    faithSystem.faith -= GAME_CONFIG.HOLY_PURGE_COST;
                    faithSystem.adjustKarma(GAME_CONFIG.KARMA_HOLY_PURGE);
                    particleSystem.spawnFloat(x, y, "HOLY PURGE!", "cyan");
                } else {
                    particleSystem.spawnFloat(x, y, "Need 25 Faith!", "red");
                }
            }
        }
    }
}
