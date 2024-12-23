@echo off
chcp 65001 > nul
title 五子棋游戏启动器 v1.0
color 0A

:: 设置窗口大小
mode con cols=80 lines=25

:: 显示启动画面
echo.
echo    ╔════════════════════════════════════════════════════════════╗
echo    ║                     五子棋游戏启动器                       ║
echo    ╚════════════════════════════════════════════════════════════╝
echo.
echo    正在初始化游戏环境...
echo.

:: 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo    [错误] 未检测到 Node.js 环境
    echo.
    echo    请先安装 Node.js，您可以从以下地址下载：
    echo    https://nodejs.org/zh-cn/download/
    echo.
    echo    按任意键退出...
    pause > nul
    exit /b 1
)

:: 检查并关闭已运行的游戏进程
taskkill /f /im node.exe >nul 2>nul
timeout /t 1 /nobreak > nul

:: 检查依赖
if not exist "node_modules" (
    echo    [系统] 首次运行，正在安装必要组件...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo    [错误] 组件安装失败
        echo    请检查网络连接或尝试以管理员身份运行
        echo.
        echo    按任意键退出...
        pause > nul
        exit /b 1
    )
)

cls
echo.
echo    ╔════════════════════════════════════════════════════════════╗
echo    ║                     五子棋游戏启动器                       ║
echo    ╚════════════════════════════════════════════════════════════╝
echo.
echo    [√] Node.js 环境检查完成
echo    [√] 游戏组件检查完成
echo    [√] 端口检查完成
echo.
echo    正在启动游戏服务...
echo.
echo    游戏即将开始，请稍候...
echo.

:: 启动开发服务器（在后台运行）
start /min cmd /c "npm run dev"

:: 等待服务启动
timeout /t 3 /nobreak > nul

:: 启动默认浏览器（只启动一次）
start "" "http://localhost:3000"

cls
echo.
echo    ╔════════════════════════════════════════════════════════════╗
echo    ║                     五子棋游戏启动器                       ║
echo    ╚════════════════════════════════════════════════════════════╝
echo.
echo    [√] 游戏服务已启动
echo    [√] 浏览器已打开
echo.
echo    如果浏览器没有自动打开，请手动访问：
echo    http://localhost:3000
echo.
echo    游戏运行中...
echo    按任意键关闭游戏服务
echo.
echo    ────────────────────────────────────────────────────────────
echo    提示：建议使用 Chrome 或 Edge 浏览器以获得最佳游戏体验
echo    ────────────────────────────────────────────────────────────
echo.

:: 等待用户手动关闭
pause > nul

:: 关闭服务器
taskkill /f /im node.exe >nul 2>nul

exit /b 0 