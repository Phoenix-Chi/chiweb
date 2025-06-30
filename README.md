# 个人成长记录型博客网站

本项目基于 Next.js (React + TypeScript)、Node.js (Express)、MongoDB、Ant Design、Sharp.js、FFmpeg，旨在打造高效、美观、易用且安全的个人成长记录平台。

## 主要功能
- 横向时间轴主页，展示成就、习惯、里程碑等多类型节点
- 多媒体内容管理（图片压缩、音视频转码）
- 节点关键词搜索与跳转
- 时间轴缩放与拖动交互
- 管理员特殊登录机制与节点管理
- 权限控制：仅管理员可增删改节点，普通用户仅浏览与搜索

## 技术栈
- 前端：Next.js (React + TypeScript)、Ant Design
- 后端：Node.js (Express)
- 数据库：MongoDB
- 多媒体处理：Sharp.js、FFmpeg

## 快速开始

```bash
npm install
npm run dev
```
```bash
npm run server
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 目录结构
- `src/app`：前端页面与入口
- `src/pages/api`：API 路由（可扩展为后端服务）
- `public/`：静态资源

## 部署
- 前端推荐部署至 Vercel
- 后端与数据库建议部署于云服务器

---

> 本项目为学习与个人成长记录用途，欢迎交流与贡献。
