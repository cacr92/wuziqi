import { defineStore } from 'pinia'

interface GameState {
  totalGames: number
  wins: number
  losses: number
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    totalGames: 0,
    wins: 0,
    losses: 0
  }),

  actions: {
    addGame(result: 'win' | 'loss') {
      this.totalGames++
      if (result === 'win') this.wins++
      else this.losses++
    }
  }
}) 