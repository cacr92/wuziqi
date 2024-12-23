const fs = require('fs');
const sharp = require('sharp');

// SVG 模板
const svgTemplate = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="512" height="512" fill="#4CAF50" rx="100"/>
  
  <!-- 棋盘线条 -->
  <g stroke="rgba(255,255,255,0.3)" stroke-width="8">
    <!-- 横线 -->
    <line x1="106" y1="106" x2="406" y2="106"/>
    <line x1="106" y1="206" x2="406" y2="206"/>
    <line x1="106" y1="306" x2="406" y2="306"/>
    <line x1="106" y1="406" x2="406" y2="406"/>
    
    <!-- 竖线 -->
    <line x1="106" y1="106" x2="106" y2="406"/>
    <line x1="206" y1="106" x2="206" y2="406"/>
    <line x1="306" y1="106" x2="306" y2="406"/>
    <line x1="406" y1="106" x2="406" y2="406"/>
  </g>
  
  <!-- 棋子 -->
  <g>
    <!-- 黑子 -->
    <circle cx="206" cy="206" r="35" fill="black"/>
    <circle cx="306" cy="306" r="35" fill="black"/>
    
    <!-- 白子 -->
    <circle cx="306" cy="206" r="35" fill="white"/>
    <circle cx="206" cy="306" r="35" fill="white"/>
    
    <!-- 高光效果 -->
    <circle cx="196" cy="196" r="10" fill="rgba(255,255,255,0.3)"/>
    <circle cx="296" cy="196" r="10" fill="rgba(255,255,255,0.3)"/>
    <circle cx="196" cy="296" r="10" fill="rgba(255,255,255,0.3)"/>
    <circle cx="296" cy="296" r="10" fill="rgba(255,255,255,0.3)"/>
  </g>
</svg>
`;

// 需要生成的图标尺寸
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 创建 icons 目录
if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

// 保存 SVG 文件
fs.writeFileSync('public/icons/icon.svg', svgTemplate);

// 生成不同尺寸的 PNG 图标
async function generateIcons() {
  for (const size of sizes) {
    await sharp('public/icons/icon.svg')
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`Generated ${size}x${size} icon`);
  }
}

// 运行生成器
generateIcons().catch(console.error); 