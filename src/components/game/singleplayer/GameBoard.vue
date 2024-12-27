<template>
  <div class="game-board-container" :class="{ disabled }">
    <div class="game-board" :class="theme">
      <!-- 棋盘网格 -->
      <div class="board-background"></div>
      <div class="board-grid">
        <!-- 横线 -->
        <div v-for="i in 15" :key="`h-${i}`" class="grid-line horizontal" 
          :style="{ top: gridPosition(i-1) }">
        </div>
        <!-- 竖线 -->
        <div v-for="i in 15" :key="`v-${i}`" class="grid-line vertical" 
          :style="{ left: gridPosition(i-1) }">
        </div>
        <!-- 星位点 -->
        <div v-for="point in starPoints" :key="`star-${point.x}-${point.y}`" 
          class="star-point" 
          :style="{ 
            left: piecePosition(point.y), 
            top: piecePosition(point.x)
          }">
        </div>
      </div>
      <!-- 棋子层 -->
      <div class="pieces-layer" 
        @mousemove="handleMouseMove" 
        @mouseleave="handleMouseLeave" 
        @click="handleBoardClick">
        <!-- 已落子 -->
        <div v-for="(row, x) in board" :key="`row-${x}`">
          <div v-for="(cell, y) in row" :key="`cell-${x}-${y}`">
            <div v-if="cell" 
              class="piece" 
              :class="[
                cell,
                { 'last-move': showLastMove && lastMove?.x === x && lastMove?.y === y }
              ]"
              :style="{ 
                left: piecePosition(y), 
                top: piecePosition(x)
              }">
            </div>
          </div>
        </div>
        <!-- 预览棋子 -->
        <div v-if="showPreview && hoverCell && !board[hoverCell.x][hoverCell.y]" 
          class="piece preview" 
          :class="currentPlayer"
          :style="{ 
            left: piecePosition(hoverCell.y), 
            top: piecePosition(hoverCell.x)
          }">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerColor } from '@/types'
import type { Position } from '../ai/types'

const props = defineProps<{
  board: (PlayerColor | null)[][]
  disabled: boolean
  showPreview: boolean
  showLastMove: boolean
  theme: string
  lastMove: Position | null
  hoverCell: Position | null
  currentPlayer?: PlayerColor
}>()

const emit = defineEmits<{
  (e: 'move', x: number, y: number): void
  (e: 'hover', position: Position | null): void
}>()

// 星位点置
const starPoints = [
  { x: 3, y: 3 }, { x: 3, y: 11 },
  { x: 11, y: 3 }, { x: 11, y: 11 },
  { x: 7, y: 7 }
]

const handleBoardClick = (event: MouseEvent) => {
  const { x, y } = calculateBoardPosition(event)
  if (isValidPosition(x, y)) {
    emit('move', x, y)
  }
}

const handleMouseMove = (event: MouseEvent) => {
  const { x, y } = calculateBoardPosition(event)
  if (isValidPosition(x, y)) {
    emit('hover', { x, y })
  } else {
    emit('hover', null)
  }
}

const handleMouseLeave = () => {
  emit('hover', null)
}

const calculateBoardPosition = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const padding = 16 // 棋盘内边距
  const effectiveSize = rect.width - (padding * 2) // 实际棋盘大小（减去内边距）
  const cellSize = effectiveSize / 14 // 每个格子的大小
  
  // 计算相对位置（考虑内边距）
  const relativeX = event.clientX - rect.left - padding
  const relativeY = event.clientY - rect.top - padding
  
  // 计算最近的交叉点，使用round确保落在最近的交叉点
  const x = Math.min(14, Math.max(0, Math.round(relativeY / cellSize)))
  const y = Math.min(14, Math.max(0, Math.round(relativeX / cellSize)))
  
  return { x, y }
}

// 修改网格和棋子的定位计算，使用15作为基数
const gridPosition = (index: number) => {
  return `${index * (100/14)}%`
}

const piecePosition = (index: number) => {
  return `${index * (100/14)}%`
}

// 修改验证逻辑
const isValidPosition = (x: number, y: number) => {
  return x >= 0 && x < 15 && y >= 0 && y < 15 && 
         props.board[x]?.[y] === null && !props.disabled
}
</script>

<style scoped>
.game-board-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.game-board {
  width: min(100%, calc(100vh - 200px));
  height: min(100%, calc(100vh - 200px));
  position: relative;
  background: linear-gradient(135deg, #E6D5AC 0%, #D4BC86 100%);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 
    0 16px 32px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.5);
}

.board-background {
  position: absolute;
  inset: 16px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.board-grid {
  position: absolute;
  inset: 16px;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background: rgba(0, 0, 0, 0.2);
}

.grid-line.horizontal {
  left: 0;
  right: 0;
  height: 1px;
}

.grid-line.vertical {
  top: 0;
  bottom: 0;
  width: 1px;
}

.star-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.pieces-layer {
  position: absolute;
  inset: 16px;
  cursor: pointer;
}

.piece {
  position: absolute;
  width: calc(100% / 14);
  height: calc(100% / 14);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.piece.black {
  background: radial-gradient(
    circle at 35% 35%,
    rgba(120, 120, 120, 1) 0%,
    rgba(60, 60, 60, 1) 40%,
    rgba(0, 0, 0, 1) 100%
  );
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 3px rgba(255, 255, 255, 0.3);
}

.piece.white {
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 255, 255, 1) 0%,
    rgba(245, 245, 245, 1) 40%,
    rgba(230, 230, 230, 1) 100%
  );
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 3px rgba(255, 255, 255, 1);
}

.piece.preview {
  opacity: 0.3;
  animation: preview-pulse 2s infinite;
}

.piece.last-move::after {
  content: '';
  position: absolute;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(231, 76, 60, 0.6) 0%, rgba(231, 76, 60, 0.2) 70%);
  animation: last-move-pulse 1.5s infinite;
}

@keyframes preview-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(0.95); }
  50% { transform: translate(-50%, -50%) scale(1.05); }
}

@keyframes last-move-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
}

.game-board-container.disabled {
  opacity: 0.85;
  pointer-events: none;
  filter: grayscale(20%);
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .game-board {
    background: linear-gradient(135deg, #8B7355 0%, #6B5839 100%);
  }
  
  .grid-line {
    background: rgba(0, 0, 0, 0.3);
  }
  
  .star-point {
    background: rgba(0, 0, 0, 0.6);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-board {
    width: min(100%, calc(100vw - 40px));
    height: min(100%, calc(100vw - 40px));
  }
  
  .piece {
    width: calc(100% / 14);
    height: calc(100% / 14);
  }
}
</style> 