@echo off
chcp 65001 >nul

title 五子棋游戏启动器
color 0A

:: 清理缓存
echo 正在清理缓存...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "dist" rmdir /s /q "dist"

:: 启动开发服务器
echo 正在启动开发服务器...
npm run dev

pause
