import type { GameSettings, GameStats } from './types'

export class SettingsManager {
  private static readonly SETTINGS_KEY = 'gameSettings'
  private static readonly STATS_KEY = 'gameStats'

  private settings: GameSettings
  private stats: GameStats

  constructor() {
    this.settings = this.loadSettings()
    this.stats = this.loadStats()
  }

  getSettings(): GameSettings {
    return { ...this.settings }
  }

  getStats(): GameStats {
    return { ...this.stats }
  }

  updateSettings(settings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...settings }
    this.saveSettings()
  }

  updateStats(stats: Partial<GameStats>): void {
    this.stats = { ...this.stats, ...stats }
    this.saveStats()
  }

  private loadSettings(): GameSettings {
    const defaultSettings: GameSettings = {
      sound: true,
      showTimer: true,
      showLastMove: true,
      showPreview: true,
      boardTheme: 'wood'
    }

    try {
      const savedSettings = localStorage.getItem(SettingsManager.SETTINGS_KEY)
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings
    } catch (error) {
      console.warn('Failed to load settings:', error)
      return defaultSettings
    }
  }

  private loadStats(): GameStats {
    const defaultStats: GameStats = {
      playerWins: 0,
      aiWins: 0,
      draws: 0
    }

    try {
      const savedStats = localStorage.getItem(SettingsManager.STATS_KEY)
      return savedStats ? JSON.parse(savedStats) : defaultStats
    } catch (error) {
      console.warn('Failed to load stats:', error)
      return defaultStats
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SettingsManager.SETTINGS_KEY, JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }
  }

  private saveStats(): void {
    try {
      localStorage.setItem(SettingsManager.STATS_KEY, JSON.stringify(this.stats))
    } catch (error) {
      console.warn('Failed to save stats:', error)
    }
  }
} 