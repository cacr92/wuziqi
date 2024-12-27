import type { Board, PlayerColor } from '../types'

const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]]
const BOARD_SIZE = 15

// 优化评分系统
const SCORES = {
  FIVE: 1000000,        // 连五，必胜
  OPEN_FOUR: 100000,    // 活四，次优先
  DOUBLE_THREE: 50000,  // 双活三，高威胁
  BLOCKED_FOUR: 10000,  // 冲四，需要防守
  OPEN_THREE: 5000,     // 活三，重要威胁
  BLOCKED_THREE: 1000,  // 眠三，潜在威胁
  OPEN_TWO: 500,        // 活二，发展机会
  BLOCKED_TWO: 100,     // 眠二，一般情况
  ONE: 10,              // 单子，基础分
  CENTER: 30,           // 中心位置加分
  NEAR_CENTER: 20,      // 靠近中心加分
  NEAR_PIECE: 5         // 靠近已有棋子加分
}

// 使用 TypedArray 优化性能
const positionCache = new Int32Array(BOARD_SIZE * BOARD_SIZE)

export function evaluatePosition(board: Board, row: number, col: number, color: PlayerColor): number {
  const cacheIndex = row * BOARD_SIZE + col
  const cachedValue = positionCache[cacheIndex]
  if (cachedValue !== 0) return cachedValue

  let score = 0
  let openThrees = 0
  let blockedFours = 0

  // 基础位置分数
  score += getPositionBonus(row, col)

  // 方向评估
  for (const [dx, dy] of DIRECTIONS) {
    const { lineScore, pattern } = evaluateLine(board, row, col, dx, dy, color)
    if (pattern === 'OPEN_THREE') openThrees++
    if (pattern === 'BLOCKED_FOUR') blockedFours++
    score += lineScore
  }

  // 组合策略加分
  if (openThrees >= 2) score += SCORES.DOUBLE_THREE
  if (blockedFours >= 2) score += SCORES.OPEN_FOUR
  if (openThrees >= 1 && blockedFours >= 1) score += SCORES.BLOCKED_FOUR

  // 攻守平衡
  const defenseScore = evaluateDefense(board, row, col, color)
  score += defenseScore * 0.8  // 防守分值权重略低于进攻

  positionCache[cacheIndex] = score
  return score
}

function evaluateLine(
  board: Board, 
  row: number, 
  col: number, 
  dx: number, 
  dy: number, 
  color: PlayerColor
): { lineScore: number, pattern: string } {
  let count = 1
  let openEnds = 2
  let space = 0
  let consecutive = 1

  // 正向检查
  for (let i = 1; i <= 4; i++) {
    const newRow = row + dx * i
    const newCol = col + dy * i
    
    if (!isValidPosition(newRow, newCol)) {
      openEnds--
      break
    }
    
    const cell = board[newRow][newCol]
    if (cell === null) {
      if (space === 0 && i <= 3) space = i
      break
    }
    if (cell !== color) {
      openEnds--
      break
    }
    count++
    if (i === 1) consecutive++
  }

  // 反向检查
  for (let i = 1; i <= 4; i++) {
    const newRow = row - dx * i
    const newCol = col - dy * i
    
    if (!isValidPosition(newRow, newCol)) {
      openEnds--
      break
    }
    
    const cell = board[newRow][newCol]
    if (cell === null) {
      if (space === 0) space = i
      break
    }
    if (cell !== color) {
      openEnds--
      break
    }
    count++
    if (i === 1) consecutive++
  }

  const { score, pattern } = getScoreForPattern(count, openEnds, space, consecutive)
  return { lineScore: score, pattern }
}

function getScoreForPattern(
  count: number, 
  openEnds: number, 
  space: number, 
  consecutive: number
): { score: number, pattern: string } {
  if (count >= 5) return { score: SCORES.FIVE, pattern: 'FIVE' }
  
  if (count === 4) {
    if (openEnds === 2) return { score: SCORES.OPEN_FOUR, pattern: 'OPEN_FOUR' }
    if (openEnds === 1) return { score: SCORES.BLOCKED_FOUR, pattern: 'BLOCKED_FOUR' }
  }
  
  if (count === 3) {
    if (openEnds === 2) return { score: SCORES.OPEN_THREE, pattern: 'OPEN_THREE' }
    if (openEnds === 1) return { score: SCORES.BLOCKED_THREE, pattern: 'BLOCKED_THREE' }
  }
  
  if (count === 2) {
    if (openEnds === 2) return { score: SCORES.OPEN_TWO, pattern: 'OPEN_TWO' }
    if (openEnds === 1) return { score: SCORES.BLOCKED_TWO, pattern: 'BLOCKED_TWO' }
  }

  // 连续棋子额外加分
  const continuousBonus = consecutive >= 2 ? consecutive * 2 : 0

  return { 
    score: openEnds === 2 ? SCORES.ONE + continuousBonus : SCORES.ONE, 
    pattern: 'ONE'
  }
}

function getPositionBonus(row: number, col: number): number {
  const center = Math.floor(BOARD_SIZE / 2)
  const distanceToCenter = Math.abs(row - center) + Math.abs(col - center)
  
  if (distanceToCenter === 0) return SCORES.CENTER
  if (distanceToCenter <= 2) return SCORES.NEAR_CENTER
  if (distanceToCenter <= 4) return SCORES.NEAR_PIECE
  return 0
}

function evaluateDefense(board: Board, row: number, col: number, color: PlayerColor): number {
  // 评估防守价值
  const oppositeColor = color === 'black' ? 'white' : 'black'
  return evaluatePosition(board, row, col, oppositeColor) * 1.2  // 防守时略微提高对手位置的评估分
}

function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

// 导出getBestMove函数
export const getBestMove = (board: Board, color: PlayerColor): [number, number] => {
  let bestScore = -Infinity
  let bestMove: [number, number] = [7, 7]
  const moves = getValidMoves(board)

  // Alpha-Beta剪枝搜索
  for (const [row, col] of moves) {
    board[row][col] = color
    const score = minimax(board, 3, -Infinity, Infinity, false, color)
    board[row][col] = null

    if (score > bestScore) {
      bestScore = score
      bestMove = [row, col]
    }
  }

  return bestMove
}

function getValidMoves(board: Board): [number, number][] {
  const moves: [number, number][] = []
  const visited = new Set<string>()

  // 优先考虑已有棋子周围的位置
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j]) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue
            
            const newRow = i + dx
            const newCol = j + dy
            const key = `${newRow},${newCol}`

            if (
              isValidPosition(newRow, newCol) && 
              !board[newRow][newCol] &&
              !visited.has(key)
            ) {
              moves.push([newRow, newCol])
              visited.add(key)
            }
          }
        }
      }
    }
  }

  return moves.length > 0 ? moves : [[7, 7]]
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  color: PlayerColor
): number {
  if (depth === 0) {
    return evaluateBoard(board, color)
  }

  const moves = getValidMoves(board)
  
  if (isMaximizing) {
    let maxScore = -Infinity
    for (const [row, col] of moves) {
      board[row][col] = color
      const score = minimax(board, depth - 1, alpha, beta, false, color)
      board[row][col] = null
      maxScore = Math.max(maxScore, score)
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }
    return maxScore
  } else {
    let minScore = Infinity
    const oppositeColor = color === 'black' ? 'white' : 'black'
    for (const [row, col] of moves) {
      board[row][col] = oppositeColor
      const score = minimax(board, depth - 1, alpha, beta, true, color)
      board[row][col] = null
      minScore = Math.min(minScore, score)
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return minScore
  }
}

function evaluateBoard(board: Board, color: PlayerColor): number {
  let score = 0
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (!board[i][j]) continue
      const pieceScore = evaluatePosition(board, i, j, color)
      score += board[i][j] === color ? pieceScore : -pieceScore
    }
  }
  return score
}

export function clearCache(): void {
  positionCache.fill(0)
} 