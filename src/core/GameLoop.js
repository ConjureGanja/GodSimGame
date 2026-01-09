// Main game loop and timing

export class GameLoop {
    constructor() {
        this.paused = false;
        this.speed = 1;
        this.tick = 0;
        this.running = false;
        this.updateCallback = null;
        this.drawCallback = null;
    }

    setCallbacks(updateCallback, drawCallback) {
        this.updateCallback = updateCallback;
        this.drawCallback = drawCallback;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    setPaused(paused) {
        this.paused = paused;
    }

    togglePause() {
        this.paused = !this.paused;
        return this.paused;
    }

    reset() {
        this.tick = 0;
    }

    start() {
        this.running = true;
        this._loop();
    }

    stop() {
        this.running = false;
    }

    _loop = () => {
        if(!this.running) return;

        if(!this.paused) {
            for(let i=0; i<this.speed; i++) {
                this.tick++;
                if(this.updateCallback) {
                    this.updateCallback(this.tick);
                }
            }
        }

        if(this.drawCallback) {
            this.drawCallback();
        }

        requestAnimationFrame(this._loop);
    }

    getTick() {
        return this.tick;
    }

    getYear() {
        return Math.floor(this.tick / 60);
    }
}
