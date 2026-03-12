# chiweb

个人成长记录型博客（时间轴 + 多媒体 + 管理员模式）。

## 当前技术栈（重构后）

- Frontend: Next.js 15 App Router, TypeScript strict, Tailwind CSS
- API: tRPC + Zod（通过 Next Route Handler 挂载）
- Data: Prisma + PostgreSQL
- Media: 本地文件存储（`public/uploads`）+ `sharp` 图片缩略图
- Legacy backend: 旧 Express/Mongoose 运行路径已完全下线，且不保留旧数据库兼容程序

## 目录说明

- `src/app`：页面与 API Route Handlers
- `src/server`：tRPC context/router/procedure
- `src/lib/server`：服务端复用能力（Prisma、媒体存储）
- `prisma`：数据库 schema
- `scripts`：维护脚本

## 启动与开发

```bash
npm install
npm run prisma:generate
npm run dev
```

## 质量门禁

```bash
npm run type-check
npm run lint
npm run build
```

下线与回滚细节见：`docs/下线变更清单与回滚指引.md`

## 关键环境变量

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chiweb"
```
