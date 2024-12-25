<template>
  <div class="game-timer">
    <div 
      class="timer"
      :class="{ 
        'active': isActive,
        'warning': timeLeft <= 10
      }"
    >
      {{ formatTime(timeLeft) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import type { PlayerColor } from '../../types'

const props = defineProps<{
  currentPlayer: PlayerColor
  gameStarted: boolean
  gameOver: boolean
}>()

const emit = defineEmits<{
  (e: 'time-up'): void
}>()

const TIME_LIMIT = 30 // 30秒
const timeLeft = ref(TIME_LIMIT)
const timer = ref<NodeJS.Timeout | null>(null)

const isActive = computed(() => {
  return props.gameStarted && !props.gameOver
})

const formatTime = (seconds: number) => {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}

const startTimer = () => {
  if (timer.value) clearInterval(timer.value)
  timeLeft.value = TIME_LIMIT
  
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      if (timer.value) clearInterval(timer.value)
      emit('time-up')
    }
  }, 1000)
}

watch(
  () => props.currentPlayer,
  () => {
    if (isActive.value) {
      startTimer()
    }
  }
)

watch(
  () => props.gameStarted,
  (newVal) => {
    if (newVal) {
      startTimer()
    } else if (timer.value) {
      clearInterval(timer.value)
    }
  }
)

watch(
  () => props.gameOver,
  (newVal) => {
    if (newVal && timer.value) {
      clearInterval(timer.value)
    }
  }
)

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.game-timer {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.timer {
  font-size: 2rem;
  font-weight: bold;
  padding: 0.5rem 2rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  opacity: 0.5;
  transition: all 0.3s;
}

.timer.active {
  opacity: 1;
  color: var(--text-primary);
}

.timer.warning {
  color: var(--danger);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style> 