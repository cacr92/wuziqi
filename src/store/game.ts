import { defineStore } from 'pinia'
import type { GameMode, Difficulty, GameStats } from '../types'

interface State {
  gameMode: GameMode
  difficulty: Difficulty
  stats: GameStats
}

export const useGameStore = defineStore('game', {
  state: (): State => ({
    gameMode: 'pve',
    difficulty: 'medium',
    stats: {
      totalGames: 0,
      wins: 0,
      losses: 0
    }
  }),

  actions: {
    setGameMode(mode: GameMode) {
      this.gameMode = mode
    },

    setDifficulty(difficulty: Difficulty) {
      this.difficulty = difficulty
    },

    addGame(result: 'win' | 'loss') {
      this.stats.totalGames++
      if (result === 'win') {
        this.stats.wins++
      } else {
        this.stats.losses++
      }
    },

    restart() {
      // 重置游戏状态
    }
  }
}) 