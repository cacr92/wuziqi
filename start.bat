@echo off
chcp 65001
cls

echo 正在启动五子棋游戏开发服务器...
echo.

:: 获取本机IP地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r "IPv4.*[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*"') do (
    set IP=%%a
)
set IP=%IP:~1%

echo ========================================
echo 在手机上访问项目的方法：
echo.
echo 1. 确保手机和电脑连接同一个WiFi网络
echo 2. 在手机浏览器中访问以下地址：
echo    http://%IP%:3000
echo.
echo 添加到手机主屏幕：
echo 1. 在手机浏览器中打开上述地址
echo 2. 点击浏览器菜单的"添加到主屏幕"选项
echo 3. 根据提示完成安装
echo ========================================
echo.

:: 启动开发服务器
npm run dev

pause 