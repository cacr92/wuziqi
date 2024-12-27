@echo off
echo 正在清理 node_modules...

:: 结束所有 Node.js 相关进程
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
powershell -Command "Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force"

:: 等待进程完全结束
timeout /t 2 /nobreak >nul

:: 使用 robocopy 删除目录（这是一个更可靠的方法）
if exist node_modules (
    robocopy node_modules node_modules_empty /purge /NFL /NDL /NJH /NJS /nc /ns /np
    rmdir /s /q node_modules
    rmdir /s /q node_modules_empty
)

echo 清理完成！
echo 现在运行 npm install...

:: 重新安装依赖
npm install

echo 安装完成！按任意键继续...
pause >nul 