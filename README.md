# Sticky Todo

桌面便签待办工具 — 经典便签纸风格，常驻桌面角落，帮你记录每日待办。

## 功能

- 经典便签纸风格界面，温馨美观
- 添加、完成、删除待办事项
- 拖拽排序，自由调整优先级
- 每日自动归档，新的一天全新开始
- 历史记录查看，回顾过往待办
- 数据本地存储，隐私安全

## 开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run electron:dev

# 打包 Windows 安装程序
npm run electron:build
```

## 技术栈

- Electron 35
- React 19
- Vite
- react-beautiful-dnd
- dayjs

## 数据存储

待办数据存储在 `D:\sticky-todo\` 目录下，按日期生成 JSON 文件。
