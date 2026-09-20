# Todo List

一个基于 Next.js 16 (App Router) 的最小化 Todo List 脚手架，可作为新项目的起点。

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | Next.js 16 (App Router + Turbopack) | 16.2 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 18 |
| ORM | Drizzle ORM (postgres-js driver) | 0.45 |
| Styling | Tailwind CSS v4 | 4.x |
| Testing | Vitest + Testing Library | 4.1 / 16.3 |
| Linting | ESLint 9 (flat config) | 9.x |
| Package Manager | pnpm | 12.x |

## Features

- 默认主页即 Todo List（`app/page.tsx`）
- 增 / 删 / 完成勾选，数据持久化到 PostgreSQL
- Server Actions (`app/actions.ts`) + `revalidatePath` 自动刷新
- Server Component 取数 → Client Component 交互（App Router 推荐模式）
- 首次访问通过 `ensureSchema()` 自动建表（`CREATE TABLE IF NOT EXISTS`）

## Getting Started

### 前置条件

- Node.js 18+（推荐 20+）
- pnpm
- PostgreSQL（本地运行，默认端口 5432）

### 步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 中的 DATABASE_URL

# 3. 创建数据库
createdb todo_app

# 4. 启动开发服务器
pnpm dev
```

浏览器访问 **http://localhost:3000**。表结构会在首次访问时自动创建。

### 常用命令

```bash
pnpm dev          # 开发服务器 (Turbopack)
pnpm build        # 生产构建
pnpm start        # 生产服务器
pnpm lint         # ESLint 检查
pnpm test         # 运行 Vitest 测试
pnpm db:push      # 同步 schema 到数据库
pnpm db:generate  # 生成迁移文件
pnpm db:studio    # Drizzle Studio 可视化
```

## 项目结构

```
.
├── app/
│   ├── page.tsx            # 首页 = Todo List (Server Component)
│   ├── actions.ts          # Server Actions (增删改查 + revalidatePath)
│   ├── todo-list.tsx       # Client Component (交互逻辑)
│   ├── todo-list.test.tsx  # 基础测试
│   ├── layout.tsx          # 根布局 (字体、全局样式)
│   └── globals.css         # Tailwind v4 全局样式
├── lib/
│   └── db/
│       ├── index.ts        # 数据库连接 + ensureSchema()
│       └── schema.ts       # Drizzle ORM 表定义 (todos)
├── drizzle.config.ts       # Drizzle Kit 配置
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
└── vitest.setup.ts
```

## 数据库 Schema

### todos

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| title | VARCHAR(255) | 待办标题 |
| completed | BOOLEAN | 是否完成 (默认 false) |
| created_at | TIMESTAMPTZ | 创建时间 (默认 now) |
