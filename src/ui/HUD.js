// HUD - Stats display and controls

import { TILES } from '../config/constants.js';

export class HUD {
    constructor() {
        this.popElement = document.getElementById('ui-pop');
        this.foodElement = document.getElementById('ui-food');
        this.housesElement = document.getElementById('ui-houses');
        this.monumentsElement = document.getElementById('ui-monuments');
        this.yearElement = document.getElementById('ui-year');
        this.faithElement = document.getElementById('ui-faith');
        this.karmaElement = document.getElementById('ui-karma');
    }

    update(agents, grid, year, faith, karma, karmaColor) {
        // Update population
        this.popElement.innerText = agents.filter(a => a.type === 'human').length;

        // Flatten grid once and count all relevant tile types in a single pass
        const flatGrid = grid.get().flat();
        let foodCount = 0;
        let houseCount = 0;
        let monumentCount = 0;

        for (let i = 0; i < flatGrid.length; i++) {
            const t = flatGrid[i];

            // Food tiles: berries and ripe farms
            if (t === TILES.BERRY || t === TILES.FARM_RIPE) {
                foodCount++;
            }

            // Houses
            if (t === TILES.HOUSE) {
                houseCount++;
            }

            // Monuments: temples, statues, and shrines
            if (t === TILES.TEMPLE || t === TILES.STATUE || t === TILES.SHRINE) {
                monumentCount++;
            }
        }

        this.foodElement.innerText = foodCount;
        this.housesElement.innerText = houseCount;
        this.monumentsElement.innerText = monumentCount;
        this.yearElement.innerText = year;

        // Faith display
        this.faithElement.innerText = Math.floor(faith);
        this.faithElement.style.color = faith > 50 ? '#fbbf24' : (faith > 20 ? '#84cc16' : '#94a3b8');

        // Karma display with dynamic color
        this.karmaElement.innerText = Math.floor(karma);
        this.karmaElement.style.color = karmaColor;
    }
}
