@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: 设置标题
title 五子棋游戏启动器

:: 颜色定义
set "GREEN=\033[32m"
set "YELLOW=\033[33m"
set "RED=\033[31m"
set "RESET=\033[0m"

:: 显示欢迎信息
echo %GREEN%=================================%RESET%
echo %YELLOW%    五子棋游戏启动器 v1.0%RESET%
echo %GREEN%=================================%RESET%
echo.

:: 检查必要的工具
echo %YELLOW%正在检查环境...%RESET%
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%错误: 未安装 Node.js，请先安装 Node.js%RESET%
    pause
    exit /b 1
)

:: 检查依赖
echo %YELLOW%正在检查依赖...%RESET%
if not exist "node_modules" (
    echo %YELLOW%正在安装依赖...%RESET%
    call npm install
    if !errorlevel! neq 0 (
        echo %RED%错误: 依赖安装失败%RESET%
        pause
        exit /b 1
    )
)

:: 启动开发服务器
echo %YELLOW%正在启动开发服务器...%RESET%
echo %GREEN%按 Ctrl+C 可以停止服务器%RESET%
echo.

:: 设置延迟启动浏览器的命令
powershell -Command "Start-Sleep -Seconds 3; Start-Process 'http://127.0.0.1:4173'" >nul 2>nul

:: 尝试启动服务器
call npm run dev

if %errorlevel% neq 0 (
    echo %RED%错误: 服务器启动失败%RESET%
    pause
    exit /b 1
)

endlocal
