import { ref } from 'vue'

// 音频状态
export const isMuted = ref(false)

// 音效类型
export type SoundEffect = 'join' | 'place' | 'hover' | 'start' | 'win' | 'undo'

// 音效配置
const soundConfig: Record<SoundEffect, string> = {
  join: '/sounds/join.mp3',
  place: '/sounds/place.mp3',
  hover: '/sounds/hover.mp3',
  start: '/sounds/start.mp3',
  win: '/sounds/win.mp3',
  undo: '/sounds/undo.mp3'
}

// 音效缓存
const audioCache = new Map<SoundEffect, HTMLAudioElement>()

// 初始化时预加载音效
export const preloadSounds = () => {
  Object.entries(soundConfig).forEach(([key, path]) => {
    const audio = new Audio(path)
    audio.load()
    audioCache.set(key as SoundEffect, audio)
  })
}

// 播放音效
export const playSound = (effect: SoundEffect) => {
  const audio = audioCache.get(effect)
  if (audio) {
    audio.currentTime = 0
    audio.play().catch(console.error)
  }
}

// 切换静音状态
export function toggleMute() {
  isMuted.value = !isMuted.value
  localStorage.setItem('isMuted', isMuted.value.toString())
}

// 设置音量
export function setVolume(volume: number) {
  Object.values(audioCache).forEach(audio => {
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume))
    }
  })
} 