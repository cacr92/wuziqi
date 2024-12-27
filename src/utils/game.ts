export function checkWin(board: number[][], x: number, y: number): boolean {
  const player = board[x][y]
  const directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 主对角线
    [1, -1],  // 副对角线
  ]

  for (const [dx, dy] of directions) {
    let count = 1

    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newX = x + dx * i
      const newY = y + dy * i

      if (newX < 0 || newX >= board.length || newY < 0 || newY >= board.length) break
      if (board[newX][newY] !== player) break
      count++
    }

    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newX = x - dx * i
      const newY = y - dy * i

      if (newX < 0 || newX >= board.length || newY < 0 || newY >= board.length) break
      if (board[newX][newY] !== player) break
      count++
    }

    if (count >= 5) return true
  }

  return false
} 