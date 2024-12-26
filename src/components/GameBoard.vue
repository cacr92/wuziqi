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
      <button @click="store.restart()">重新开始</button>
      <button @click="store.setGameMode('pve')">人机对战</button>
      <button @click="store.setGameMode('pvp')">双人对战</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'

const store = useGameStore()

const handleCellClick = (row: number, col: number) => {
  store.makeMove(row, col)
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
}

.piece {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  position: absolute;
}

.piece.black {
  background: #000;
}

.piece.white {
  background: #fff;
  border: 1px solid #ccc;
}

.game-controls {
  display: flex;
  gap: 1rem;
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