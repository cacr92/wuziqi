import { getBoardPosition } from '../game/utils.js';

export function bindUIEvents(game, ai) {
    // 游戏模式选择
    document.getElementById('pvp-btn').addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('pvp-btn').classList.add('selected');
        document.getElementById('difficulty-selector').classList.add('hidden');
    });

    document.getElementById('pve-btn').addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('pve-btn').classList.add('selected');
        document.getElementById('difficulty-selector').classList.remove('hidden');
    });

    // 难度选择
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // 开始游戏按钮
    document.getElementById('start-btn').addEventListener('click', () => {
        console.log('Start button clicked');
        const mode = document.querySelector('.mode-btn.selected').id === 'pvp-btn' ? 'pvp' : 'pve';
        const difficulty = document.querySelector('.difficulty-btn.selected')?.dataset.level || 'easy';
        console.log('Starting game with mode:', mode, 'difficulty:', difficulty);
        game.startGame(mode, difficulty);
    });

    // 棋盘尺寸选择
    document.getElementById('board-size').addEventListener('change', (e) => {
        game.setBoardSize(parseInt(e.target.value));
    });

    // 玩家棋子颜色选择 
    document.getElementById('player-color').addEventListener('change', (e) => {
        game.setPlayerColor(e.target.value);
    });

    // 时限选择
    document.getElementById('time-limit').addEventListener('input', (e) => {
        game.setTimeLimit(parseInt(e.target.value));
    });

    // 悔棋按钮
    document.getElementById('undo-btn').addEventListener('click', () => {
        game.undo();
    });

    // 重新开始按钮
    document.getElementById('restart-btn').addEventListener('click', () => {
        game.restart();
    });

    // 认输按钮
    document.getElementById('surrender-btn').addEventListener('click', () => {
        game.surrender();
    });

    // 返回主菜单按钮
    document.getElementById('back-btn').addEventListener('click', () => {
        game.backToMenu();
    });

    // 提示按钮
    document.getElementById('hint-btn').addEventListener('click', () => {
        const bestMove = game.ai.getBestMove();
        if (bestMove) {
            game.highlightBestMove(bestMove);
        }
    });

    // 帮助按钮
    document.getElementById('help-btn').addEventListener('click', () => {
        alert("游戏规则：\n1. 玩家轮流在棋盘上落子。\n2. 先连成五子者获胜。\n3. 点击提示按钮获取最佳落子建议。");
    });

    // 棋盘背景颜色选择
    document.getElementById('background-color').addEventListener('input', (e) => {
        game.canvas.style.backgroundColor = e.target.value;
    });

    // 页面点击事件，用于落子
    game.canvas.addEventListener('click', (e) => {
        const rect = game.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const { row, col } = getBoardPosition(x, y, game);

        if (row >= 0 && row < game.boardSize && col >= 0 && col < game.boardSize) {
            game.makeMove(row, col);
        }
    });

    window.addEventListener('load', () => {
        game.drawBoard();
    });

    // 音效和音乐控制
    document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
        const clickSound = document.getElementById('click-sound');
        clickSound.muted = !e.target.checked;
    });

    document.getElementById('music-toggle')?.addEventListener('change', (e) => {
        const backgroundMusic = document.getElementById('background-music');
        if (e.target.checked) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    });
} 