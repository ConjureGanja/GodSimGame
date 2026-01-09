// Game controls - Pause, Speed, Reset

export class Controls {
    constructor(gameLoop, onReset) {
        this.gameLoop = gameLoop;
        this.onReset = onReset;
        this.setupButtons();
    }

    setupButtons() {
        // Pause button
        const pauseBtn = document.getElementById('btn-pause');
        pauseBtn.onclick = () => {
            const isPaused = this.gameLoop.togglePause();
            pauseBtn.innerText = isPaused ? "RESUME" : "PAUSE";
            pauseBtn.classList.toggle('bg-green-600');
        };

        // Speed buttons (setup global functions for onclick handlers)
        window.setSpeed = (speed) => {
            this.gameLoop.setSpeed(speed);
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.replace('bg-blue-600', 'bg-transparent'));
            const btn = document.getElementById(`spd-${speed}`);
            if(btn) {
                btn.classList.add('bg-blue-600');
                btn.classList.remove('bg-transparent');
            }
        };

        // Reset button (setup global function for onclick handler)
        window.resetSim = () => {
            if(this.onReset) {
                this.onReset();
            }
        };
    }
}
