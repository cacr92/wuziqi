import type { Board, PlayerColor } from '../src/types'
import type { Room } from './types'
import type { Server } from 'socket.io'

let io: Server

export const setSocketServer = (socketServer: Server) => {
  io = socketServer
}

// 生成6位数字房间号
export function generateRoomId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 创建空棋盘
export function createBoard(): Board {
  return Array(15).fill(null).map(() => Array(15).fill(null))
}

// 检查胜利
export function checkWin(board: Board, row: number, col: number, color: PlayerColor): boolean {
  const directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 对角线
    [1, -1]   // 反对角线
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (
        newRow < 0 || newRow >= 15 ||
        newCol < 0 || newCol >= 15 ||
        board[newRow][newCol] !== color
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
        newRow < 0 || newRow >= 15 ||
        newCol < 0 || newCol >= 15 ||
        board[newRow][newCol] !== color
      ) {
        break
      }
      count++
    }

    if (count >= 5) return true
  }

  return false
}

// 启动计时器
export function startTimer(room: Room, rooms: Map<string, Room>): void {
  if (room.timerInterval) {
    clearInterval(room.timerInterval)
  }

  room.timerInterval = setInterval(() => {
    // 更新当前玩家的计时器
    if (room.currentPlayer === 'black') {
      room.timers.black--
    } else {
      room.timers.white--
    }

    // 广播计时器更新
    if (io) {
      io.to(room.id).emit('timer_update', {
        timers: room.timers,
        currentPlayer: room.currentPlayer
      })
    }

    // 检查是否超时
    const currentTimer = room.currentPlayer === 'black' ? room.timers.black : room.timers.white
    if (currentTimer <= 0) {
      clearInterval(room.timerInterval!)
      const winner = room.currentPlayer === 'black' ? 'white' : 'black'
      if (io) {
        io.to(room.id).emit('game_over', {
          winner,
          reason: 'timeout',
          board: room.board
        })
      }
      rooms.delete(room.id)
    }
  }, 1000)
} 