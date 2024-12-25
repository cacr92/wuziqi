import { createServer } from 'http'
import { Server } from 'socket.io'

interface GameRoom {
  id: string
  players: {
    black?: string
    white?: string
  }
  gameState: {
    board: (string | null)[][]
    currentPlayer: 'black' | 'white'
  }
}

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://你的域名.vercel.app'
      : 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

const rooms = new Map<string, GameRoom>()

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // 创建房间
  socket.on('create_room', () => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const room: GameRoom = {
      id: roomId,
      players: {
        black: socket.id
      },
      gameState: {
        board: Array(15).fill(null).map(() => Array(15).fill(null)),
        currentPlayer: 'black'
      }
    }
    
    rooms.set(roomId, room)
    socket.join(roomId)
    socket.emit('room_created', { roomId })
  })

  // 加入房间
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
    
    const color = !room.players.white ? 'white' : 'black'
    room.players[color] = socket.id
    
    socket.join(roomId)
    socket.emit('room_joined', { color })
    
    if (room.players.black && room.players.white) {
      io.to(roomId).emit('game_start')
    }
  })

  // 离开房间
  socket.on('leave_room', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (!room) return
    
    const leavingColor = room.players.black === socket.id ? 'black' : 'white'
    const winningColor = leavingColor === 'black' ? 'white' : 'black'
    
    io.to(roomId).emit('game_end', {
      winner: winningColor,
      reason: 'opponent_left'
    })
    
    socket.leave(roomId)
    rooms.delete(roomId)
  })

  // 处理移动
  socket.on('move', ({ roomId, move }) => {
    const room = rooms.get(roomId)
    if (!room) return
    
    const color = room.players.black === socket.id ? 'black' : 'white'
    if (color !== room.gameState.currentPlayer) return
    
    const { row, col } = move
    if (room.gameState.board[row][col]) return
    
    room.gameState.board[row][col] = color
    room.gameState.currentPlayer = color === 'black' ? 'white' : 'black'
    
    io.to(roomId).emit('move', {
      move,
      color,
      nextPlayer: room.gameState.currentPlayer
    })
    // 检查获胜
    const checkWin = (board: string[][], row: number, col: number, color: string) => {
      // 检查水平方向
      let count = 0;
      for (let i = Math.max(0, col - 4); i <= Math.min(14, col + 4); i++) {
        if (board[row][i] === color) {
          count++;
          if (count === 5) return true;
        } else {
          count = 0;
        }
      }

      // 检查垂直方向
      count = 0;
      for (let i = Math.max(0, row - 4); i <= Math.min(14, row + 4); i++) {
        if (board[i][col] === color) {
          count++;
          if (count === 5) return true;
        } else {
          count = 0;
        }
      }

      // 检查左上到右下对角线
      count = 0;
      for (let i = -4; i <= 4; i++) {
        const r = row + i;
        const c = col + i;
        if (r >= 0 && r < 15 && c >= 0 && c < 15) {
          if (board[r][c] === color) {
            count++;
            if (count === 5) return true;
          } else {
            count = 0;
          }
        }
      }

      // 检查右上到左下对角线
      count = 0;
      for (let i = -4; i <= 4; i++) {
        const r = row + i;
        const c = col - i;
        if (r >= 0 && r < 15 && c >= 0 && c < 15) {
          if (board[r][c] === color) {
            count++;
            if (count === 5) return true;
          } else {
            count = 0;
          }
        }
      }

      return false;
    };

    if (checkWin(room.gameState.board as string[][], row, col, color)) {
      io.to(roomId).emit('game_end', {
        winner: color,
        reason: 'win'
      })
      rooms.delete(roomId)
    }
  })

  // 认输
  socket.on('surrender', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (!room) return
    
    const surrenderingColor = room.players.black === socket.id ? 'black' : 'white'
    const winningColor = surrenderingColor === 'black' ? 'white' : 'black'
    
    io.to(roomId).emit('game_end', {
      winner: winningColor,
      reason: 'surrender'
    })
    
    rooms.delete(roomId)
  })

  // 超时
  socket.on('time_up', ({ roomId, player }) => {
    const room = rooms.get(roomId)
    if (!room) return
    
    const winningColor = player === 'black' ? 'white' : 'black'
    
    io.to(roomId).emit('game_end', {
      winner: winningColor,
      reason: 'timeout'
    })
    
    rooms.delete(roomId)
  })

  // 断开连接
  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.black === socket.id || room.players.white === socket.id) {
        const leavingColor = room.players.black === socket.id ? 'black' : 'white'
        const winningColor = leavingColor === 'black' ? 'white' : 'black'
        
        io.to(roomId).emit('game_end', {
          winner: winningColor,
          reason: 'opponent_left'
        })
        
        rooms.delete(roomId)
        break
      }
    }
  })
})

const PORT = process.env.WS_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
}) 