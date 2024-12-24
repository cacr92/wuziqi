<template>
  <div class="game-timer">
    <div class="timer black">
      <span class="label">黑方时间</span>
      <span class="time">{{ formatTime(blackTime) }}</span>
    </div>
    <div class="timer white">
      <span class="label">白方时间</span>
      <span class="time">{{ formatTime(whiteTime) }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'

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
  
  setup(props, { emit }) {
    const blackTime = ref(600) // 10分钟
    const whiteTime = ref(600)
    let timer = null
    
    const startTimer = () => {
      timer = setInterval(() => {
        if (props.gameStarted && !props.gameOver) {
          if (props.currentPlayer === 'black') {
            blackTime.value--
            if (blackTime.value <= 0) {
              emit('timeUp', 'black')
            }
          } else {
            whiteTime.value--
            if (whiteTime.value <= 0) {
              emit('timeUp', 'white')
            }
          }
        }
      }, 1000)
    }
    
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    
    onMounted(() => {
      startTimer()
    })
    
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })
    
    return {
      blackTime,
      whiteTime,
      formatTime
    }
  }
}
</script>

<style scoped>
.game-timer {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.time {
  font-size: 1.2rem;
  font-weight: bold;
}

.timer.black .time {
  color: #000;
}

.timer.white .time {
  color: #fff;
}
</style> 