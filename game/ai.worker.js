self.onmessage = function(e) {
    const { board, depth, currentPlayer } = e.data;
    const bestMove = findBestMove(board, depth, currentPlayer);
    self.postMessage(bestMove);
};

function findBestMove(board, depth, currentPlayer) {
    // 移动 AI 类中的计算逻辑到这里
    // ... AI 计算代码
} 