import { Server } from 'socket.io'

const rooms = new Map()

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log('Client connected:', socket.id)

      // 创建房间
      socket.on('createRoom', () => {
        const roomId = Math.random().toString(36).substring(2, 8)
        rooms.set(roomId, {
          players: [socket.id],
          currentPlayer: 'black',
          board: Array(15).fill(null).map(() => Array(15).fill(null))
        })
        socket.join(roomId)
        socket.emit('roomCreated', { roomId })
      })

      // 加入房间
      socket.on('joinRoom', (roomId) => {
        const room = rooms.get(roomId)
        if (room && room.players.length < 2) {
          room.players.push(socket.id)
          socket.join(roomId)
          io.to(roomId).emit('gameStart', {
            players: room.players,
            currentPlayer: 'black'
          })
        } else {
          socket.emit('joinError', '房间不存在或已满')
        }
      })

      // 处理���子
      socket.on('makeMove', ({ roomId, row, col }) => {
        const room = rooms.get(roomId)
        if (room && room.players.indexOf(socket.id) !== -1) {
          const playerIndex = room.players.indexOf(socket.id)
          const color = playerIndex === 0 ? 'black' : 'white'
          
          if (color === room.currentPlayer && !room.board[row][col]) {
            room.board[row][col] = color
            room.currentPlayer = room.currentPlayer === 'black' ? 'white' : 'black'
            
            io.to(roomId).emit('moveMade', {
              row,
              col,
              color,
              currentPlayer: room.currentPlayer
            })
          }
        }
      })

      // 处理断开连接
      socket.on('disconnect', () => {
        for (const [roomId, room] of rooms.entries()) {
          const playerIndex = room.players.indexOf(socket.id)
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1)
            if (room.players.length === 0) {
              rooms.delete(roomId)
            } else {
              io.to(roomId).emit('playerLeft')
            }
          }
        }
      })
    })
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler 