export function setupAudio() {
  const pieceSound = new Audio('/sounds/piece.mp3')
  const winSound = new Audio('/sounds/win.mp3')

  return {
    playPieceSound() {
      pieceSound.currentTime = 0
      pieceSound.play().catch(() => {})
    },
    playWinSound() {
      winSound.currentTime = 0
      winSound.play().catch(() => {})
    }
  }
} 