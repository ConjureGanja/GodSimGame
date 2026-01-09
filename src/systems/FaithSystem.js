// Faith and Karma management

import { TILES } from '../config/constants.js';
import { GAME_CONFIG } from '../config/settings.js';
import { PathfindingSystem } from './PathfindingSystem.js';

export class FaithSystem {
    constructor() {
        this.faith = 0;
        this.karma = 0;
    }

    generateFaith(grid, agents, particleSystem) {
        const tiles = grid.get();
        const flatGrid = tiles.flat();

        // Count monuments
        let temples = 0;
        let shrines = 0;
        for (let i = 0; i < flatGrid.length; i++) {
            const t = flatGrid[i];
            if (t === TILES.TEMPLE) temples++;
            else if (t === TILES.SHRINE) shrines++;
        }

        this.faith += temples * GAME_CONFIG.FAITH_PER_TEMPLE_TICK;
        this.faith += shrines * GAME_CONFIG.FAITH_PER_SHRINE_TICK;

        // Prayer bonus: humans near temples generate faith
        agents.forEach(a => {
            if(a.type === 'human' && a.alive) {
                let nearTemple = PathfindingSystem.findNearestTile(a, grid, [TILES.TEMPLE], 8);
                if(nearTemple && Math.random() < 0.01) {
                    this.faith += GAME_CONFIG.FAITH_PRAYER_BONUS;
                    particleSystem.spawnPrayerParticle(a.x, a.y);
                }
            }
        });

        // Faith decay if too high (prevents infinite hoarding)
        if(this.faith > GAME_CONFIG.FAITH_DECAY_THRESHOLD) {
            this.faith -= GAME_CONFIG.FAITH_DECAY_RATE;
        }

        // Clamp faith between 0-100
        this.faith = Math.max(0, Math.min(GAME_CONFIG.FAITH_MAX, this.faith));
    }

    adjustKarma(amount) {
        this.karma += amount;
        this.karma = Math.max(-100, Math.min(100, this.karma)); // Clamp -100 to +100
    }

    getKarmaColor() {
        if(this.karma > 30) return '#fbbf24'; // Gold for good
        if(this.karma < -30) return '#dc2626'; // Red for evil
        return '#94a3b8'; // Grey for neutral
    }

    getFaith() {
        return this.faith;
    }

    getKarma() {
        return this.karma;
    }

    reset() {
        this.faith = 0;
        this.karma = 0;
    }
}
