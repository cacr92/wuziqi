import { defineStore } from 'pinia'
import type { GameMode, GameSettings, GameStats } from '../types'

export const useGameStore = defineStore('game', {
  state: () => ({
    gameMode: 'pve' as GameMode,
    difficulty: 'medium' as GameSettings['difficulty'],
    stats: {
      totalGames: 0,
      wins: 0,
      losses: 0
    } as GameStats
  }),

  actions: {
    setGameMode(mode: GameMode) {
      this.gameMode = mode
    },
    
    setDifficulty(difficulty: GameSettings['difficulty']) {
      this.difficulty = difficulty
    },

    restart() {
      // 重置游戏状态
      console.log('Game restarted')
    }
  }
}) 