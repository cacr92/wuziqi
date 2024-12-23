<template>
  <div class="player-card" :class="{ active: isActive }">
    <div class="player-piece" :class="pieceColor"></div>
    <div class="player-info">
      <div class="player-name">
        {{ name }}
        <i v-if="isAi" class="fa-solid fa-robot"></i>
      </div>
      <div class="player-status" v-if="isActive && !isThinking">
        轮到你了
      </div>
      <div class="player-status thinking" v-if="isActive && isThinking">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        思考中...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    pieceColor: String,
    isActive: Boolean,
    isAi: Boolean,
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
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.player-card.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--primary-color);
}

.player-piece {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.player-piece.black {
  background: black;
}

.player-piece.white {
  background: white;
  border: 2px solid #ddd;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-status {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
}

.thinking {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style> 