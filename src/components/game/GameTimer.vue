<template>
  <div class="game-timer">
    <div 
      class="timer-player"
      :class="{ active: currentPlayer === 'black' }"
    >
      <div class="piece black"></div>
      <div class="time">{{ formatTime(times.black) }}</div>
    </div>
    
    <div class="timer-divider"></div>
    
    <div 
      class="timer-player"
      :class="{ active: currentPlayer === 'white' }"
    >
      <div class="piece white"></div>
      <div class="time">{{ formatTime(times.white) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GameTimer',
  props: {
    currentPlayer: {
      type: String,
      required: true
    },
    gameStarted: {
      type: Boolean,
      default: false
    },
    gameOver: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      times: {
        black: 300,
        white: 300
      },
      timerId: null as number | null
    }
  },
  watch: {
    currentPlayer: {
      handler(newPlayer: string) {
        this.startTimer(newPlayer)
      },
      immediate: true
    },
    gameOver(isOver: boolean) {
      if (isOver) {
        this.stopTimer()
      }
    }
  },
  methods: {
    startTimer(player: string) {
      this.stopTimer()
      if (!this.gameStarted || this.gameOver) return

      this.timerId = window.setInterval(() => {
        this.times[player as 'black' | 'white']--
        if (this.times[player as 'black' | 'white'] <= 0) {
          this.stopTimer()
          this.$emit('timeUp', player)
        }
      }, 1000)
    },
    stopTimer() {
      if (this.timerId) {
        clearInterval(this.timerId)
        this.timerId = null
      }
    },
    formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  },
  beforeUnmount() {
    this.stopTimer()
  }
}
</script>

<style scoped>
.game-timer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 0.875rem;
}

.timer-player {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all var(--transition-speed);
}

.timer-player.active {
  background: rgba(0, 184, 148, 0.1);
  transform: scale(1.05);
}

.piece {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.piece.black {
  background: var(--piece-black);
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.piece.white {
  background: var(--piece-white);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.1);
}

.timer-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 0.5rem;
}

.time {
  font-size: 1rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  min-width: 45px;
  text-align: center;
}

@media (max-width: 992px) {
  .game-timer {
    margin-bottom: 0;
  }
}
</style> 