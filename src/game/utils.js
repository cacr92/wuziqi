/**
 * 计算鼠标点击位置对应的棋盘行列
 * @param {Number} x - 鼠标点击的 X 坐标
 * @param {Number} y - 鼠标点击的 Y 坐标
 * @param {Object} game - 游戏实例
 * @returns {Object} 行列信息
 */
export function getBoardPosition(x, y, game) {
    // 计算距离最近的交叉点
    const col = Math.floor((x - game.margin + game.cellSize / 2) / game.cellSize);
    const row = Math.floor((y - game.margin + game.cellSize / 2) / game.cellSize);

    // 检查是否在有效范围内
    // 检查点击是否在有效的落子范围内（交叉点附近）
    const centerX = game.margin + col * game.cellSize;
    const centerY = game.margin + row * game.cellSize;
    const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    // 如果点击位置距离交叉点太远，返回无效位置
    if (distance > game.cellSize / 2) {
        return { row: -1, col: -1 };
    }

    if (col >= 0 && col < game.boardSize && row >= 0 && row < game.boardSize) {
        return { row, col };
    }
    return { row: -1, col: -1 };
} 