<template>
  <div class="tutorial">
    <h3>游戏规则</h3>
    <ul>
      <li>黑白双方轮流落子</li>
      <li>先形成五子连线的一方获胜</li>
      <li>连线可以是横向、纵向或斜向</li>
    </ul>
    <h3>操作说明</h3>
    <ul>
      <li>点击棋盘空白处落子</li>
      <li>点击撤销可以回退一步</li>
      <li>点击重新开始可以重新游戏</li>
    </ul>
    <button class="close-btn" @click="$emit('close')">
      知道了
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.tutorial {
  padding: 2rem;
  color: var(--text-primary);
}

h3 {
  margin: 1rem 0;
  color: var(--primary);
}

ul {
  list-style-type: disc;
  margin-left: 1.5rem;
}

li {
  margin: 0.5rem 0;
}

.close-btn {
  margin-top: 2rem;
  padding: 0.5rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: var(--primary);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  opacity: 0.9;
}
</style> 