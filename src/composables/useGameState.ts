import { ref, computed } from 'vue'
import type { GameMode, Difficulty, PlayerColor } from '@/types'
import { GAME_MODES, PLAYER_COLORS, BOARD_SIZE } from '@/constants/game'

function createEmptyBoard() {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
}

export function useGameState() {
  const currentScreen = ref<'welcome' | 'game'>('welcome')
  const gameMode = ref<GameMode | null>(null)
  const difficulty = ref<Difficulty | null>(null)
  const currentPlayer = ref<PlayerColor>(PLAYER_COLORS.BLACK)
  const board = ref(createEmptyBoard())
  const moveHistory = ref([])
  const gameOver = ref(false)
  const isPlayerTurn = ref(true)
  
  const canMove = computed(() => {
    return !gameOver.value && 
           (gameMode.value !== GAME_MODES.ONLINE || isPlayerTurn.value)
  })
  
  // ... 其他游戏状态逻辑
  
  return {
    currentScreen,
    gameMode,
    difficulty,
    currentPlayer,
    board,
    moveHistory,
    gameOver,
    canMove
  }
} 