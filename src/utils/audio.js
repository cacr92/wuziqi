// 音频状态
let isMuted = false

// 音频文件映射
const audioFiles = {
  place: '/sounds/place.mp3',
  win: '/sounds/win.mp3',
  start: '/sounds/start.mp3',
  undo: '/sounds/undo.mp3'
}

// 音频缓存
const audioCache = new Map()

// 初始化音频
export function setupAudio() {
  Object.entries(audioFiles).forEach(([key, path]) => {
    const audio = new Audio(path)
    audioCache.set(key, audio)
  })
}

// 播放音效
export function playSound(type) {
  if (isMuted) return
  
  const audio = audioCache.get(type)
  if (audio) {
    audio.currentTime = 0
    audio.play().catch(() => {
      // 忽略自动播放策略导致的错误
    })
  }
}

// 设置静音状态
export function setMuted(muted) {
  isMuted = muted
}

// 获取静音状态
export function getMuted() {
  return isMuted
} 