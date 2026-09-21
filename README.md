# maxopc

一个基于 Next.js 16 (App Router) 的全栈项目脚手架。

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

- 默认主页为商品分类页（`app/page.tsx`），右上角含登录 / 购物车按钮
- 分类筛选 + 商品网格展示，购物车（客户端 Context）实时计数
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
createdb maxopc

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

## 本地启动（Mac mini / macOS）

适用于 Apple Silicon（M 系列）Mac mini，中间件统一用 Homebrew 安装管理。

### 1. 安装中间件

```bash
# Node.js（推荐 20+）与 pnpm
brew install node pnpm

# PostgreSQL 18
brew install postgresql@18

# Redis
brew install redis
```

### 2. 启动中间件（注册为开机自启）

```bash
brew services start postgresql@18
brew services start redis
```

验证服务是否就绪：

```bash
pg_isready        # 输出 "accepting connections" 即正常（端口 5432）
redis-cli ping    # 输出 PONG 即正常（端口 6379）
```

> 如只想临时启动、不注册自启，可改用 `pg_ctl start` / `redis-server --daemonize yes`。

### 3. 创建数据库

```bash
createdb maxopc
# 若已存在可忽略；用 psql -l 查看现有数据库
```

### 4. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，写入数据库连接串。macOS 上 Homebrew 安装的 PostgreSQL 默认以当前系统用户作为超级用户（无需密码）：

```
DATABASE_URL=postgres://<你的用户名>@localhost:5432/maxopc
```

例如用户名为 `junzhou` 时为 `postgres://junzhou@localhost:5432/maxopc`（可用 `whoami` 查看当前用户名）。

### 5. 安装依赖并初始化数据库

```bash
pnpm install

# 建表 + 写入种子数据（分类 / 商品 / 客户 / 订单 / 营销 / 评价等）
pnpm db:seed
```

### 6. 启动开发服务器

```bash
pnpm dev
```

浏览器访问 **http://localhost:3000**。

> Redis 目前为缓存 / 会话 / 购物车 / 限流等预留（见 PLANNING.md），当前代码尚未直接依赖，只需确保服务已启动即可。

## 项目结构

```
.
├── app/
│   ├── page.tsx            # 首页 = 商品分类页 (Server Component)
│   ├── shop-actions.ts     # Server Actions (分类 / 商品查询)
│   ├── product-catalog.tsx # Client Component (分类筛选 + 商品网格)
│   ├── header.tsx          # 顶部导航 (登录 / 购物车按钮)
│   ├── cart-context.tsx    # 购物车状态 (React Context)
│   ├── layout.tsx          # 根布局 (字体、全局样式)
│   └── globals.css         # Tailwind v4 全局样式
├── lib/
│   └── db/
│       ├── index.ts        # 数据库连接 + ensureSchema()
│       ├── schema.ts       # Drizzle ORM 表定义 (商品/订单/客户等)
│       ├── ddl.ts          # 建表 DDL (与 schema 同步)
│       └── seed.ts         # 种子数据脚本
├── drizzle.config.ts       # Drizzle Kit 配置
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
└── vitest.setup.ts
```

## 数据库 Schema

| Table | Description |
|---|---|
| categories | 商品分类 |
| products | 商品 |
| skus | SKU / 库存 |
| customers | 客户 |
| orders | 订单 |
| order_items | 订单明细 |
| promotions | 营销活动 |
| reviews | 商品评价 |
| content | 内容 / 横幅 |
| audit_logs | 审计日志 |
