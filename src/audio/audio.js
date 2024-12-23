export function setupAudio() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  // 简单的音效实现
  function playSound(frequency = 440, duration = 0.1) {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = frequency
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    
    oscillator.start()
    oscillator.stop(audioContext.currentTime + duration)
  }
  
  return {
    playMove: () => playSound(440, 0.1),
    playWin: () => playSound(880, 0.3)
  }
} 