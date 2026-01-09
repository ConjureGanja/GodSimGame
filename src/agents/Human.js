// Human agent with complex AI behavior

import { Agent } from './Agent.js';
import { TILES } from '../config/constants.js';
import { GAME_CONFIG } from '../config/settings.js';

export class Human extends Agent {
    constructor(x, y, karma = 0) {
        super(x, y, 'human');
        this.hunger = 80;
        this.wood = 0;
        this.state = 'idle';
        this.lifeStage = 'adult'; // baby, adult, elder
        // Karma affects lifespan: Good gods grant longer life
        let karmaBonus = karma > 30 ? 1.2 : (karma < -30 ? 0.8 : 1.0);
        this.maxAge = (GAME_CONFIG.HUMAN_BASE_MAX_AGE + Math.random() * GAME_CONFIG.HUMAN_AGE_VARIANCE) * karmaBonus;
    }

    update(grid, agents, helpers, callbacks) {
        // helpers: { findNearest, findNearestTile, countTilesNear, dist }
        // callbacks: { spawnFloat, spawnUnit, adjustKarma }

        this.age++;

        // --- Life Cycle ---
        if(this.age < GAME_CONFIG.HUMAN_BABY_AGE) this.lifeStage = 'baby';
        else if (this.age > this.maxAge - GAME_CONFIG.HUMAN_ELDER_OFFSET) this.lifeStage = 'elder';
        else this.lifeStage = 'adult';

        if(this.age > this.maxAge) { this.alive = false; return; } // Die of old age

        // Hunger Logic
        let hungerRate = this.lifeStage === 'baby' ? GAME_CONFIG.BABY_HUNGER_RATE : GAME_CONFIG.ADULT_HUNGER_RATE;
        this.hunger -= hungerRate;
        if(this.hunger <= 0) {
            this.alive = false;
            callbacks.spawnFloat(this.x, this.y, "💀", "red");
            return;
        }

        // --- AI BEHAVIOR ---

        // 1. Flee (Top Priority)
        let enemy = helpers.findNearest(this, agents, 'demon', 10);
        if(enemy) {
            let ang = Math.atan2(this.y - enemy.y, this.x - enemy.x);
            this.dx += Math.cos(ang) * 0.5;
            this.dy += Math.sin(ang) * 0.5;
            this.move(1.0, grid);
            return;
        }

        // 2. Eat (If Hungry)
        if(this.hunger < 50) {
            // Search for food
            let food = helpers.findNearestTile(this, grid, [TILES.BERRY, TILES.FARM_RIPE], 30);
            if(food) {
                this.walkTo(food.x, food.y);
                if(helpers.dist(this, food) < 1) {
                    // Eat
                    this.hunger = 100;
                    if(grid[Math.floor(food.y)][Math.floor(food.x)] === TILES.BERRY) grid[Math.floor(food.y)][Math.floor(food.x)] = TILES.GRASS; // Consume berry
                    if(grid[Math.floor(food.y)][Math.floor(food.x)] === TILES.FARM_RIPE) grid[Math.floor(food.y)][Math.floor(food.x)] = TILES.FARM_SEEDED; // Reset farm
                    callbacks.spawnFloat(this.x, this.y, "yum", "lime");
                }
            } else {
                // Panic wander
                this.move(0.5, grid);
            }
            return;
        }

        // 3. Work (Adults Only)
        if(this.lifeStage === 'adult') {
            // Monument Building (Top Priority for civilization)
            // Cache population per human and refresh periodically to avoid
            // filtering all agents on every adult update.
            const POPULATION_CACHE_INTERVAL = 60; // ticks between refreshes for this human
            if (this._cachedPopulation === undefined ||
                this._cachedPopulationAge === undefined ||
                (this.age - this._cachedPopulationAge) >= POPULATION_CACHE_INTERVAL) {
                this._cachedPopulation = agents.filter(a => a.type === 'human' && a.alive).length;
                this._cachedPopulationAge = this.age;
            }
            let population = this._cachedPopulation;
            const flatGrid = grid.flat();
            let monumentCounts = flatGrid.reduce((acc, t) => {
                if (t === TILES.TEMPLE) acc.temples++;
                else if (t === TILES.SHRINE) acc.shrines++;
                else if (t === TILES.STATUE) acc.statues++;
                return acc;
            }, { temples: 0, shrines: 0, statues: 0 });
            let temples = monumentCounts.temples;
            let shrines = monumentCounts.shrines;
            let statues = monumentCounts.statues;

            // Build Temple: first at pop > 15 & wood > 40, later temples require more pop/wood and spacing
            if(population > 15 + temples * 5 && temples < 5 && this.wood > GAME_CONFIG.WOOD_PER_TEMPLE_BASE + temples * 10 && this.hunger > 60) {
                // Avoid clustering temples too closely together
                let nearTemple = helpers.findNearestTile(this, grid, [TILES.TEMPLE], 20);
                if(!nearTemple) {
                    let tx = Math.floor(this.x);
                    let ty = Math.floor(this.y);
                    if(grid[ty] && grid[ty][tx] === TILES.GRASS) {
                        grid[ty][tx] = TILES.TEMPLE;
                        this.wood -= GAME_CONFIG.WOOD_PER_TEMPLE_BASE + temples * 10;
                        callbacks.spawnFloat(this.x, this.y, "TEMPLE!", "gold");
                        callbacks.adjustKarma(GAME_CONFIG.KARMA_BUILD_TEMPLE); // Building temples is good
                        return;
                    }
                }
            }

            // Build Statue when pop > 35 and wood > 50
            if(population > 35 && statues < 2 && this.wood > GAME_CONFIG.WOOD_PER_STATUE && this.hunger > 70) {
                let nearStatue = helpers.findNearestTile(this, grid, [TILES.STATUE], 20);
                if(!nearStatue) {
                    let tx = Math.floor(this.x);
                    let ty = Math.floor(this.y);
                    if(grid[ty] && grid[ty][tx] === TILES.GRASS) {
                        grid[ty][tx] = TILES.STATUE;
                        this.wood -= GAME_CONFIG.WOOD_PER_STATUE;
                        callbacks.spawnFloat(this.x, this.y, "STATUE!", "silver");
                        callbacks.adjustKarma(GAME_CONFIG.KARMA_BUILD_STATUE);
                        return;
                    }
                }
            }

            // Build Shrine randomly (smaller monuments)
            if(shrines < 5 && this.wood > GAME_CONFIG.WOOD_PER_SHRINE && Math.random() < 0.001 && this.hunger > 50) {
                let nearShrine = helpers.findNearestTile(this, grid, [TILES.SHRINE], 15);
                if(!nearShrine) {
                    let tx = Math.floor(this.x);
                    let ty = Math.floor(this.y);
                    if(grid[ty] && grid[ty][tx] === TILES.GRASS) {
                        grid[ty][tx] = TILES.SHRINE;
                        this.wood -= GAME_CONFIG.WOOD_PER_SHRINE;
                        callbacks.spawnFloat(this.x, this.y, "Shrine", "purple");
                        callbacks.adjustKarma(GAME_CONFIG.KARMA_BUILD_SHRINE);
                        return;
                    }
                }
            }

            // Farming
            let farm = helpers.findNearestTile(this, grid, [TILES.FARM_SEEDED, TILES.FARM_GROWING], 10);
            if(!farm && Math.random() < 0.01 && this.wood > GAME_CONFIG.WOOD_PER_FARM) {
                // Build new farm if near house
                let house = helpers.findNearestTile(this, grid, [TILES.HOUSE], 10);
                if(house) {
                    let tx = Math.floor(this.x + (Math.random()*6-3));
                    let ty = Math.floor(this.y + (Math.random()*6-3));
                    if(grid[ty] && grid[ty][tx] === TILES.GRASS) {
                        grid[ty][tx] = TILES.FARM_SEEDED;
                        this.wood -= GAME_CONFIG.WOOD_PER_FARM;
                    }
                }
            }

            // Wood Gathering
            if(this.wood < 20) {
                let tree = helpers.findNearestTile(this, grid, [TILES.FOREST], 20);
                if(tree) {
                    this.walkTo(tree.x, tree.y);
                    if(helpers.dist(this, tree) < 1) {
                        if(Math.random() < 0.1) {
                            grid[Math.floor(tree.y)][Math.floor(tree.x)] = TILES.GRASS;
                            this.wood += 10;
                            callbacks.spawnFloat(this.x, this.y, "+wood", "brown");
                        }
                    }
                }
            }
            // Building Houses
            else {
                // Check density
                let nearbyHouses = helpers.countTilesNear(this, grid, [TILES.HOUSE, TILES.CASTLE], 15);

                if(nearbyHouses < 3) {
                    // Build here
                    let t = grid[Math.floor(this.y)][Math.floor(this.x)];
                    if(t === TILES.GRASS) {
                        grid[Math.floor(this.y)][Math.floor(this.x)] = TILES.HOUSE;
                        this.wood -= GAME_CONFIG.WOOD_PER_HOUSE;
                        callbacks.spawnFloat(this.x, this.y, "Build!", "gold");
                    } else {
                        this.move(0.2, grid); // Move to find spot
                    }
                } else {
                    // Too crowded, migrate outwards
                    let center = {x: GAME_CONFIG.GRID_WIDTH/2, y: GAME_CONFIG.GRID_HEIGHT/2};
                    let ang = Math.atan2(this.y - center.y, this.x - center.x);
                    this.dx += Math.cos(ang) * 0.1;
                    this.dy += Math.sin(ang) * 0.1;
                    this.move(0.5, grid);
                }
            }

            // Reproduction (If well fed, safe, and near house)
            // Statue bonus: increased reproduction rate
            let nearStatue = helpers.findNearestTile(this, grid, [TILES.STATUE], 10);
            let reproductionChance = nearStatue ? 0.01 : 0.005; // 2x near statues

            if(this.hunger > 80 && Math.random() < reproductionChance) {
                let house = helpers.findNearestTile(this, grid, [TILES.HOUSE, TILES.CASTLE, TILES.TEMPLE], 5);
                if(house) {
                    callbacks.spawnUnit('human', this.x, this.y);
                    this.hunger -= 20;
                    callbacks.spawnFloat(this.x, this.y, "Baby!", "pink");
                }
            }
        } else {
            // Babies/Elders just wander near houses
            let house = helpers.findNearestTile(this, grid, [TILES.HOUSE, TILES.CASTLE], 20);
            if(house) this.walkTo(house.x, house.y);
            else this.move(0.2, grid);
        }

        // Base move if no other action took place
        this.move(this.lifeStage === 'baby' ? 0.2 : 0.4, grid);
    }

    walkTo(tx, ty) {
        let ang = Math.atan2(ty - this.y, tx - this.x);
        this.dx += Math.cos(ang) * 0.1;
        this.dy += Math.sin(ang) * 0.1;
    }

    draw(ctx, tileSize) {
        let size = this.lifeStage === 'baby' ? 2 : (this.lifeStage === 'elder' ? 3 : 3.5);
        ctx.fillStyle = this.lifeStage === 'elder' ? '#94a3b8' : '#fca5a5';
        if(this.hunger < 30) ctx.fillStyle = '#ef4444'; // Starving

        ctx.beginPath();
        ctx.arc(this.x*tileSize, this.y*tileSize, size, 0, Math.PI*2);
        ctx.fill();

        // Job/Status Indicator
        if(this.lifeStage === 'adult') {
            ctx.fillStyle = this.wood > 0 ? '#78350f' : '#3b82f6'; // Brown=Builder, Blue=Idle
            ctx.fillRect(this.x*tileSize - 1, this.y*tileSize - 4, 2, 2);
        }
    }
}
