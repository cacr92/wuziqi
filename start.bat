@echo off
cd /d "%~dp0"

:: 设置控制台属性
chcp 65001 > nul
title 五子棋游戏
color 0A
mode con cols=80 lines=25

echo ================================
echo      五子棋游戏启动器 v1.0
echo ================================
echo.

:: 检查环境
echo 正在检查环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [错误] 未安装 Node.js
    echo 请访问 https://nodejs.org/ 下载安装
    echo 建议选择 LTS 长期支持版本
    pause
    start https://nodejs.org/
    exit /b 1
)

:: 清理环境
echo 正在清理环境...
taskkill /f /im node.exe >nul 2>&1

:: 安装依赖
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [错误] 依赖安装失败
        echo 请检查网络连接或手动运行: npm install
        pause
        exit /b 1
    )
)

:: 启动服务器
echo 正在启动游戏服务...
start /b "" cmd /c "npm run server >nul 2>&1"

:: 等待服务器启动
timeout /t 2 /nobreak > nul

:: 启动游戏
echo 正在启动游戏界面...
echo 游戏启动成功！请在浏览器中进行游戏
echo.
echo 本地访问地址：http://localhost:5173
echo ================================
start http://localhost:5173
npm run dev

:: 退出时清理进程
taskkill /f /im node.exe >nul 2>&1
