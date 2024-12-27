<<<<<<< Updated upstream
# 五子棋游戏

## 项目简介

这是一个基于 Web 技术栈开发的五子棋游戏,支持双人对战和人机对战模式。游戏采用前端 JavaScript 实现核心逻辑,使用 Express 搭建简单的服务器,提供了友好的用户界面和丰富的游戏功能。

## 主要特性

- **多种游戏模式**
  - 双人对战: 两名玩家在同一台设备上轮流落子
  - 人机对战: 玩家可以与 AI 对弈,支持三种难度级别
    - 简单: 适合入门玩家
    - 中等: 具有一定挑战性
    - 困难: AI 会进行更深层次的策略分析

- **游戏设置**
  - 可选择棋盘尺寸(15x15 或 19x19)
  - 可选择棋子颜色(黑子或白子)
  - 可设置每步棋的时间限制(10-60秒)

- **游戏功能**
  - 悔棋功能
  - 认输功能
  - 重新开始
  - 返回主菜单
  - 计时器显示
  - 当前回合提示

- **界面特性**
  - 响应式设计,适配不同屏幕尺寸
  - 简洁直观的用户界面
  - 动画效果和音效反馈

## 技术栈

- **前端**
  - HTML5 Canvas: 实现棋盘绘制和交互
  - CSS3: 实现界面样式和动画效果
  - JavaScript ES6+: 实现游戏逻辑和 AI 算法
  - 模块化设计: 使用 ES6 模块系统组织代码

- **后端**
  - Node.js
  - Express: 提供静态文件服务

## 项目结构

- `index.html`: 游戏的主要 HTML 文件。
- `styles.css`: 游戏的样式文件。
- `readme.md`: 项目的说明文档。
- `main.js`: 应用的主入口文件，负责初始化各个模块。
- `game/`: 游戏相关的逻辑和功能实现。
  - `game.js`: 核心游戏逻辑。
  - `ai.js`: AI 逻辑。
  - `timer.js`: 计时器功能。
  - `utils.js`: 工具函数。
- `ui/`: 用户界面相关功能。
  - `ui.js`: UI 事件绑定。
- `audio/`: 音频控制功能。
  - `audio.js`: 音频管理。
- `click.mp3`: 按钮点击音效文件。
- `background.mp3`: 背景音乐文件。

## 未来的改进

- 增强 AI 智能，使用更复杂的算法。
- 添加更多的游戏设置选项。
- 提供多语言支持。
- 优化用户界面和动画效果。

## 许可证

本项目使用 MIT 许可证，欢迎自由使用和修改。 
=======
# 五子棋游戏 (Gobang Game)

一个基于 Vue 3 + TypeScript 开发的现代化五子棋游戏，支持人机对战和在线对战功能。游戏采用响应式设计，支持PC端和移动端，并提供深色模式支持。

## ✨ 功能特点

### 🎮 人机对战
- 🤖 智能 AI 对手，采用高效的评估算法
- ⏱️ 实时显示游戏状态和计时器
- 🔍 支持悬停预览和最后落子标记
- ⚙️ 丰富的游戏设置（音效、计时器、主题等）
- 📊 详细的游戏统计（胜、负、平局）
- ⌨️ 全键盘控制支持
- 📱 响应式设计，完美支持移动端
- 🌓 深色/浅色主题切换

### 🌐 在线对战
- ⚡ 实时对战系统
- 🏆 完整的排位系统
- 💬 实时聊天功能
- 👀 观战模式

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **实时通信**: Socket.IO
- **后端服务**: Node.js + Express
- **包管理器**: npm

## 📁 项目结构

```
.
├── src/                      # 源代码目录
│   ├── components/          # 组件目录
│   │   ├── game/           # 游戏相关组件
│   │   │   ├── singleplayer/  # 单人游戏组件
│   │   │   └── multiplayer/   # 多人游戏组件
│   │   └── welcome/        # 欢迎页面组件
│   ├── pages/              # 页面组件
│   ├── stores/             # Pinia 状态管理
│   ├── router/             # Vue Router 配置
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── constants/          # 常量定义
│   ├── game/               # 游戏核心逻辑
│   ├── audio/              # 音频资源
│   └── server/             # 服务端代码
├── public/                 # 静态资源
└── dist/                   # 构建输出目录
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务器
npm run server
```

### 生产环境
```bash
# 构建前端
npm run build

# 预览构建结果
npm run preview
```

## 🎮 游戏控制

### 键盘控制
- **方向键**: 移动选择位置
- **空格键/回车键**: 落子
- **ESC**: 退出当前对局
- **Tab**: 切换功能区域

### 鼠标控制
- **左键点击**: 落子
- **悬停**: 预览落子位置

## ⚙️ 游戏设置

### 可自定义选项
- **音效**: 开启/关闭游戏音效
- **计时器**: 显示/隐藏计时器
- **最后落子**: 显示/隐藏最后落子标记
- **预览**: 开启/关闭悬停预览
- **主题**: 
  - 棋盘主题（木纹/简约）
  - 界面主题（浅色/深色）

## 🚀 部署指南

### Vercel 部署

1. Fork 本仓库到你的 GitHub 账号
2. 在 [Vercel](https://vercel.com) 中导入该仓库
3. 配置环境变量：
   - `VITE_API_URL`: 你的 Vercel 部署域名
4. 部署设置：
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
5. 点击 "Deploy" 开始部署

### 环境变量配置
```env
VITE_API_URL=你的域名
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📝 开发规范

- 使用 TypeScript 编写所有代码
- 遵循 Vue 3 组合式 API 风格
- 组件采用 PascalCase 命名
- 使用 ESLint 和 Prettier 进行代码格式化
- 提交信息遵循 Conventional Commits 规范

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 
>>>>>>> Stashed changes
