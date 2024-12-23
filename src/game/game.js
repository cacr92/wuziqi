import { Timer } from './timer.js';
import { AI } from './ai.js';
import { getBoardPosition } from './utils.js';

export class GomokuGame {
    constructor() {
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.canvas = document.getElementById('gameBoard');
        this.canvas.setAttribute('role', 'img');
        this.canvas.setAttribute('aria-label', '五子棋棋盘');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 15;
        this.cellSize = 35;
        this.margin = 20;

        this.currentFocus = { row: 7, col: 7 }; // 默认焦点位置
        this.setupKeyboardNavigation();
        this.setupClickEvents();

        // 设置画布大小
        const size = 560;
        this.canvas.width = size;
        this.canvas.height = size;

        // 游戏状态
        this.gameState = {
            board: Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null)),
            currentPlayer: 'black', // 'black' 或 'white'
            gameMode: null, // 'pvp' 或 'pve'
            difficulty: null, // 'easy', 'medium', 或 'hard'
            gameOver: false,
            history: [], // 用于悔棋
            lastMove: null,
            announcement: '' // 用于屏幕阅读器公告
        };

        // 初始化计时器
        this.timer = new Timer(this);

        this.wins = {
            black: 0,
            white: 0
        };

        this.gameHistory = [];

        this.timeLimit = parseInt(document.getElementById('time-limit').value) || 30;

        // 初始化音效
        this.sounds = {
            place: document.getElementById('click-sound'),
            win: document.getElementById('click-sound')
        };

        this.isProcessingMove = false; // 添加移动状态标志
        this.ai = null;
        // 初始化 AI
        this.setAI(new AI(this));

        // 使用 WeakMap 存储棋盘状态，提高性能
        this.boardCache = new WeakMap();
        // 使用 requestAnimationFrame 优化重绘
        this.animationFrameId = null;
        this.needsRedraw = false;
    }

    setupKeyboardNavigation() {
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.setAttribute('role', 'application');
        this.canvas.setAttribute('aria-label', '五子棋棋盘');
        this.canvas.addEventListener('keydown', (e) => {
            if (this.gameState.gameOver) return;

            const { row, col } = this.currentFocus;
            let newRow = row;
            let newCol = col;

            switch (e.key) {
                case 'ArrowUp':
                    newRow = Math.max(0, row - 1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    newRow = Math.min(this.boardSize - 1, row + 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    newCol = Math.max(0, col - 1);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    newCol = Math.min(this.boardSize - 1, col + 1);
                    e.preventDefault();
                    break;
                case 'Enter':
                case ' ':
                    this.makeMove(row, col);
                    e.preventDefault();
                    break;
            }

            if (newRow !== row || newCol !== col) {
                this.currentFocus = { row: newRow, col: newCol };
                this.drawBoard();
                this.announcePosition();
            }
        });
    }

    announcePosition() {
        const row = this.currentFocus.row;
        const col = this.currentFocus.col;
        const piece = this.gameState.board[row][col];
        const position = `位置：第${row + 1}行，第${col + 1}列`;
        const status = piece ? `已有${piece === 'black' ? '黑' : '白'}子` : '空位';
        this.gameState.announcement = `${position}，${status}。使用方向键移动，空格键或回车键落子。`;
        
        // 更新 aria-live 区域
        const announcer = document.getElementById('game-announcer');
        if (announcer) {
            announcer.textContent = this.gameState.announcement;
        }
    }

    setAI(aiInstance) {
        this.ai = aiInstance;
    }

    startGame(mode, difficulty = 'easy') {
        console.log('Starting game with mode:', mode, 'and difficulty:', difficulty);
        this.gameState.gameMode = mode;
        this.gameState.difficulty = difficulty;
        
        // 重置游戏状态
        this.reset();
        
        if (this.ai) {
            this.ai.setDifficulty(difficulty);
        }

        // 切换到游戏界面
        this.welcomeScreen.classList.remove('active');
        this.welcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.gameScreen.classList.add('active');
        console.log('Switched to game screen');

        // 开始计时
        this.timer.start(this.timeLimit);

        // 绘制棋盘
        this.drawBoard();

        // 如果是人机对战模式且AI是黑子，则AI先手
        if (mode === 'pve') {
            const playerColor = document.getElementById('player-color').value;
            console.log('Player color:', playerColor);
            if (playerColor === 'white') {
                console.log('AI making first move...');
                this.isProcessingMove = false;  // 确保 AI 可以落子
                setTimeout(() => {
                    if (this.ai) {
                        this.ai.computerMove();
                    }
                }, 500);
            }
        }
    }

    makeMove(row, col) {
        // 防止重复落子
        if (this.isProcessingMove) {
            console.log('Move in progress, please wait...');
            return;
        }

        // 获取玩家颜色
        const playerColor = document.getElementById('player-color').value;

        // 在人机对战模式下，��查是否是玩家的回合
        if (this.gameState.gameMode === 'pve' && 
            this.gameState.currentPlayer !== playerColor) {
            console.log('Not player turn');
            return;
        }

        // 设置处理中状态
        this.isProcessingMove = true;

        // 检查是否是有效的落子位置
        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
            this.isProcessingMove = false;
            return;
        }

        // 检查该位置是否已经有棋子
        if (this.gameState.board[row][col] || this.gameState.gameOver) {
            this.isProcessingMove = false;
            return;
        }

        console.log(`Making move at row: ${row}, col: ${col}`);

        // 播放落子音效
        try {
            this.sounds.place.play().catch(err => {
                console.warn('无法播放落子音效:', err);
            });
        } catch (err) {
            console.warn('音效播放失败:', err);
        }

        // 更新棋盘状态
        this.gameState.board[row][col] = this.gameState.currentPlayer;
        this.gameState.lastMove = { row, col };
        this.gameState.history.push({ row, col, player: this.gameState.currentPlayer });

        // 播放动画并更新显示
        this.animatePiece(row, col, this.gameState.currentPlayer);
        this.announceMove(row, col);

        // 检查是否获胜
        if (this.checkWinner() !== null) {
            this.gameOver();
            this.isProcessingMove = false;
            return;
        }

        // 切换玩家
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'black' ? 'white' : 'black';
        
        // 更新显示当前玩家
        const currentPlayerText = this.gameState.currentPlayer === 'black' ? '黑子' : '白子';
        document.getElementById('current-player').textContent = `当前回合: ${currentPlayerText}`;
        document.getElementById('current-player').setAttribute('aria-label', `当前回合是${currentPlayerText}`);

        // 重置处理状态
        this.isProcessingMove = false;

        // 如果是人机对战且轮到 AI，则执行 AI 的移动
        if (this.gameState.gameMode === 'pve' && 
            this.gameState.currentPlayer !== playerColor) {
            console.log('AI turn, making move...');
            if (this.ai) {
                this.ai.computerMove();
            }
        }

        // 使用缓存检查位置是否已经有棋子
        const cacheKey = `${row}-${col}`;
        if (this.boardCache.has(cacheKey)) {
            return;
        }

        // 更新缓存
        this.boardCache.set(cacheKey, this.currentPlayer);

        // 只在必要时重绘
        if (this.needsRedraw) {
            this.drawBoard();
        }
    }

    announceMove(row, col) {
        const player = this.gameState.currentPlayer === 'black' ? '黑子' : '白子';
        const announcement = `${player}落子在第${row + 1}行，第${col + 1}列`;
        const announcer = document.getElementById('game-announcer');
        if (announcer) {
            announcer.textContent = announcement;
        }
    }

    undo() {
        if (this.gameState.history.length === 0 || this.gameState.gameOver) return;

        const lastMove = this.gameState.history.pop();
        this.gameState.board[lastMove.row][lastMove.col] = null;
        this.gameState.currentPlayer = lastMove.player;

        // 更新显示
        this.drawBoard();
        document.getElementById('current-player').textContent =
            `当前回合: ${this.gameState.currentPlayer === 'black' ? '黑子' : '白子'}`;
    }

    gameOver() {
        this.gameState.gameOver = true;
        this.sounds.win.play();

        // 记录游戏结果
        this.gameHistory.push({
            winner: this.gameState.currentPlayer,
            date: new Date().toLocaleString()
        });

        // 更新胜负记录
        if (this.gameState.currentPlayer === 'black') {
            this.wins.black++;
        } else if (this.gameState.currentPlayer === 'white') {
            this.wins.white++;
        }

        // 停止计时器
        this.timer.stop();

        // 显示获胜信息
        setTimeout(() => {
            const winner = this.checkWinner();
            let message;
            if (winner === 'black') {
                message = '游戏结束！黑子获胜！是否重玩？';
            } else if (winner === 'white') {
                message = '游戏结束！白子获胜！是否重玩？';
            } else {
                message = '游戏结束！平局！是否重玩？';
            }
            const replay = confirm(message);
            if (replay) {
                this.restart();
            } else {
                console.log(this.gameHistory); // 打印游戏记录
                alert(`胜负记录:\n黑子: ${this.wins.black} 胜\n白子: ${this.wins.white} 胜\n胜率: 黑子 ${this.wins.black + this.wins.white === 0 ? '0.00' : ((this.wins.black / (this.wins.black + this.wins.white)) * 100).toFixed(2)}%`);
            }
        }, 100);
    }

    restart() {
        this.gameState.gameOver = false;
        this.gameState.currentPlayer = 'black';
        this.gameState.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.gameState.history = [];
        this.gameState.lastMove = null;
        this.wins = {
            black: 0,
            white: 0
        };
        this.gameHistory = [];
        this.timer.stop();
        this.timer.start(this.timeLimit);
        this.drawBoard();
    }

    surrender() {
        // 玩家认输,另一个玩家获
        this.gameState.currentPlayer = this.gameState.gameMode === 'pvp' ? (this.gameState.currentPlayer === 'black' ? 'white' : 'black') : 'white';
        this.gameOver();
    }

    backToMenu() {
        console.log('Returning to main menu');
        this.gameState.gameMode = null;
        this.gameState.difficulty = null;
        this.gameState.gameOver = false;
        this.gameState.currentPlayer = 'black';
        this.gameState.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.gameState.history = [];
        this.gameState.lastMove = null;
        this.wins = {
            black: 0,
            white: 0
        };
        this.gameHistory = [];
        this.timer.stop();
        this.drawBoard();
        this.gameScreen.classList.remove('active');
        this.gameScreen.classList.add('hidden');
        this.welcomeScreen.classList.remove('hidden');
        this.welcomeScreen.classList.add('active');
        console.log('Switched to welcome screen');
    }

    highlightBestMove(move) {
        const x = this.margin + move.col * this.cellSize + this.cellSize / 2;
        const y = this.margin + move.row * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2.5;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    checkWinner() {
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const player = this.gameState.board[i][j];
                if (player) {
                    for (const [dx, dy] of directions) {
                        let count = 0;
                        for (let k = 0; k < 5; k++) {
                            const x = i + k * dx;
                            const y = j + k * dy;
                            if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) break;
                            if (this.gameState.board[x][y] === player) count++;
                        }
                        if (count === 5) return player;
                    }
                }
            }
        }

        if (this.gameState.history.length === this.boardSize * this.boardSize) {
            return 'tie';
        }

        return null;
    }

    drawBoard() {
        const size = this.canvas.width;

        // 计算格子大小
        this.cellSize = (size - 2 * this.margin) / (this.boardSize - 1);
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        // 绘制横线
        for (let i = 0; i < this.boardSize; i++) {
            const y = this.margin + i * this.cellSize;
            this.ctx.moveTo(this.margin, y);
            this.ctx.lineTo(this.canvas.width - this.margin, y);
        }
        
        // 绘制竖线
        for (let i = 0; i < this.boardSize; i++) {
            const x = this.margin + i * this.cellSize;
            this.ctx.moveTo(x, this.margin);
            this.ctx.lineTo(x, this.canvas.height - this.margin);
        }
        this.ctx.stroke();
        
        // 绘制天元和星位
        const stars = this.getStarPoints();
        stars.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.margin + point.x * this.cellSize,
                this.margin + point.y * this.cellSize,
                4, 0, Math.PI * 2
            );
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        });
        
        // 绘制已有的棋子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.gameState.board[i][j]) {
                    this.drawPiece(i, j, this.gameState.board[i][j]);
                }
            }
        }
        
        // 绘制最后一手的标记
        if (this.gameState.lastMove) {
            const { row, col } = this.gameState.lastMove;
            const x = this.margin + col * this.cellSize;
            const y = this.margin + row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fill();
        }
    }

    getStarPoints() {
        const points = [];
        if (this.boardSize === 19) {
            // 19路棋盘的星位
            [3, 9, 15].forEach(x => {
                [3, 9, 15].forEach(y => {
                    points.push({x, y});
                });
            });
        } else {
            // 15路棋盘的星位
            [3, 7, 11].forEach(x => {
                [3, 7, 11].forEach(y => {
                    points.push({x, y});
                });
            });
        }
        return points;
    }

    drawPiece(row, col, color) {
        const x = this.margin + col * this.cellSize + this.cellSize / 2;
        const y = this.margin + row * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2.5;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color === 'black' ? '#000' : '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();
    }

    animatePiece(row, col, color) {
        // 简单动画: 高亮下落的棋子
        const x = this.margin + col * this.cellSize + this.cellSize / 2;
        const y = this.margin + row * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2.5;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = color === 'black' ? '#555' : '#aaa';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        setTimeout(() => {
            this.drawPiece(row, col, color);
        }, 200);
    }

    setBoardSize(size) {
        this.boardSize = size;
        this.reset();
    }

    setPlayerColor(color) {
        this.gameState.playerColor = color;
    }

    setTimeLimit(seconds) {
        this.timeLimit = seconds;
    }

    reset() {
        this.gameState.gameOver = false;
        this.gameState.currentPlayer = 'black';
        this.gameState.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.gameState.history = [];
        this.gameState.lastMove = null;
        this.timeLimit = parseInt(document.getElementById('time-limit').value) || 30;
        this.isProcessingMove = false; // 重置移动状态
        this.drawBoard();
    }

    // 添加点击事件处理
    setupClickEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState.gameOver) return;

            const rect = this.canvas.getBoundingClientRect();
            // 计算点击位置相对于画布的实际坐标
            const scale = this.canvas.width / rect.width;
            const x = (e.clientX - rect.left) * scale;
            const y = (e.clientY - rect.top) * scale;

            // 将点击坐标转换为棋盘位置
            const { row, col } = getBoardPosition(x, y, this);
            console.log(`Click at (${x}, ${y}) -> board position: (${row}, ${col})`);

            if (row >= 0 && col >= 0) {
                this.makeMove(row, col);
            }
        });
    }
} 