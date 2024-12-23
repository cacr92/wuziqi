export function setupAudio() {
    // 预加载所有音效
    const audioFiles = {
        place: new Audio('/audio/place.mp3'),
        win: new Audio('/audio/win.mp3'),
        click: new Audio('/audio/click.mp3')
    };

    // 添加错误处理
    Object.values(audioFiles).forEach(audio => {
        audio.addEventListener('error', (e) => {
            console.warn('音频加载失败:', e);
        });
    });

    // 确保音频可以播放
    Object.values(audioFiles).forEach(audio => {
        audio.load();
        // 移动设备上的自动播放处理
        document.addEventListener('touchstart', () => {
            audio.play().then(() => audio.pause());
        }, { once: true });
    });

    const backgroundMusic = document.getElementById('background-music');
    const soundToggle = document.getElementById('sound-toggle');
    const musicToggle = document.getElementById('music-toggle');

    // 音效播放函数
    const playSound = (type) => {
        if (!soundToggle.checked) return;

        const audio = audioFiles[type];
        if (!audio) return;

        // 重置音频并播放
        audio.currentTime = 0;
        audio.play().catch(err => {
            console.warn('音效播放失败:', err);
        });
    };

    // 导出音效播放函数
    window.playGameSound = playSound;

    // 音效开关
    soundToggle.addEventListener('change', () => {
        const clickSound = document.getElementById('click-sound');
        clickSound.muted = !soundToggle.checked;
    });

    // 背景音乐开关
    musicToggle.addEventListener('change', () => {
        if (musicToggle.checked) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    });

    // 自动播放背景音乐
    backgroundMusic.play();
} 