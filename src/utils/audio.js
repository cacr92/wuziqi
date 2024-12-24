class AudioManager {
  constructor() {
    this.sounds = {
      place: new Audio('/sounds/place.mp3'),
      win: new Audio('/sounds/win.mp3'),
      click: new Audio('/sounds/click.mp3'),
      error: new Audio('/sounds/error.mp3'),
      start: new Audio('/sounds/start.mp3'),
      hover: new Audio('/sounds/hover.mp3')
    }
    
    // 预加载音效
    Object.values(this.sounds).forEach(sound => {
      sound.load()
    })
    
    // 设置不同音效的音量
    this.sounds.place.volume = 0.4
    this.sounds.win.volume = 0.6
    this.sounds.click.volume = 0.3
    this.sounds.error.volume = 0.3
    this.sounds.start.volume = 0.5
    this.sounds.hover.volume = 0.1
    
    this.isMuted = false
    this.bgm = new Audio('/sounds/bgm.mp3')
    this.bgm.loop = true
    this.bgm.volume = 0.3
  }

  play(soundName) {
    if (this.isMuted) return
    
    const sound = this.sounds[soundName]
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(err => console.log('Audio play failed:', err))
    }
  }

  playBGM() {
    if (!this.isMuted) {
      this.bgm.play().catch(err => console.log('BGM play failed:', err))
    }
  }

  stopBGM() {
    this.bgm.pause()
    this.bgm.currentTime = 0
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    if (this.isMuted) {
      this.stopBGM()
    } else {
      this.playBGM()
    }
  }
}

const audioManager = new AudioManager()

export function setupAudio() {
  return audioManager
}

export function playSound(soundName) {
  audioManager.play(soundName)
}

export function playBGM() {
  audioManager.playBGM()
}

export function stopBGM() {
  audioManager.stopBGM()
}

export function toggleMute() {
  audioManager.toggleMute()
} 