<template>
  <div class="game-tutorial">
    <h2>游戏教程</h2>
    <div class="tutorial-content">
      <p>1. 黑子先手，双方轮流落子</p>
      <p>2. 五子连成一线（横、竖、斜）即可获胜</p>
      <p>3. 人机对战时，玩家执黑子</p>
    </div>
    <button @click="$emit('close')">
      <i class="fas fa-times"></i>
      关闭
    </button>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GameTutorial'
}
</script>

<style scoped>
.game-tutorial {
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style> 