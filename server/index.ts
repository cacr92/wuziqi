import { Server } from 'socket.io'
import { createServer } from 'http'
import type { Board, PlayerColor } from '../src/types'

interface GameRoom {
  id: string
  players: {
    black?: string
    white?: string
  }
  board: Board
  currentPlayer: PlayerColor
}

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

const rooms = new Map<string, GameRoom>()

io.on('connection', (socket) => {
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
    
    if (room.players.white) {
      socket.emit('error', '房间已满')
      return
    }
    
    room.players.white = socket.id
    socket.join(roomId)
    
    io.to(roomId).emit('game_start')
    socket.emit('room_joined', { color: 'white' })
  })

  // 处理移动
  socket.on('make_move', ({ roomId, move }) => {
    const room = rooms.get(roomId)
    if (!room) return
    
    const playerColor = room.players.black === socket.id ? 'black' : 'white'
    if (playerColor !== room.currentPlayer) return
    
    room.board[move.row][move.col] = playerColor
    room.currentPlayer = playerColor === 'black' ? 'white' : 'black'
    
    io.to(roomId).emit('move', {
      row: move.row,
      col: move.col,
      color: playerColor,
      nextPlayer: room.currentPlayer
    })
  })

  // 处理断开连接
  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.black === socket.id || room.players.white === socket.id) {
        io.to(roomId).emit('player_left')
        rooms.delete(roomId)
      }
    }
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
}) 