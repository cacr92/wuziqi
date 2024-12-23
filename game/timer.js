export class Timer {
    constructor(game) {
        this.game = game;
        this.interval = null;
        this.startTime = 0;
        this.display = document.getElementById('timer');
    }

    start(timeLimit) {
        this.stop();
        this.startTime = Date.now();
        this.interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const remaining = timeLimit - elapsed;
            if (remaining <= 0) {
                alert(`${this.game.gameState.currentPlayer === 'black' ? '黑子' : '白子'} 超时！`);
                this.game.gameOver();
                return;
            }
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            this.display.textContent =
                `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stop() {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
} 