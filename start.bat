@echo off
chcp 65001 >nul

title 五子棋游戏启动器
color 0A

:: 检查 Node.js 环境
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未安装 Node.js
    pause
    exit /b 1
)

:: 检查依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

:: 清理缓存
echo 正在清理缓存...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "dist" rmdir /s /q "dist"

:: 启动开发服务器
echo 正在启动开发服务器...
npm run dev

pause
