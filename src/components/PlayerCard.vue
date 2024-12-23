<template>
  <div class="player-card" :class="{ active: isActive }">
    <div class="player-info">
      <div class="player-piece" :class="pieceColor"></div>
      <div class="player-name">
        {{ name }}
        <span v-if="isAi" class="ai-badge">AI</span>
      </div>
    </div>
    <div v-if="isThinking" class="thinking-indicator">
      思考中...
      <i class="fa-solid fa-circle-notch fa-spin"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerCard',
  props: {
    name: {
      type: String,
      required: true
    },
    pieceColor: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isAi: {
      type: Boolean,
      default: false
    },
    isThinking: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.player-card {
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: all 0.3s;
}

.player-card.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
  border: 2px solid var(--primary-color);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-piece {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid var(--border-color);
}

.player-piece.black {
  background: black;
}

.player-piece.white {
  background: white;
}

.player-details {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 500;
}

.player-type {
  font-size: 0.875rem;
  color: var(--secondary-color);
}

.thinking-indicator {
  font-size: 0.9rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style> 