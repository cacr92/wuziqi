<template>
  <div class="sound-generator">
    <h1>音效生成器</h1>
    <div class="sound-list">
      <button 
        v-for="sound in sounds" 
        :key="sound"
        class="sound-btn"
        @click="generateSound(sound)"
      >
        生成 {{ soundNames[sound] }}
      </button>
    </div>
    <button class="generate-all-btn" @click="generateAllSounds">
      生成所有音效
    </button>
  </div>
</template>

<script setup lang="ts">
import { generateSound, generateAllSounds } from '../utils/generateSounds'

const sounds = ['place', 'hover', 'start', 'win', 'join'] as const
const soundNames = {
  place: '落子音效',
  hover: '悬停音效',
  start: '开始游戏音效',
  win: '胜利音效',
  join: '加入房间音效'
}
</script>

<style scoped>
.sound-generator {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.sound-list {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.sound-btn {
  padding: 1rem;
  background: var(--bg-primary);
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.sound-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.generate-all-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.generate-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  opacity: 0.9;
}
</style> 