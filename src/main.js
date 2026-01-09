// Main application entry point

import { GAME_CONFIG } from './config/settings.js';
import { Grid } from './core/Grid.js';
import { Renderer } from './core/Renderer.js';
import { GameLoop } from './core/GameLoop.js';
import { Human } from './agents/Human.js';
import { Demon } from './agents/Demon.js';
import { TileSystem } from './systems/TileSystem.js';
import { PathfindingSystem } from './systems/PathfindingSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { FaithSystem } from './systems/FaithSystem.js';
import { HUD } from './ui/HUD.js';
import { Toolbar } from './ui/Toolbar.js';
import { InputHandler } from './ui/InputHandler.js';
import { Controls } from './ui/Controls.js';

class OmniSimGame {
    constructor() {
        // Core systems
        this.grid = new Grid(GAME_CONFIG.GRID_WIDTH, GAME_CONFIG.GRID_HEIGHT);
        this.canvas = document.getElementById('sim-canvas');
        this.renderer = new Renderer(this.canvas);
        this.gameLoop = new GameLoop();

        // Game systems
        this.particleSystem = new ParticleSystem(this.canvas);
        this.faithSystem = new FaithSystem();

        // Game state
        this.agents = [];

        // UI
        this.hud = new HUD();
        this.toolbar = new Toolbar();
        window.gameToolbar = this.toolbar; // Make available globally for onclick handlers
        this.inputHandler = new InputHandler(this.canvas, this.toolbar);
        this.controls = new Controls(this.gameLoop, () => this.reset());

        // Bind methods
        this.gameLoop.setCallbacks(
            (tick) => this.update(tick),
            () => this.draw()
        );
    }

    init() {
        // Generate map
        this.grid.generate();

        // Initial spawn
        for(let i=0; i<GAME_CONFIG.INITIAL_HUMANS; i++) {
            this.spawnUnit(
                'human',
                GAME_CONFIG.GRID_WIDTH/2 + (Math.random()*10-5),
                GAME_CONFIG.GRID_HEIGHT/2 + (Math.random()*10-5)
            );
        }

        // Start game loop
        this.gameLoop.start();
    }

    update(tick) {
        // Faith & Karma Systems
        this.faithSystem.generateFaith(this.grid, this.agents, this.particleSystem);
        this.particleSystem.updatePrayerParticles();

        // Tile Updates
        TileSystem.updateTiles(this.grid);

        // Agents
        this.agents = this.agents.filter(a => a.alive);

        const helpers = {
            findNearest: PathfindingSystem.findNearest.bind(PathfindingSystem),
            findNearestTile: PathfindingSystem.findNearestTile.bind(PathfindingSystem),
            countTilesNear: PathfindingSystem.countTilesNear.bind(PathfindingSystem),
            dist: PathfindingSystem.dist.bind(PathfindingSystem)
        };

        const callbacks = {
            spawnFloat: (x, y, text, color) => this.particleSystem.spawnFloat(x, y, text, color),
            spawnUnit: (type, x, y) => this.spawnUnit(type, x, y),
            adjustKarma: (amount) => this.faithSystem.adjustKarma(amount)
        };

        this.agents.forEach(a => a.update(this.grid.get(), this.agents, helpers, callbacks));

        // Handle input
        if(this.inputHandler.isPressed()) {
            this.inputHandler.useTool(
                this.grid,
                this.agents,
                tick,
                this.faithSystem,
                this.particleSystem,
                (type, x, y) => this.spawnUnit(type, x, y)
            );
        }
    }

    draw() {
        this.renderer.draw(
            this.grid,
            this.agents,
            this.particleSystem.getPrayerParticles(),
            this.inputHandler.getMousePos(),
            this.faithSystem.getKarmaColor()
        );

        this.hud.update(
            this.agents,
            this.grid,
            this.gameLoop.getYear(),
            this.faithSystem.getFaith(),
            this.faithSystem.getKarma(),
            this.faithSystem.getKarmaColor()
        );
    }

    spawnUnit(type, x, y) {
        if(type === 'human') {
            this.agents.push(new Human(x, y, this.faithSystem.getKarma()));
        }
        if(type === 'demon') {
            this.agents.push(new Demon(x, y));
        }
    }

    reset() {
        this.agents = [];
        this.grid.generate();
        // Start with a strong colony
        for(let i=0; i<20; i++) {
            this.spawnUnit(
                'human',
                GAME_CONFIG.GRID_WIDTH/2 + (Math.random()*15-7.5),
                GAME_CONFIG.GRID_HEIGHT/2 + (Math.random()*15-7.5)
            );
        }
        this.gameLoop.reset();
        this.faithSystem.reset();
        this.particleSystem.reset();
    }
}

// Start the game when DOM is loaded
window.onload = () => {
    const game = new OmniSimGame();
    game.init();
};
