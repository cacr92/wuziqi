<template>
  <div class="app">
    <WelcomeScreen 
      v-if="!gameStarted"
      @start="startGame"
      @tutorial="showTutorial = true"
      @settings="showSettings = true"
      @stats="showStats = true"
    />
    <GameBoard 
      v-else
      :game-mode="gameMode"
      @exit="gameStarted = false"
    />

    <!-- 模态框 -->
    <div v-if="showTutorial" class="modal">
      <h2>游戏教程</h2>
      <button @click="showTutorial = false">关闭</button>
    </div>

    <div v-if="showSettings" class="modal">
      <h2>游戏设置</h2>
      <button @click="showSettings = false">关闭</button>
    </div>

    <div v-if="showStats" class="modal">
      <h2>游戏统计</h2>
      <button @click="showStats = false">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WelcomeScreen from './components/welcome/WelcomeScreen.vue'
import GameBoard from './components/game/GameBoard.vue'

const gameStarted = ref(false)
const gameMode = ref<'pve' | 'online'>('pve')
const showTutorial = ref(false)
const showSettings = ref(false)
const showStats = ref(false)

const startGame = (mode: 'pve' | 'online') => {
  gameMode.value = mode
  gameStarted.value = true
}
</script>

<style>
.app {
  height: 100vh;
  margin: 0;
  padding: 0;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.modal h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.modal button {
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal button:hover {
  background: #43A047;
}
</style> 