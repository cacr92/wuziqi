<template>
  <div class="player-card" :class="{ active: isActive }">
    <div class="player-avatar" :class="{ 'ai-player': isAI }">
      <i :class="isAI ? 'fa-solid fa-robot' : 'fa-solid fa-user'"></i>
    </div>
    <div class="player-info">
      <h3 class="player-name">{{ name }}</h3>
      <div class="player-piece" :class="pieceColor">
        <span class="piece-indicator"></span>
        <span>{{ pieceColor === 'black' ? '黑子' : '白子' }}</span>
      </div>
    </div>
    <div v-if="isActive" class="turn-indicator">
      <div class="pulse-ring"></div>
      <span>思考中...</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    pieceColor: String,
    isActive: Boolean,
    isAI: Boolean
  }
}
</script>

<style scoped>
.player-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.player-card.active {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.player-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.ai-player {
  background: var(--secondary-color);
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.player-piece {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.piece-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid currentColor;
}

.black .piece-indicator {
  background: black;
  border-color: #333;
}

.white .piece-indicator {
  background: white;
  border-color: #ccc;
}

.turn-indicator {
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 0.875rem;
}

.pulse-ring {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(0.8);
    opacity: 1;
  }
}
</style> 