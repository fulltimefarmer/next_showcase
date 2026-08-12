# Company Management System (CMS)

企业级内部管理系统，基于 Next.js 16 App Router 构建的学习项目。

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | Next.js 16 (App Router + Turbopack) | 16.2 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 18 |
| ORM | Drizzle ORM (postgres-js driver) | 0.45 |
| Auth | Auth.js (next-auth v5 beta) | 5.0 beta |
| Validation | Zod + react-hook-form + @hookform/resolvers | 4.4 / 7.84 |
| Styling | Tailwind CSS v4 | 4.x |
| Icons | Lucide React | 1.28 |
| Toast | Sonner | 2.0 |
| Testing | Vitest + Testing Library | 4.1 / 16.3 |
| Linting | ESLint 9 (flat config) | 9.x |
| Package Manager | pnpm | 11.x |

## Features

### 功能模块

| 模块 | 路径 | 核心功能 | 技术亮点 |
|---|---|---|---|
| Dashboard | `/` | 全局统计概览 | Drizzle aggregate count、并行查询 |
| Departments | `/departments` | 部门 CRUD | Server Actions + revalidatePath |
| Employees | `/employees` | 员工 CRUD、部门关联 | 外键关联、Select 下拉联动 |
| Assets | `/assets` | 资产 CRUD、状态跟踪 | 状态流转(available/in_use/maintenance) |
| Leave Mgmt | `/leaves` | 请假申请、审批工作流 | pending→approved/rejected 状态机 |
| Salaries | `/salaries` | 薪资记录、工资条 | 实发金额实时计算、Payslip 弹窗 |
| Performance | `/performance` | 多维度绩效考核 | JSONB 维度评分、self→manager 评审流 |
| Roles & RBAC | `/roles` | 角色、权限管理 | JSONB 权限数组、分组权限选择器 |
| Audit Logs | `/audit-logs` | 操作审计追踪 | 静默日志记录、操作类型筛选 |

### 架构特性

- **三层权限控制**: Middleware(路由级) → Page(页面级) → Server Action(操作级)
- **RBAC 权限系统**: 角色-权限模型，支持 granular 权限定义
- **审批工作流**: 请假申请/绩效考核的状态机流转
- **审计日志**: 自动记录 create/update/delete/approve/reject 操作
- **Server Actions**: 所有数据操作通过 Server Action 完成，自动 revalidate
- **实时计算**: 工资净额公式、绩效平均分等前端实时预览
- **响应式侧边栏**: 可折叠导航，显示当前用户角色

## Getting Started

### 前置条件

- **Node.js** 18+ (推荐 20+)
- **pnpm** (npm install -g pnpm)
- **PostgreSQL** (本地运行，默认端口 5432)

### 1. 克隆安装

```bash
git clone <repo-url>
cd next_showcase
pnpm install
```

### 2. 创建数据库

```bash
# 方式 1: 命令行
createdb next_showcase

# 方式 2: psql
psql -U <your_user> -d postgres
CREATE DATABASE next_showcase;
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，修改为你的数据库连接信息:

```env
DATABASE_URL=postgres://<user>:<password>@localhost:5432/next_showcase
AUTH_SECRET=<随机字符串>
```

> **macOS Homebrew PostgreSQL 用户注意**：默认没有 `postgres` 角色，用 `DATABASE_URL=postgres://$(whoami):@localhost:5432/next_showcase`

### 4. 初始化数据库

数据库表会通过 `ensureSchema()` 自动创建（`CREATE TABLE IF NOT EXISTS`），首次访问页面时自动建表。

如需手动执行：

```bash
pnpm db:push
```

### 5. 启动

```bash
pnpm dev
```

访问 http://localhost:3000

### 测试账号

| 账号 | 密码 | 角色 | 权限范围 |
|---|---|---|---|
| admin | admin | Admin | 全部访问 |
| manager | manager | Manager | 管理（审批请假） |
| user | user | User | 基础读写 |

> 源码位置：`lib/auth.ts` 中的 `USERS` 数组 — 这个 hardcode 写法是为了学习方便，实际项目应该从数据库查询。

## 项目结构

```
.
├── app/
│   ├── (dashboard)/              # 受保护的管理页面 (route group)
│   │   ├── page.tsx              # Dashboard 主页
│   │   ├── layout.tsx            # Dashboard 布局 (侧边栏+内容区)
│   │   ├── departments/          # 部门管理 (page + actions + list component)
│   │   ├── employees/            # 员工管理
│   │   ├── assets/               # 资产管理
│   │   ├── leaves/               # 请假管理
│   │   ├── salaries/             # 薪资管理
│   │   ├── performance/          # 绩效考核
│   │   ├── roles/                # 角色权限
│   │   └── audit-logs/           # 审计日志
│   ├── api/auth/[...nextauth]/   # Auth.js API 路由
│   ├── components/               # 共享组件 (Sidebar)
│   ├── login/                    # 登录页面
│   ├── providers.tsx            # SessionProvider + Toaster 客户端包装
│   ├── layout.tsx               # 根布局 (字体、providers)
│   └── globals.css              # Tailwind v4 全局样式
├── lib/
│   ├── auth.ts                  # NextAuth 完整配置 (Credentials + JWT callbacks)
│   ├── auth.config.ts           # NextAuth 中间件配置 (route protection)
│   ├── rbac.ts                  # 权限检查工具函数
│   ├── audit.ts                 # 审计日志写入工具
│   ├── pagination.ts            # 通用分页查询工具
│   └── db/
│       ├── index.ts             # 数据库连接 + ensureSchema()
│       └── schema.ts            # Drizzle ORM 表定义 (含中文注释)
├── proxy.ts                     # Auth middleware 入口
├── drizzle.config.ts            # Drizzle Kit 配置
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
└── vitest.setup.ts
```

## 数据库 Schema

### departments
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| name | VARCHAR(255) | 部门名称 |
| description | TEXT | 部门描述 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间(自动) |

### employees
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| name | VARCHAR(255) | 员工姓名 |
| email | VARCHAR(255) | 邮箱 |
| phone | VARCHAR(50) | 电话 |
| position | VARCHAR(255) | 职位 |
| department_id | INTEGER FK | 所属部门 |
| role | VARCHAR(50) | 角色 (admin/manager/user) |
| hire_date | DATE | 入职日期 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间(自动) |

### roles
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| name | VARCHAR(100) UNIQUE | 角色名 |
| description | TEXT | 描述 |
| permissions | JSONB | 权限列表数组 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间(自动) |

### leave_types
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| name | VARCHAR(100) | 类型名(年假/病假/事假) |
| description | TEXT | 描述 |
| max_days | INTEGER | 最大天数 |
| created_at | TIMESTAMPTZ | 创建时间 |

### leave_requests
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| employee_id | INTEGER FK | 申请人 |
| leave_type_id | INTEGER FK | 请假类型 |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |
| reason | TEXT | 理由 |
| status | VARCHAR(50) | pending/approved/rejected |
| approved_by | INTEGER FK | 审批人 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间(自动) |

### salaries
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| employee_id | INTEGER FK | 员工 |
| pay_period | VARCHAR(20) | 薪资周期 (2024-07) |
| base_salary | INTEGER | 基本工资 |
| bonus | INTEGER | 奖金 |
| deductions | INTEGER | 扣款 |
| actual_payment | INTEGER | 实发金额(自动) |
| status | VARCHAR(50) | draft/paid |
| paid_date | DATE | 发放日期 |
| remarks | TEXT | 备注 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间(自动) |

### performance_reviews
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| employee_id | INTEGER FK | 员工 |
| cycle | VARCHAR(20) | 考核周期 (2024-Q3) |
| categories | JSONB | 各维度分数 |
| overall_score | INTEGER | 综合评分 |
| self_score | INTEGER | 自评分 |
| manager_score | INTEGER | 主管评分 |
| status | VARCHAR(50) | draft/self_review/completed |
| comments | TEXT | 评语 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间(自动) |

### assets
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| name | VARCHAR(255) | 资产名称 |
| type | VARCHAR(100) | 类型 |
| serial_number | VARCHAR(255) | 序列号 |
| status | VARCHAR(50) | available/in_use/maintenance |
| assigned_to | INTEGER FK | 使用人 |
| purchase_date | DATE | 采购日期 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间(自动) |

### audit_logs
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | 自增主键 |
| user | VARCHAR(255) | 操作用户 |
| action | VARCHAR(50) | 操作类型 |
| entity | VARCHAR(50) | 操作实体 |
| entity_id | INTEGER | 实体ID |
| details | JSONB | 变更详情 |
| created_at | TIMESTAMPTZ | 操作时间 |

## 架构详解

### 权限控制体系

```
请求进入 → Middleware (proxy.ts)         ← 路由级: 检查是否登录
         → 路由匹配中间件 (auth.config.ts)
         → Page Server Component         ← 页面级: auth() 检查 role
         → Server Action                 ← 操作级: 调用 lib/rbac.ts 工具
```

定义在 `lib/rbac.ts` 中的权限清单:

```typescript
departments:read/write    # 部门
employees:read/write      # 员工
assets:read/write         # 资产
roles:read/write          # 角色管理
leaves:read/write/approve # 请假
audit:read                # 审计
```

### 每个模块的文件结构

每个功能模块遵循统一的 **Page → Actions → Client Component** 架构:

```
module/
├── page.tsx       # Server Component: 用 auth() 获取 session, 调用 actions 获取数据
├── actions.ts     # Server Actions: "use server" + 数据库操作 + revalidatePath
└── *-list.tsx     # Client Component: "use client" + useState + react-hook-form
```

### 工作流状态机

```
请假:  pending ──→ approved
               └──→ rejected

考核:  draft ──→ self_review ──→ completed

薪资:  draft ──→ paid
```

## Scripts

```bash
pnpm dev          # 开发服务器 (Turbopack)
pnpm build        # 生产构建
pnpm start        # 生产服务器
pnpm lint         # ESLint 检查
pnpm test         # 运行测试
pnpm test:watch   # 监视模式测试
pnpm db:push      # 推送 schema 到数据库
pnpm db:generate  # 生成迁移文件
pnpm db:migrate   # 运行迁移
pnpm db:studio    # Drizzle Studio (可视化)
```
