// 生成音效并下载
export function generateSound(type: 'place' | 'hover' | 'start' | 'win' | 'join' | 'undo') {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  // 连接节点
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  // 根据类型设置不同的音效参数
  switch (type) {
    case 'place':
      // 落子音效：短促的清脆声音
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      break
      
    case 'hover':
      // 悬停音效：非常轻微的点击声
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
      break
      
    case 'start':
      // 开始游戏音效：上升的音阶
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      break
      
    case 'win':
      // 胜利音效：欢快的音阶
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1)
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2)
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      break
      
    case 'join':
      // 加入房间音效：温和的提示音
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 0.15)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
      break
      
    case 'undo':
      // 撤销音效：下降的音阶
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
      break
  }
  
  // 开始播放并在适当的时候停止
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.5)
  
  // 录制音频
  const mediaStreamDestination = audioContext.createMediaStreamDestination()
  gainNode.connect(mediaStreamDestination)
  
  const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream)
  const audioChunks: BlobPart[] = []
  
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data)
  }
  
  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' })
    const audioUrl = URL.createObjectURL(audioBlob)
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${type}.mp3`
    link.click()
  }
  
  mediaRecorder.start()
  setTimeout(() => mediaRecorder.stop(), 500)
}

// 生成所有音效
export function generateAllSounds() {
  const sounds = ['place', 'hover', 'start', 'win', 'join', 'undo'] as const
  sounds.forEach(sound => generateSound(sound))
} 