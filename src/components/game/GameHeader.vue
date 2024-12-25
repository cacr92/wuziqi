<template>
  <div class="game-header">
    <div class="game-info">
      <div class="mode-badge" :class="gameMode">
        <i :class="modeIcon"></i>
        <span>{{ modeText }}</span>
      </div>

      <div class="player-info" :class="{ active: !gameOver }">
        <div class="player-piece" :class="currentPlayer"></div>
        <span>{{ playerText }}</span>
      </div>
    </div>

    <div v-if="gameOver" class="game-result">
      <i :class="resultIcon"></i>
      <span>{{ resultText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerColor } from '../../types'

const props = defineProps<{
  currentPlayer: PlayerColor
  gameMode: 'pve' | 'online'
  gameOver: boolean
  winner: PlayerColor | null
}>()

const modeIcon = computed(() => ({
  'pve': 'fas fa-robot',
  'online': 'fas fa-globe'
}[props.gameMode]))

const modeText = computed(() => ({
  'pve': '人机对战',
  'online': '在线对战'
}[props.gameMode]))

const playerText = computed(() => 
  props.currentPlayer === 'black' ? '黑方回合' : '白方回合'
)

const resultIcon = computed(() => {
  if (!props.winner) return 'fas fa-handshake'
  return props.winner === 'black' ? 'fas fa-trophy' : 'fas fa-times'
})

const resultText = computed(() => {
  if (!props.winner) return '平局'
  return props.winner === 'black' ? '黑方胜利' : '白方胜利'
})
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.mode-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.mode-badge.pve {
  background: var(--primary-light);
  color: var(--primary);
}

.mode-badge.online {
  background: var(--info-light);
  color: var(--info);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  background: var(--bg-hover);
}

.player-info.active {
  animation: pulse 2s infinite;
}

.player-piece {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.player-piece.black {
  background: radial-gradient(circle at 30% 30%, #666, #000);
}

.player-piece.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ddd);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.game-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  background: var(--success-light);
  color: var(--success);
  animation: slideIn 0.5s ease;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

@keyframes slideIn {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
  }

  .game-info {
    width: 100%;
    justify-content: space-between;
  }
}
</style> 