const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('服务器错误，请稍后重试');
});

// 检查文件是否存在的中间件
const checkFile = (filepath) => {
    return (req, res, next) => {
        if (fs.existsSync(filepath)) {
            next();
        } else {
            res.status(404).send('文件未找到');
        }
    };
};

// 静态文件服务
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// 处理对根路径的请求
app.get('/', checkFile(path.join(__dirname, '..', 'index.html')), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 处理音频文件请求
app.get('/audio/:file', (req, res) => {
    const audioFile = path.join(__dirname, '..', 'audio', req.params.file);
    if (fs.existsSync(audioFile)) {
        res.sendFile(audioFile);
    } else {
        res.status(404).send('音频文件未找到');
    }
});

// 处理 404 错误
app.use((req, res) => {
    res.status(404).send('页面未找到');
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`端口 ${port} 已被占用`);
    } else {
        console.error('服务器启动失败:', err);
    }
});

// 全局错误处理
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
}); 