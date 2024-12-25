@echo off 
chcp 65001 > nul 
title 五子棋游戏服务器 
color 0A 
echo ================================ 
echo      五子棋游戏启动器 v1.0 
echo ================================ 
echo. 
where node >nul 2>nul 
if %errorlevel% neq 0 ( 
    color 0C 
    echo [错误] 未安装 Node.js 
    echo 请访问 https://nodejs.org/ 下载安装 
    pause 
    exit /b 1 
) 
if not exist "package.json" ( 
    color 0C 
    echo [错误] 找不到项目文件 
    pause 
    exit /b 1 
) 
if not exist "src\server\index.ts" ( 
    color 0C 
    echo [错误] 找不到服务器文件 
    pause 
    exit /b 1 
) 
echo 正在清理环境... 
taskkill /f /im node.exe >nul 2>&1 
timeout /t 1 /nobreak > nul 
if not exist "node_modules" ( 
    echo 正在安装依赖... 
    call npm install 
    if %errorlevel% neq 0 ( 
        color 0C 
        echo [错误] 依赖安装失败 
        pause 
        exit /b 1 
    ) 
) 
start "后端服务器" /min cmd /c "npm run server" 
timeout /t 3 /nobreak > nul 
echo 正在检查服务器状态... 
set /a retries=0 
:check_server 
netstat -ano | findstr ":3001" >nul 
if %errorlevel% neq 0 ( 
    set /a retries+=1 
    if %retries% lss 5 ( 
        timeout /t 1 /nobreak > nul 
        goto check_server 
    ) 
    color 0C 
    echo [错误] 后端服务器启动失败 
    echo 请检查 src\server\index.ts 文件是否正确 
    pause 
    exit /b 1 
) 
echo 正在启动游戏界面... 
start http://localhost:5173 
echo. 
echo 游戏启动成功！请在浏览器中进行游戏 
echo 关闭此窗口即可停止游戏 
echo ================================ 
npm run dev 
taskkill /f /im node.exe >nul 2>&1 
