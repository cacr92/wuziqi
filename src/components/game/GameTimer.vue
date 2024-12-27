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

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  currentPlayer: 'black' | 'white'
  gameStarted: boolean
}>()

const emit = defineEmits<{
  (e: 'time-up', player: 'black' | 'white'): void
}>()

const blackTime = ref(600) // 10分钟
const whiteTime = ref(600)
let timer: number | null = null

const startTimer = () => {
  timer = window.setInterval(() => {
    if (props.gameStarted) {
      if (props.currentPlayer === 'black') {
        blackTime.value--
        if (blackTime.value <= 0) {
          emit('time-up', 'black')
        }
      } else {
        whiteTime.value--
        if (whiteTime.value <= 0) {
          emit('time-up', 'white')
        }
      }
    }
  }, 1000)
}

const formatTime = (seconds: number) => {
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
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
}

.label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.time {
  font-size: 1.2rem;
  font-weight: bold;
  font-family: monospace;
}

.timer.black .time {
  color: var(--piece-black);
}

.timer.white .time {
  color: var(--piece-white);
}
</style> 