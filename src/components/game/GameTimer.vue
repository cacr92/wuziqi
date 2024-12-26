<template>
  <div class="timer-container" :class="{ warning: timeLeft <= 10 }">
    <div class="timer-icon">
      <i class="fas fa-hourglass-half"></i>
    </div>
    <div class="timer-display">
      {{ formatTime(timeLeft) }}
    </div>
    <div class="timer-progress">
      <div 
        class="progress-bar"
        :style="{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { PlayerColor } from '../../types'

const props = defineProps<{
  currentPlayer: PlayerColor
}>()

const emit = defineEmits<{
  (e: 'time-up', player: PlayerColor): void
}>()

const TIME_LIMIT = 30 // 30秒
const timeLeft = ref(TIME_LIMIT)
let timer: ReturnType<typeof setInterval> | null = null

const formatTime = (seconds: number) => {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}

const startTimer = () => {
  timeLeft.value = TIME_LIMIT
  if (timer) clearInterval(timer)
  
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      if (timer) clearInterval(timer)
      emit('time-up', props.currentPlayer)
    }
  }, 1000)
}

watch(() => props.currentPlayer, startTimer)

onMounted(startTimer)
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.timer-container {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.timer-container.warning {
  animation: shake 0.5s;
}

.timer-icon {
  color: var(--primary);
  font-size: 1.25rem;
  animation: rotate 2s linear infinite;
}

.timer-display {
  font-size: 1.25rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  z-index: 1;
}

.timer-progress {
  position: absolute;
  inset: 0;
  background: var(--bg-primary);
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  opacity: 0.1;
  transition: width 1s linear;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.warning .timer-icon,
.warning .timer-display {
  color: #DC3545;
}

.warning .progress-bar {
  background: #DC3545;
}
</style> 