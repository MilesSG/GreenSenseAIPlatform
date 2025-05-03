# 🌿 GreenSense AI 平台

GreenSense AI是一个基于深度学习的遥感影像植被识别与提取研究平台，使用现代前端技术栈构建，为研究人员提供直观、高效的界面来分析遥感图像中的植被覆盖情况。

## ✨ 功能特点

- 🖼️ **图像处理与对比**：上传遥感图像并使用AI模型进行植被识别和提取，以可视化方式对比处理前后的差异
- 🤖 **多种模型支持**：集成多种深度学习模型（U-Net, U-Net++, DeepLab V3+, FCN）用于植被识别
- 📊 **性能分析**：通过图表和数据表格全面分析不同模型在各种场景下的性能表现
- 🎨 **用户友好界面**：现代化、响应式的UI设计，采用苹果风格，适配各种设备屏幕
- 🌐 **多环境适应性**：支持分析不同地区、不同季节、不同天气条件下的遥感数据
- ⚡ **高效性能比较**：直观展示模型在精度与能耗之间的平衡关系

## 🛠️ 技术栈

- ⚡ **前端框架**：Vue 3 + Composition API
- 🔥 **构建工具**：Vite
- 📝 **语言**：TypeScript
- 🍍 **状态管理**：Pinia
- 🧩 **UI组件**：Element Plus
- 💨 **样式**：Tailwind CSS
- 📈 **数据可视化**：ECharts
- 🧭 **路由**：Vue Router

## 💻 开发指南

### 环境要求

- Node.js 16+
- npm 8+ 或 yarn 1.22+

### 安装依赖

```bash
npm install
```

### 开发服务

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📂 项目结构

```
src/
├── assets/       # 静态资源（图片、样式）
├── components/   # 可复用组件
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── views/        # 页面视图
├── App.vue       # 根组件
└── main.js       # 入口文件
```

## 🧩 组件说明

- **AppNavigation**: 顶部导航组件，提供应用内导航功能
- **StatCard**: 统计卡片组件，展示关键指标数据
- **ImageComparison**: 图像对比组件，支持滑动对比原始图像和处理后图像
- **ChartComponents**: 各种可视化图表组件，用于展示模型性能数据

## 📱 页面说明

- **/** (DashboardView): 仪表盘页面，展示关键统计数据和最近处理的图像
- **/model-performance** (ModelPerformanceView): 模型性能页面，用于比较不同模型的性能指标
  - 雷达图展示多维度性能对比
  - 趋势图展示性能变化
  - 气泡图展示效率与能耗平衡
  - 场景适应性分析

## 🌟 最新更新

- 🎨 优化模型性能页面，采用苹果风格设计
- 📊 新增性能与能耗平衡气泡图
- 🌤️ 新增不同场景条件下的模型适应性分析
- 📱 优化移动端响应式布局
- 🚀 提升图表加载性能

## 🤝 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📝 许可证

[MIT](LICENSE)
