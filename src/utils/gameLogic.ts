// 检查是否获胜的工具函数
export function checkWin(board: (string | null)[][], row: number, col: number, player: string): boolean {
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

    return count >= 5
  })
}

// 检查坐标是否有效
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 15 && col >= 0 && col < 15
}

// 检查是否平局
export function checkDraw(board: (string | null)[][]): boolean {
  return board.every(row => row.every(cell => cell !== null))
}

// 评分系统
const SCORES = {
  FIVE: 100000,    // 连五
  OPEN_FOUR: 10000,  // 活四
  FOUR: 1000,      // 冲四
  OPEN_THREE: 1000, // 活三
  THREE: 100,      // 眠三
  OPEN_TWO: 100,   // 活二
  TWO: 10,         // 眠二
  ONE: 1           // 单子
}

// AI 落子位置评估
export function evaluatePosition(board: (string | null)[][], row: number, col: number, player: string): number {
  if (board[row][col] !== null) return -1

  let score = 0
  const opponent = player === 'black' ? 'white' : 'black'

  // 临时落子以评估局势
  board[row][col] = player
  
  // 评估进攻分数
  score += evaluateDirection(board, row, col, player) * 2 // 进攻权重加倍

  // 评估防守分数（假设对手在此处落子）
  board[row][col] = opponent
  score += evaluateDirection(board, row, col, opponent)

  // 恢复棋盘状态
  board[row][col] = null

  // 位置权重
  score += getPositionWeight(row, col)

  return score
}

// ��估某个方向的连子情况
function evaluateDirection(board: (string | null)[][], row: number, col: number, player: string): number {
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]
  let totalScore = 0

  directions.forEach(([dx, dy]) => {
    let count = 1
    let openEnds = 0
    let blocked = false

    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (!isValidPosition(newRow, newCol)) {
        blocked = true
        break
      }
      if (board[newRow][newCol] === player) {
        count++
      } else if (board[newRow][newCol] === null) {
        openEnds++
        break
      } else {
        blocked = true
        break
      }
    }

    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (!isValidPosition(newRow, newCol)) {
        blocked = true
        break
      }
      if (board[newRow][newCol] === player) {
        count++
      } else if (board[newRow][newCol] === null) {
        openEnds++
        break
      } else {
        blocked = true
        break
      }
    }

    // 根据连子数和开放端计算分数
    if (count >= 5) {
      totalScore += SCORES.FIVE
    } else if (count === 4) {
      if (openEnds === 2) totalScore += SCORES.OPEN_FOUR
      else if (openEnds === 1) totalScore += SCORES.FOUR
    } else if (count === 3) {
      if (openEnds === 2) totalScore += SCORES.OPEN_THREE
      else if (openEnds === 1) totalScore += SCORES.THREE
    } else if (count === 2) {
      if (openEnds === 2) totalScore += SCORES.OPEN_TWO
      else if (openEnds === 1) totalScore += SCORES.TWO
    } else {
      totalScore += SCORES.ONE
    }
  })

  return totalScore
}

// 位置权重评估（越靠近中心权重越高）
function getPositionWeight(row: number, col: number): number {
  const centerDist = Math.sqrt(Math.pow(row - 7, 2) + Math.pow(col - 7, 2))
  return Math.max(0, 10 - centerDist) * 10
}

// 获取最佳落子位置
export function getBestMove(board: (string | null)[][], player: string): [number, number] {
  let bestScore = -1
  let bestMove: [number, number] = [7, 7] // 默认中心位置

  // 只考虑已有棋子周围的空位
  const candidates: [number, number][] = []
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (board[i][j] === null && hasNeighbor(board, i, j)) {
        candidates.push([i, j])
      }
    }
  }

  // 如果没有候选位置，返回中心位置
  if (candidates.length === 0) {
    return [7, 7]
  }

  // 评估每个候选位置
  candidates.forEach(([row, col]) => {
    const score = evaluatePosition(board, row, col, player)
    if (score > bestScore) {
      bestScore = score
      bestMove = [row, col]
    }
  })

  return bestMove
}

// 检查周围8个方向是否有棋子
function hasNeighbor(board: (string | null)[][], row: number, col: number): boolean {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue
      const newRow = row + i
      const newCol = col + j
      if (isValidPosition(newRow, newCol) && board[newRow][newCol] !== null) {
        return true
      }
    }
  }
  return false
} 