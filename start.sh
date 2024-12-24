#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 显示欢迎信息
echo -e "${GREEN}=================================${NC}"
echo -e "${YELLOW}    五子棋游戏启动器 v1.0${NC}"
echo -e "${GREEN}=================================${NC}"
echo

# 检查必要的工具
echo -e "${YELLOW}正在检查环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未安装 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

# 检查依赖
echo -e "${YELLOW}正在检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}正在安装依赖...${NC}"
    if ! npm install; then
        echo -e "${RED}错误: 依赖安装失败${NC}"
        exit 1
    fi
fi

# 启动开发服务器
echo -e "${YELLOW}正在启动开发服务器...${NC}"
echo -e "${GREEN}按 Ctrl+C 可以停止服务器${NC}"
echo

# 定义打开浏览器的函数
open_browser() {
    sleep 3
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:4174
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:4174 || sensible-browser http://localhost:4174 || x-www-browser http://localhost:4174
    fi
}

# 在后台运行打开浏览器的函数
open_browser &

# 尝试启动服务器
if ! npm run dev; then
    echo -e "${RED}错误: 服务器启动失败${NC}"
    exit 1
fi 