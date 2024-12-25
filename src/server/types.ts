import type { Server as HttpServer } from 'http'
import type { Socket as NetSocket } from 'net'
import type { Server as IOServer, Socket as IOSocket } from 'socket.io'
import type { PlayerColor } from '../types'

export interface SocketServer extends HttpServer {
  io?: IOServer
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer
}

export interface ServerSocket extends IOSocket {
  data: {
    roomId?: string
    color?: PlayerColor
  }
}

export interface GameRoom {
  id: string
  players: {
    black?: string
    white?: string
  }
  board: (PlayerColor | null)[][]
  currentPlayer: PlayerColor
  lastMove?: {
    row: number
    col: number
  }
} 