# 个人成长记录博客 - 项目全局规则
## 项目概述
本项目是一个个人成长记录型博客网站，旨在打造一个高效、美观、易用且安全的个人成长记录平台。技术栈基于2026年AI原生架构设计。

## 核心原则

### 1. 架构设计原则
- **类型安全优先**：所有跨边界数据传输必须有完整类型定义，严禁使用`any`
- **组件驱动开发**：UI由可复用的组件构成，遵循原子设计理念
- **内容与展示分离**：博客内容与UI组件解耦，便于主题切换和内容迁移
- **AI原生思维**：所有功能模块预留AI集成接口，便于后续智能化升级

### 2. 代码质量原则
- **可读性 > 炫技**：代码是写给人看的，顺便让机器执行
- **防御性编程**：永远不相信外部输入，校验所有边界值
- **单一职责**：每个函数、组件只做一件事，并做好
- **DRY原则**：三次重复必须抽象，两次重复考虑抽象

---

## 🔧 技术栈规范

### 前端/全栈
```typescript
// 框架: Next.js 15+ (App Router)
// 语言: TypeScript 5.5+ (严格模式)
// 样式: Tailwind CSS 3.4+
// UI组件: shadcn/ui (自定义副本)
// 状态管理: React Context + useReducer (局部), Zustand (全局)
// 数据获取: Server Component (默认), SWR (客户端动态)
```

### API层
```typescript
// 类型安全API: tRPC (端到端类型安全)
// 服务端: Next.js Route Handlers (仅用于外部API)
// 输入验证: Zod (与tRPC集成)
```

### 数据库
```typescript
// ORM: Prisma (schema.prisma)
// 数据库: PostgreSQL + pgvector (向量扩展)
// 连接: @prisma/client
```

### AI集成
```typescript
// AI SDK: Vercel AI SDK 4.0+
// 向量嵌入: @vercel/ai (内置支持)
// 流式响应: AIStream
```

---

## 项目结构规范
注意：该结构规范仅供参考
```
├── app/                      # Next.js App Router
│   ├── (marketing)/          # 营销页面（首页/关于）
│   ├── (blog)/                # 博客相关路由
│   │   ├── posts/            # 文章列表/详情
│   │   ├── tags/             # 标签页面
│   │   └── search/           # 搜索页面（含AI语义搜索）
│   ├── api/                   # API Routes
│   │   ├── trpc/             # tRPC HTTP处理器
│   │   │   └── [trpc]/
│   │   │       └── route.ts
│   │   └── ai/                # AI专用API
│   │       ├── chat/          # 对话接口
│   │       └── embed/         # 嵌入生成
│   └── layout.tsx             # 根布局
├── components/                # UI组件
│   ├── ui/                    # shadcn/ui基础组件
│   ├── blog/                  # 博客专用组件
│   │   ├── PostCard.tsx
│   │   ├── PostContent.tsx
│   │   └── SearchBar.tsx
│   └── shared/                # 共享组件
├── lib/                       # 核心逻辑
│   ├── server/                # 服务端专用
│   │   ├── db/                # 数据库连接
│   │   │   ├── client.ts      # Prisma客户端
│   │   │   └── seed.ts        # 种子数据
│   │   └── ai/                # AI服务端逻辑
│   ├── client/                # 客户端专用
│   │   └── hooks/             # 自定义Hooks
│   │       ├── useDebounce.ts
│   │       └── useSearch.ts
│   └── utils/                 # 通用工具
│       ├── formatters.ts      # 格式化工具
│       └── validators.ts      # Zod验证器
├── server/                    # tRPC服务端
│   ├── routers/               # tRPC路由
│   │   ├── post.ts
│   │   ├── tag.ts
│   │   └── search.ts          # 语义搜索路由
│   ├── context.ts             # tRPC上下文
│   └── trpc.ts                # tRPC初始化
├── prisma/                    # Prisma
│   ├── schema.prisma
│   └── migrations/
├── public/                    # 静态资源
│   ├── images/
│   └── posts/                 # 本地文章资源
├── styles/                    # 全局样式
│   └── globals.css
├── types/                      # 全局类型
│   └── index.ts
└── middleware.ts               # Next.js中间件
```

---

## 📝 编码规范

### TypeScript规范
```typescript
// ✅ 正确：显式定义接口
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt: Date;
  tags: Tag[];
  embedding?: number[]; // 向量嵌入
}

// ❌ 错误：滥用any
const post: any = await getPost();

// 函数返回类型必须显式声明
async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // ...
}
```

### React/Next.js规范
```typescript
// ✅ 正确：Server Component优先
// app/blog/posts/[slug]/page.tsx
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  return <PostContent post={post} />;
}

// 需要客户端交互时使用"use client"
// ✅ 正确：明确标记客户端组件
"use client";
import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  // ...
}
```

### Tailwind CSS规范
```tsx
// ✅ 正确：使用clsx/cn处理条件类
import { cn } from "@/lib/utils";

<div className={cn(
  "p-4 rounded-lg",
  isActive ? "bg-blue-500 text-white" : "bg-gray-100"
)}>
  {content}
</div>

// 保持类名顺序一致性
// 布局 -> 间距 -> 尺寸 -> 视觉 -> 交互
className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 rounded-md hover:bg-blue-600"
```

### tRPC规范
```typescript
// server/routers/post.ts
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const postRouter = router({
  // 查询：获取文章列表
  list: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.post.findMany({
        orderBy: { publishedAt: "desc" }
      });
    }),
  
  // 查询：获取单篇文章（带向量语义搜索支持）
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.post.findUnique({
        where: { slug: input.slug },
        include: { tags: true }
      });
    }),
  
  // 语义搜索
  semanticSearch: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(10)
    }))
    .query(async ({ ctx, input }) => {
      // 生成查询向量
      const embedding = await generateEmbedding(input.query);
      
      // 执行向量相似度搜索
      return ctx.db.$queryRaw`
        SELECT id, title, excerpt, 
               1 - (embedding <=> ${embedding}::vector) as similarity
        FROM posts
        WHERE embedding IS NOT NULL
        ORDER BY similarity DESC
        LIMIT ${input.limit};
      `;
    })
});
```

### AI集成规范
```typescript
// app/api/ai/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // 从数据库检索相关上下文
  const context = await getRelevantContext(messages);
  
  const result = streamText({
    model: openai("gpt-4o"),
    system: `你是一个个人成长博客助手。基于以下上下文回答问题：${context}`,
    messages,
  });
  
  return result.toDataStreamResponse();
}
```

---

## 🔒 安全规范

### 1. 数据验证
```typescript
// ✅ 正确：所有用户输入必须验证
import { z } from "zod";

const CommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  email: z.string().email().optional()
});

// 在API入口验证
export async function POST(req: Request) {
  const body = await req.json();
  const validated = CommentSchema.parse(body); // 失败自动抛错
  // ...
}
```

### 2. SQL注入防护
```typescript
// ✅ 正确：使用Prisma参数化查询
const posts = await prisma.post.findMany({
  where: { title: { contains: userInput } } // Prisma自动参数化
});

// ❌ 错误：原始SQL拼接
const posts = await prisma.$executeRawUnsafe(`
  SELECT * FROM posts WHERE title LIKE '%${userInput}%'
`);
```

### 3. 认证与授权
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token // 仅认证用户可访问
  }
});

export const config = {
  matcher: ["/admin/:path*"] // 保护管理后台
};
```

---

## ⚡ 性能优化规范

### 1. 图片优化
```tsx
// ✅ 正确：使用Next.js Image组件
import Image from "next/image";

<Image
  src="/profile.jpg"
  alt="Profile"
  width={400}
  height={400}
  priority={false}
  loading="lazy"
  className="rounded-full"
/>
```

### 2. 字体优化
```typescript
// app/layout.tsx
import { GeistSans } from "geist/font/sans";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={GeistSans.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 3. 数据缓存
```typescript
// ✅ 正确：利用Next.js缓存
// 页面级缓存
export const revalidate = 3600; // 每小时重新验证

// 动态内容使用SWR
"use client";
import useSWR from "swr";

function PostViews({ slug }: { slug: string }) {
  const { data } = useSWR(`/api/posts/${slug}/views`, fetcher, {
    refreshInterval: 60000 // 每分钟刷新
  });
  return <span>{data?.views} views</span>;
}
```

---

## 🤖 AI功能集成规范

### 1. 向量嵌入生成
```typescript
// lib/server/ai/embed.ts
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });
  return embedding;
}

// 文章发布时自动生成嵌入
export async function createPost(data: NewPost) {
  const embedding = await generateEmbedding(`${data.title}\n${data.content}`);
  
  return prisma.post.create({
    data: {
      ...data,
      embedding // 存储向量
    }
  });
}
```

### 2. 语义搜索UI
```tsx
// components/blog/SemanticSearch.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/client/trpc";

export function SemanticSearch() {
  const [query, setQuery] = useState("");
  
  const { data: results, isLoading } = trpc.search.semantic.useQuery(
    { query },
    { enabled: query.length > 3 }
  );
  
  return (
    <div className="space-y-4">
      <Input
        placeholder="用自然语言搜索文章..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {isLoading && <div>搜索中...</div>}
      
      {results?.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>相似度: {Math.round(post.similarity * 100)}%</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. AI助手对话
```tsx
// components/blog/AIAssistant.tsx
"use client";

import { useChat } from "ai/react";

export function AIAssistant() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/ai/chat",
  });
  
  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl">
      <div className="p-4 border-b">
        <h3>博客助手</h3>
      </div>
      
      <div className="h-96 overflow-y-auto p-4">
        {messages.map(m => (
          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
            {m.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="问关于文章的问题..."
          className="w-full p-2 border rounded"
        />
      </form>
    </div>
  );
}
```

---

## 📦 依赖管理规范

### package.json关键依赖
```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "typescript": "5.5.x",
    
    // UI
    "tailwindcss": "3.4.x",
    "clsx": "latest",
    "tailwind-merge": "latest",
    
    // tRPC
    "@trpc/server": "11.x",
    "@trpc/client": "11.x",
    "@trpc/next": "11.x",
    "@trpc/react-query": "11.x",
    "zod": "3.x",
    
    // 数据库
    "@prisma/client": "5.x",
    "prisma": "5.x",
    "pg": "8.x",
    
    // AI
    "ai": "4.x",
    "@ai-sdk/openai": "1.x",
    
    // 工具
    "swr": "2.x",
    "date-fns": "3.x",
    "sharp": "0.33.x"
  },
  "devDependencies": {
    "@types/node": "20.x",
    "@types/react": "19.x",
    "eslint": "9.x",
    "eslint-config-next": "15.x",
    "prettier": "3.x",
    "prettier-plugin-tailwindcss": "latest"
  }
}
```

---

## 🚀 开发工作流规范

### 1. 提交规范
```bash
# Commit Message格式
<type>(<scope>): <description>

# type: feat, fix, docs, style, refactor, perf, test, chore
# example: feat(blog): 添加语义搜索功能

# 提交前运行
npm run type-check  # TypeScript检查
npm run lint        # ESLint
npm run format      # Prettier
```

### 2. 环境变量
```env
# .env.local
# 数据库
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# AI
OPENAI_API_KEY="sk-..."
# 或其他提供商
ANTHROPIC_API_KEY="sk-..."

# 认证
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 数据库迁移
```bash
# 修改schema.prisma后
npx prisma generate    # 生成客户端
npx prisma migrate dev --name <migration-name>  # 开发环境迁移
npx prisma db seed     # 种子数据填充
```

---

## ✅ 代码审查清单

提交PR前，确保：

- [ ] TypeScript编译无错误（`tsc --noEmit`）
- [ ] 所有tRPC路由有Zod验证
- [ ] Server Component默认，Client Component明确标记
- [ ] 图片使用Next.js Image优化
- [ ] 数据库查询已考虑N+1问题
- [ ] AI功能错误处理完善
- [ ] 响应式设计在移动端测试
- [ ] 暗色模式支持（使用Tailwind dark:变体）
- [ ] 无障碍访问（aria标签、键盘导航）

---

## 📚 学习资源

- **Next.js**: https://nextjs.org/docs
- **tRPC**: https://trpc.io/docs
- **Prisma**: https://www.prisma.io/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com