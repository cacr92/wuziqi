<template>
  <div class="player-card" :class="{ active: isActive }">
    <div class="player-avatar">
      <div class="piece" :class="pieceColor"></div>
      <i v-if="isAi" class="fas fa-robot ai-icon"></i>
    </div>
    <div class="player-info">
      <div class="player-name">{{ name }}</div>
      <div v-if="isActive" class="player-status">
        <div class="status-dot"></div>
        {{ isAi ? '思考中...' : '轮到你了' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  pieceColor: 'black' | 'white'
  isActive: boolean
  isAi: boolean
}>()
</script>

<style scoped>
.player-card {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: var(--transition);
  border: 2px solid transparent;
  box-shadow: var(--shadow-sm);
}

.player-card.active {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.player-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-board);
  display: flex;
  align-items: center;
  justify-content: center;
}

.piece {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: var(--transition);
}

.piece.black {
  background: var(--piece-black);
  box-shadow: var(--shadow-sm);
}

.piece.white {
  background: var(--piece-white);
  border: 1px solid #ddd;
  box-shadow: var(--shadow-sm);
}

.ai-icon {
  position: absolute;
  right: -4px;
  bottom: -4px;
  background: var(--primary);
  color: var(--text-light);
  padding: 4px;
  border-radius: 50%;
  font-size: 12px;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 600;
  color: var(--text-primary);
}

.player-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--primary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
}
</style> 