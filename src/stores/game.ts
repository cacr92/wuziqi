import { defineStore } from 'pinia'

export interface GameStats {
  totalGames: number
  wins: number
  losses: number
}

export const useGameStore = defineStore('game', {
  state: () => ({
    stats: {
      totalGames: 0,
      wins: 0,
      losses: 0
    } as GameStats
  }),
  
  actions: {
    loadStats() {
      const savedStats = localStorage.getItem('gameStats')
      if (savedStats) {
        this.stats = JSON.parse(savedStats)
      }
    },
    
    saveStats() {
      localStorage.setItem('gameStats', JSON.stringify(this.stats))
    },
    
    addGame(result: 'win' | 'loss') {
      this.stats.totalGames++
      if (result === 'win') {
        this.stats.wins++
      } else {
        this.stats.losses++
      }
      this.saveStats()
    }
  }
}) 