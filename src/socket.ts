import { io, Socket } from 'socket.io-client'
import type { Board, PlayerColor } from './types'

interface ServerToClientEvents {
  room_created: (data: { roomId: string }) => void
  room_joined: (data: { color: PlayerColor }) => void
  game_start: () => void
  move: (data: {
    row: number
    col: number
    color: PlayerColor
    nextPlayer: PlayerColor
  }) => void
  player_left: () => void
  error: (message: string) => void
}

interface ClientToServerEvents {
  create_room: () => void
  join_room: (data: { roomId: string }) => void
  make_move: (data: {
    roomId: string
    move: { row: number; col: number }
  }) => void
  leave_room: (data: { roomId: string }) => void
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SOCKET_URL,
  {
    autoConnect: false,
    transports: ['websocket']
  }
)

// Socket event handlers
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error)
})

socket.on('disconnect', () => {
  console.log('Socket disconnected')
  // 自动重连
  setTimeout(() => {
    if (!socket.connected) {
      socket.connect()
    }
  }, 5000)
})

// Socket actions
export const createRoom = () => {
  socket.emit('create_room')
}

export const joinRoom = (roomId: string) => {
  socket.emit('join_room', { roomId })
}

export const makeMove = (roomId: string, row: number, col: number) => {
  socket.emit('make_move', {
    roomId,
    move: { row, col }
  })
}

export const leaveRoom = (roomId: string) => {
  socket.emit('leave_room', { roomId })
} 