import type { Board, PlayerColor } from '../types'

export const checkWin = (
  board: Board,
  row: number,
  col: number,
  player: PlayerColor
): boolean => {
  const directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 右下斜
    [1, -1]   // 右上斜
  ]
  
  return directions.some(([dx, dy]) => {
    let count = 1
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (
        newRow < 0 || 
        newRow >= 15 || 
        newCol < 0 || 
        newCol >= 15 ||
        board[newRow][newCol] !== player
      ) {
        break
      }
      count++
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (
        newRow < 0 || 
        newRow >= 15 || 
        newCol < 0 || 
        newCol >= 15 ||
        board[newRow][newCol] !== player
      ) {
        break
      }
      count++
    }
    
    return count >= 5
  })
}

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 15 && col >= 0 && col < 15
}

export const getEmptyBoard = (): Board => {
  return Array(15).fill(null).map(() => Array(15).fill(null))
}

export const getBestMove = (board: Board): [number, number] => {
  // 简单AI实现：随机找一个空位
  const emptySpots: [number, number][] = []
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (!board[i][j]) {
        emptySpots.push([i, j])
      }
    }
  }
  
  if (emptySpots.length > 0) {
    return emptySpots[Math.floor(Math.random() * emptySpots.length)]
  }
  
  return [7, 7] // 默认返回棋盘中心
} 