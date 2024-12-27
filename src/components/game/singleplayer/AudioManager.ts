export class AudioManager {
  private static readonly SOUNDS = {
    move: '/sounds/move.mp3',
    win: '/sounds/win.mp3',
    lose: '/sounds/lose.mp3'
  }

  private readonly audioElements: Map<string, HTMLAudioElement>
  private enabled: boolean

  constructor(enabled: boolean = true) {
    this.audioElements = new Map()
    this.enabled = enabled
    this.initializeAudio()
  }

  private initializeAudio(): void {
    Object.entries(AudioManager.SOUNDS).forEach(([key, src]) => {
      const audio = new Audio(src)
      audio.preload = 'auto'
      this.audioElements.set(key, audio)
    })
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  play(sound: keyof typeof AudioManager.SOUNDS): void {
    if (!this.enabled) return

    const audio = this.audioElements.get(sound)
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(error => {
        console.warn(`Failed to play sound ${sound}:`, error)
      })
    }
  }

  cleanup(): void {
    this.audioElements.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    this.audioElements.clear()
  }
} 