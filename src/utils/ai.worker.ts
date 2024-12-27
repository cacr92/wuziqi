import { GameOptimizer, SCORES } from './gameOptimizer'
import type { Board, PlayerColor } from '../types'

const SEARCH_DEPTH = 4
const MAX_SCORE = 1000000
const MIN_SCORE = -1000000

// AI 工作线程
self.onmessage = (e: MessageEvent) => {
  const { board, color } = e.data
  const move = findBestMove(board, color)
  self.postMessage(move)
}

// 使用极小化极大算法找出最佳移动
function findBestMove(board: Board, color: PlayerColor): { row: number; col: number } {
  let bestScore = MIN_SCORE
  let bestMove: { row: number; col: number } | null = null
  
  // 获取所有可能的移动，并按评分排序
  const moves = GameOptimizer.generateMoves(board)
  
  // 遍历每个可能的移动
  for (const move of moves) {
    // 模拟移动
    board[move.row][move.col] = color
    
    // 计算这个移动的分数
    const score = -minimax(
      board,
      SEARCH_DEPTH - 1,
      MIN_SCORE,
      MAX_SCORE,
      color === 'black' ? 'white' : 'black'
    )
    
    // 撤销移动
    board[move.row][move.col] = null
    
    // 更新最佳移动
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  
  return bestMove || moves[0]
}

// 极小化极大算法
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  color: PlayerColor
): number {
  // 检查是否已经有缓存的状态
  const cachedState = GameOptimizer.getCachedGameState({
    board,
    currentPlayer: color,
    gameMode: 'pve',
    gameOver: false,
    winner: null,
    lastMove: null,
    history: []
  })
  
  if (cachedState) {
    return evaluateBoard(cachedState.board)
  }
  
  // 到达搜索深度或游戏结束
  if (depth === 0) {
    return evaluateBoard(board)
  }
  
  const moves = GameOptimizer.generateMoves(board)
  
  if (moves.length === 0) {
    return 0
  }
  
  let bestScore = color === 'white' ? MIN_SCORE : MAX_SCORE
  
  // 遍历所有可能的移动
  for (const move of moves) {
    // 模拟移动
    board[move.row][move.col] = color
    
    // 递归计算分数
    const score = -minimax(
      board,
      depth - 1,
      -beta,
      -alpha,
      color === 'black' ? 'white' : 'black'
    )
    
    // 撤销移动
    board[move.row][move.col] = null
    
    // Alpha-Beta 剪枝
    if (color === 'white') {
      bestScore = Math.max(bestScore, score)
      alpha = Math.max(alpha, score)
    } else {
      bestScore = Math.min(bestScore, score)
      beta = Math.min(beta, score)
    }
    
    if (beta <= alpha) {
      break
    }
  }
  
  // 缓存状态
  GameOptimizer.cacheGameState({
    board,
    currentPlayer: color,
    gameMode: 'pve',
    gameOver: false,
    winner: null,
    lastMove: null,
    history: []
  })
  
  return bestScore
}

// 评估棋盘状态
function evaluateBoard(board: Board): number {
  let score = 0
  
  // 评估每个位置
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (board[i][j]) {
        const value = GameOptimizer.evaluatePosition(board, i, j, board[i][j])
        score += board[i][j] === 'white' ? value : -value
      }
    }
  }
  
  return score
}

// 定期清理缓存
setInterval(() => {
  GameOptimizer.clearCache()
}, 30000) 