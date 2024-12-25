import { Server, Socket } from 'socket.io'
import type { PlayerColor } from '../types'

interface GameRoom {
  id: string
  players: {
    black?: string
    white?: string
  }
  board: (PlayerColor | null)[][]
  currentPlayer: PlayerColor
}

const rooms = new Map<string, GameRoom>()

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id)

    socket.on('create_room', () => {
      const roomId = Math.random().toString(36).substring(2, 8)
      rooms.set(roomId, {
        id: roomId,
        players: { black: socket.id },
        board: Array(15).fill(null).map(() => Array(15).fill(null)),
        currentPlayer: 'black'
      })
      socket.join(roomId)
      socket.emit('room_created', { roomId })
    })

    socket.on('join_room', ({ roomId }) => {
      const room = rooms.get(roomId)
      if (!room) {
        socket.emit('error', '房间不存在')
        return
      }
      
      if (room.players.black && room.players.white) {
        socket.emit('error', '房间已满')
        return
      }
      
      const color: PlayerColor = room.players.black ? 'white' : 'black'
      room.players[color] = socket.id
      socket.join(roomId)
      socket.emit('room_joined', { color })
      
      if (room.players.black && room.players.white) {
        io.to(roomId).emit('game_start')
      }
    })

    socket.on('make_move', ({ roomId, move }) => {
      const room = rooms.get(roomId)
      if (!room) return
      
      const color = Object.entries(room.players).find(([_, id]) => id === socket.id)?.[0] as PlayerColor
      if (!color || room.currentPlayer !== color) return
      
      const { row, col } = move
      if (room.board[row][col]) return
      
      room.board[row][col] = color
      room.currentPlayer = color === 'black' ? 'white' : 'black'
      
      io.to(roomId).emit('move', {
        row,
        col,
        color,
        nextPlayer: room.currentPlayer
      })
    })

    socket.on('leave_room', ({ roomId }) => {
      const room = rooms.get(roomId)
      if (!room) return
      
      socket.leave(roomId)
      io.to(roomId).emit('player_left')
      rooms.delete(roomId)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      
      // 清理断开连接的玩家所在的房间
      for (const [roomId, room] of rooms.entries()) {
        if (room.players.black === socket.id || room.players.white === socket.id) {
          io.to(roomId).emit('player_left')
          rooms.delete(roomId)
        }
      }
    })
  })
} 