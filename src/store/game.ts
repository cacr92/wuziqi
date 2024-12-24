import { defineStore } from 'pinia'

interface GameStats {
  totalGames: number
  wins: number
  losses: number
  draws: number
}

export const useGameStore = defineStore('game', {
  state: () => ({
    stats: {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0
    } as GameStats
  }),

  actions: {
    addGame(result: 'win' | 'loss' | 'draw') {
      this.stats.totalGames++
      if (result === 'win') this.stats.wins++
      else if (result === 'loss') this.stats.losses++
      else this.stats.draws++
    },

    resetStats() {
      this.stats = {
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0
      }
    }
  }
}) 