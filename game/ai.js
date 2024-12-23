export class AI {
    constructor(game) {
        this.game = game;
        this.maxDepth = 2; // 默认搜索深度
        this.isThinking = false;
        this.worker = new Worker('game/ai.worker.js');
        this.worker.onmessage = (e) => {
            const bestMove = e.data;
            if (bestMove) {
                this.executeBestMove(bestMove);
            }
        };
    }

    setDifficulty(difficulty) {
        // 根据难度设置搜索深度
        switch(difficulty) {
            case 'easy':
                this.maxDepth = 2;
                break;
            case 'medium':
                this.maxDepth = 4;
                break;
            case 'hard':
                this.maxDepth = 6;
                break;
        }
    }

    computerMove() {
        if (this.isThinking) return;
        this.isThinking = true;

        this.worker.postMessage({
            board: this.game.gameState.board,
            depth: this.maxDepth,
            currentPlayer: this.game.gameState.currentPlayer
        });
    }

    executeBestMove(bestMove) {
        setTimeout(() => {
            this.isThinking = false;
            this.game.makeMove(bestMove.row, bestMove.col);
        }, 500);
    }

    getBestMove() {
        // 如果是第一步，选择靠近中心的位置
        if (this.game.gameState.history.length === 0) {
            const center = Math.floor(this.game.boardSize / 2);
            return { row: center, col: center };
        }

        // 简单的防守策略：检查玩家最后一步
        const lastMove = this.game.gameState.lastMove;
        if (lastMove) {
            // 检查周围是否需要防守
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            
            for (const [dx, dy] of directions) {
                const newRow = lastMove.row + dx;
                const newCol = lastMove.col + dy;
                
                if (newRow >= 0 && newRow < this.game.boardSize &&
                    newCol >= 0 && newCol < this.game.boardSize &&
                    !this.game.gameState.board[newRow][newCol]) {
                    return { row: newRow, col: newCol };
                }
            }
        }

        // 获取所有可用的移动位置
        const availableMoves = [];
        for (let i = 0; i < this.game.boardSize; i++) {
            for (let j = 0; j < this.game.boardSize; j++) {
                if (!this.game.gameState.board[i][j]) {
                    availableMoves.push({ row: i, col: j });
                }
            }
        }

        // 随机选择一个位置
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    minimax(depth, isMaximizing, alpha, beta) {
        if (depth >= this.maxDepth || this.game.checkWinner() !== null) {
            return this.evaluateBoard();
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let i = 0; i < this.game.boardSize; i++) {
                for (let j = 0; j < this.game.boardSize; j++) {
                    if (!this.game.gameState.board[i][j]) {
                        this.game.gameState.board[i][j] = this.game.gameState.currentPlayer;
                        const score = this.minimax(depth + 1, false, alpha, beta);
                        this.game.gameState.board[i][j] = null;
                        maxScore = Math.max(maxScore, score);
                        alpha = Math.max(alpha, score);
                        if (beta <= alpha) break;
                    }
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let i = 0; i < this.game.boardSize; i++) {
                for (let j = 0; j < this.game.boardSize; j++) {
                    if (!this.game.gameState.board[i][j]) {
                        this.game.gameState.board[i][j] = this.game.gameState.currentPlayer === 'black' ? 'white' : 'black';
                        const score = this.minimax(depth + 1, true, alpha, beta);
                        this.game.gameState.board[i][j] = null;
                        minScore = Math.min(minScore, score);
                        beta = Math.min(beta, score);
                        if (beta <= alpha) break;
                    }
                }
            }
            return minScore;
        }
    }

    evaluateBoard() {
        // 简单的评估函数
        const winner = this.game.checkWinner();
        if (winner === this.game.gameState.currentPlayer) {
            return 1000;
        } else if (winner === (this.game.gameState.currentPlayer === 'black' ? 'white' : 'black')) {
            return -1000;
        }
        return 0;
    }

    destroy() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
} 