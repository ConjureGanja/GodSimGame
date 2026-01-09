// Particle and visual effects system

import { GAME_CONFIG } from '../config/settings.js';

export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.prayerParticles = [];
    }

    spawnPrayerParticle(x, y) {
        this.prayerParticles.push({
            x: x,
            y: y,
            life: 30,
            dy: -0.3
        });
    }

    updatePrayerParticles() {
        this.prayerParticles = this.prayerParticles.filter(p => p.life > 0);
        this.prayerParticles.forEach(p => {
            p.y += p.dy;
            p.life--;
        });
    }

    getPrayerParticles() {
        return this.prayerParticles;
    }

    spawnFloat(x, y, text, color) {
        const el = document.createElement('div');
        el.className = 'floater';
        el.style.left = (x * GAME_CONFIG.TILE_SIZE + this.canvas.getBoundingClientRect().left) + 'px';
        el.style.top = (y * GAME_CONFIG.TILE_SIZE + this.canvas.getBoundingClientRect().top) + 'px';
        el.style.color = color;
        el.innerText = text;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    reset() {
        this.prayerParticles = [];
    }
}
