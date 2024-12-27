<template>
  <div 
    class="player-card"
    :class="{
      'is-active': isActive,
      'is-winner': isWinner,
      'is-ai': isAI
    }"
  >
    <div class="player-avatar">
      <div class="piece" :class="pieceColor"></div>
      <div v-if="isAI" class="ai-badge">
        <i class="fas fa-robot"></i>
      </div>
    </div>

    <div class="player-info">
      <div class="player-name">
        {{ name }}
        <span v-if="isAI" class="difficulty">
          ({{ difficulty }})
        </span>
      </div>
      
      <div class="player-stats">
        <span class="stat">
          <i class="fas fa-trophy"></i>
          {{ stats.wins }}
        </span>
        <span class="stat">
          <i class="fas fa-times"></i>
          {{ stats.losses }}
        </span>
        <span class="stat">
          <i class="fas fa-clock"></i>
          {{ formatTime(timeLeft) }}
        </span>
      </div>

      <div v-if="isActive" class="thinking-indicator">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerColor, Difficulty } from '../../types'

const props = defineProps<{
  name: string
  pieceColor: PlayerColor
  isActive: boolean
  isAI?: boolean
  isWinner?: boolean
  difficulty?: Difficulty
  timeLeft?: number
  stats: {
    wins: number
    losses: number
  }
}>()

const formatTime = (seconds?: number) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.player-card {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 2px solid transparent;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.player-card.is-active {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.player-card.is-winner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primary);
  opacity: 0.1;
  animation: pulse 2s infinite;
}

.player-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
}

.piece {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 0.3s;
}

.piece.black {
  background: radial-gradient(circle at 30% 30%, #666, #000);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.piece.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ddd);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.ai-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: var(--shadow-sm);
}

.player-info {
  text-align: center;
}

.player-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.difficulty {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.player-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.thinking-indicator {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  animation: bounce 1.4s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.2; }
}

@media (max-width: 768px) {
  .player-card {
    padding: 1rem;
  }

  .player-avatar {
    width: 40px;
    height: 40px;
  }

  .player-stats {
    font-size: 0.8rem;
  }
}
</style> 