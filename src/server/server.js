import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 });
const rooms = new Map();

console.log('WebSocket server started on port 3000');

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleGameEvent(ws, data);
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });

  ws.on('close', () => {
    handlePlayerDisconnect(ws);
  });
});

function handleGameEvent(ws, data) {
  switch (data.type) {
    case 'createRoom':
      createRoom(ws);
      break;
      
    case 'joinRoom':
      joinRoom(ws, data.roomId);
      break;
      
    case 'leaveRoom':
      leaveRoom(ws, data.roomId);
      break;
      
    case 'makeMove':
      handleMove(ws, data);
      break;
      
    case 'surrender':
      handleSurrender(ws, data);
      break;
      
    case 'timeUp':
      handleTimeUp(ws, data);
      break;
  }
}

function createRoom(ws) {
  const roomId = Math.random().toString(36).substring(2, 8);
  rooms.set(roomId, {
    players: [ws],
    board: Array(15).fill(null).map(() => Array(15).fill(null)),
    currentPlayer: 'black'
  });
  
  ws.roomId = roomId;
  ws.send(JSON.stringify({
    type: 'roomCreated',
    roomId
  }));
}

function joinRoom(ws, roomId) {
  const room = rooms.get(roomId);
  
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '房间不存在'
    }));
    return;
  }
  
  if (room.players.length >= 2) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '房间已满'
    }));
    return;
  }
  
  room.players.push(ws);
  ws.roomId = roomId;
  
  // 通知所有玩家游戏开始
  room.players.forEach(player => {
    player.send(JSON.stringify({
      type: 'gameStart'
    }));
  });
}

function leaveRoom(ws, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const index = room.players.indexOf(ws);
  if (index !== -1) {
    room.players.splice(index, 1);
  }
  
  if (room.players.length === 0) {
    rooms.delete(roomId);
  } else {
    // 通知其他玩家
    room.players.forEach(player => {
      player.send(JSON.stringify({
        type: 'playerLeft'
      }));
    });
  }
  
  ws.roomId = null;
}

function handleMove(ws, data) {
  const room = rooms.get(data.roomId);
  if (!room) return;
  
  const { row, col } = data;
  if (room.board[row][col]) return;
  
  // 确保是当前玩家的回合
  const playerIndex = room.players.indexOf(ws);
  const isBlackTurn = room.currentPlayer === 'black';
  if ((playerIndex === 0 && !isBlackTurn) || (playerIndex === 1 && isBlackTurn)) {
    return;
  }
  
  // 更新棋盘
  room.board[row][col] = room.currentPlayer;
  const nextPlayer = room.currentPlayer === 'black' ? 'white' : 'black';
  room.currentPlayer = nextPlayer;
  
  // 广播移动信息
  room.players.forEach(player => {
    player.send(JSON.stringify({
      type: 'moveMade',
      row,
      col,
      color: room.currentPlayer === 'black' ? 'white' : 'black', // 修正颜色
      nextPlayer
    }));
  });
  
  // 检查获胜
  if (checkWin(room.board, row, col)) {
    room.players.forEach(player => {
      player.send(JSON.stringify({
        type: 'gameOver',
        message: `${room.currentPlayer === 'black' ? '白子' : '黑子'}获胜！`
      }));
    });
    rooms.delete(data.roomId);
  }
}

function handlePlayerDisconnect(ws) {
  if (ws.roomId) {
    leaveRoom(ws, ws.roomId);
  }
}

function checkWin(board, row, col) {
  const directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 右下斜
    [1, -1]   // 左下斜
  ];
  
  const color = board[row][col];
  
  return directions.some(([dx, dy]) => {
    let count = 1;
    
    // 正向检查
    for (let i = 1; i <= 4; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) break;
      if (board[newRow][newCol] !== color) break;
      count++;
    }
    
    // 反向检查
    for (let i = 1; i <= 4; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) break;
      if (board[newRow][newCol] !== color) break;
      count++;
    }
    
    return count >= 5;
  });
} 

function handleSurrender(ws, data) {
  const room = rooms.get(data.roomId);
  if (!room) return;
  
  const playerIndex = room.players.indexOf(ws);
  const player = playerIndex === 0 ? 'black' : 'white';
  
  room.players.forEach(player => {
    player.send(JSON.stringify({
      type: 'surrender',
      player
    }));
  });
  
  rooms.delete(data.roomId);
}

function handleTimeUp(ws, data) {
  const room = rooms.get(data.roomId);
  if (!room) return;
  
  room.players.forEach(player => {
    player.send(JSON.stringify({
      type: 'timeUp',
      player: data.player
    }));
  });
  
  rooms.delete(data.roomId);
} 