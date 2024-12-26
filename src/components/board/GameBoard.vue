<template>
  <div class="game-board">
    <div class="game-info">
      <div class="player-turn">
        当前回合: {{ store.currentPlayer === 'black' ? '黑子' : '白子' }}
      </div>
      <div v-if="store.gameOver" class="game-result">
        {{ store.winner === 'black' ? '黑子胜' : '白子胜' }}!
      </div>
    </div>

    <div class="board-container">
      <div 
        v-for="(row, i) in store.board" 
        :key="i" 
        class="board-row"
      >
        <div 
          v-for="(cell, j) in row" 
          :key="j"
          class="board-cell"
          @click="handleCellClick(i, j)"
          :class="{ 
            'can-move': !cell && !store.gameOver && 
                        (store.gameMode !== 'pve' || store.currentPlayer === 'black')
          }"
        >
          <div 
            v-if="cell" 
            class="piece"
            :class="cell"
          ></div>
        </div>
      </div>
    </div>

    <div class="game-controls">
      <div class="difficulty-selector" v-if="store.gameMode === 'pve'">
        <select v-model="difficulty" @change="changeDifficulty">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
      <button @click="store.restart()">重新开始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../../stores/game'
import type { Difficulty } from '../../types'

const store = useGameStore()
const difficulty = ref<Difficulty>('medium')

const handleCellClick = (row: number, col: number) => {
  if (store.gameMode === 'pve' && store.currentPlayer === 'white') return
  store.makeMove(row, col)
}

const changeDifficulty = () => {
  store.setDifficulty(difficulty.value)
  store.restart()
}
</script>

<style scoped>
.game-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.board-container {
  display: grid;
  grid-template-rows: repeat(15, 1fr);
  gap: 1px;
  background: #deb887;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.board-row {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 1px;
}

.board-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  background: #f5deb3;
}

.board-cell.can-move:hover {
  background: #eecb8b;
}

.piece {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  position: absolute;
}

.piece.black {
  background: #000;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.2);
}

.piece.white {
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.game-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.difficulty-selector select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4caf50;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  opacity: 0.9;
}
</style> 