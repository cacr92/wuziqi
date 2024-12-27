@echo off
chcp 65001 >nul

echo 正在安装服务器依赖...
npm install

echo 正在启动服务器...
npm run dev 