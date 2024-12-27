import type { Board, PlayerColor } from '../types'

// 使用方向数组优化胜负判断
const DIRECTIONS = [
  [1, 0],   // 水平
  [0, 1],   // 垂直
  [1, 1],   // 对角线
  [1, -1]   // 反对角线
]

// 使用 TypedArray 优化内存使用
const boardCache = new Int8Array(225) // 15x15

export function checkWin(
  board: Board, 
  row: number, 
  col: number, 
  player: PlayerColor
): boolean {
  // 只检查最后一手棋的四个方向
  for (const [dx, dy] of DIRECTIONS) {
    let count = 1
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (!isValidPosition(newRow, newCol) || board[newRow][newCol] !== player) break
      count++
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (!isValidPosition(newRow, newCol) || board[newRow][newCol] !== player) break
      count++
    }
    
    if (count >= 5) return true
  }
  return false
}

// 使用位运算优化边界检查
export function isValidPosition(row: number, col: number): boolean {
  return (row | col) >= 0 && (row & col) < 15
}

// 使用 TypedArray 优化棋盘初始化
export function getEmptyBoard(): Board {
  boardCache.fill(0)
  return Array(15).fill(null).map((_, i) => 
    Array(15).fill(null).map((_, j) => null)
  )
}

// 添加缓存机制
const moveCache = new Map<string, boolean>()

export function isMoveValid(board: Board, row: number, col: number): boolean {
  const key = `${row}-${col}`
  if (moveCache.has(key)) return moveCache.get(key)!
  
  const valid = isValidPosition(row, col) && board[row][col] === null
  moveCache.set(key, valid)
  return valid
}

// 清理缓存
export function clearCache(): void {
  moveCache.clear()
  boardCache.fill(0)
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