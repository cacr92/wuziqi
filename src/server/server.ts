import WebSocket, { WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid'

const wss = new WebSocketServer({ port: 8080 })

interface GameRoom {
  id: string
  players: {
    black?: WebSocket.WebSocket
    white?: WebSocket.WebSocket
  }
  gameState: {
    board: (string | null)[][]
    currentPlayer: 'black' | 'white'
  }
}

const rooms: Map<string, GameRoom> = new Map()
const waitingPlayers: WebSocket[] = []

wss.on('connection', (ws) => {
  console.log('New client connected')

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString())
    
    switch (data.type) {
      case 'find_match':
        handleMatchmaking(ws)
        break
      case 'move':
        handleMove(ws, data.roomId, data.move)
        break
      case 'surrender':
        handleSurrender(ws, data.roomId)
        break
      case 'leave_room':
        handleLeaveRoom(ws, data.roomId)
        break
    }
  })

  ws.on('close', () => {
    handlePlayerDisconnect(ws)
  })
})

function handleMatchmaking(ws: WebSocket) {
  if (waitingPlayers.length > 0) {
    const opponent = waitingPlayers.shift()!
    const roomId = uuidv4()
    
    const room: GameRoom = {
      id: roomId,
      players: {
        black: ws,
        white: opponent
      },
      gameState: {
        board: Array(15).fill(null).map(() => Array(15).fill(null)),
        currentPlayer: 'black'
      }
    }
    
    rooms.set(roomId, room)
    
    ws.send(JSON.stringify({ type: 'game_start', color: 'black', roomId }))
    opponent.send(JSON.stringify({ type: 'game_start', color: 'white', roomId }))
  } else {
    waitingPlayers.push(ws)
    ws.send(JSON.stringify({ type: 'waiting' }))
  }
}

function handleMove(ws: WebSocket, roomId: string, move: { row: number, col: number }) {
  const room = rooms.get(roomId)
  if (!room) return
  
  const color = room.players.black === ws ? 'black' : 'white'
  if (color !== room.gameState.currentPlayer) return
  
  room.gameState.board[move.row][move.col] = color
  room.gameState.currentPlayer = color === 'black' ? 'white' : 'black'
  
  const moveData = {
    type: 'move',
    move,
    color,
    nextPlayer: room.gameState.currentPlayer
  }
  
  room.players.black?.send(JSON.stringify(moveData))
  room.players.white?.send(JSON.stringify(moveData))
}

function handleSurrender(ws: WebSocket, roomId: string) {
  const room = rooms.get(roomId)
  if (!room) return
  
  const surrenderingColor = room.players.black === ws ? 'black' : 'white'
  const winningColor = surrenderingColor === 'black' ? 'white' : 'black'
  
  const gameEndData = {
    type: 'game_end',
    winner: winningColor,
    reason: 'surrender'
  }
  
  room.players.black?.send(JSON.stringify(gameEndData))
  room.players.white?.send(JSON.stringify(gameEndData))
  
  rooms.delete(roomId)
}

function handleLeaveRoom(ws: WebSocket, roomId: string) {
  const room = rooms.get(roomId)
  if (!room) return
  
  const leavingColor = room.players.black === ws ? 'black' : 'white'
  const winningColor = leavingColor === 'black' ? 'white' : 'black'
  
  const gameEndData = {
    type: 'game_end',
    winner: winningColor,
    reason: 'opponent_left'
  }
  
  room.players.black?.send(JSON.stringify(gameEndData))
  room.players.white?.send(JSON.stringify(gameEndData))
  
  rooms.delete(roomId)
}

function handlePlayerDisconnect(ws: WebSocket) {
  const waitingIndex = waitingPlayers.indexOf(ws)
  if (waitingIndex !== -1) {
    waitingPlayers.splice(waitingIndex, 1)
    return
  }
  
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.black === ws || room.players.white === ws) {
      handleLeaveRoom(ws, roomId)
      break
    }
  }
} 