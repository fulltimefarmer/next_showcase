# Next.js App Router 学习笔记

> 基于 **Company Management System** 项目，覆盖 Next.js 16 App Router 的核心知识体系。
> 文件路径均相对于项目根目录 `next_showcase/`。

---

## 学习路线图

```
Week 1: 路由 & 渲染机制
  ├── Day 1-2: App Router 目录结构 + 路由约定
  ├── Day 3-4: Server Component vs Client Component
  └── Day 5: Layout 嵌套 + Route Group + Metadata

Week 2: 数据流
  ├── Day 6-7: Server Component 数据获取 (force-dynamic)
  ├── Day 8-9: Server Actions (use server) + revalidatePath
  └── Day 10: Client Component 中调用 Server Actions

Week 3: 认证 & 路由保护
  ├── Day 11-12: NextAuth v5 (Auth.js) 集成
  ├── Day 13: Middleware + Route Protection
  └── Day 14: 页面级权限控制 (auth() + redirect)

Week 4: 进阶实战
  ├── Day 15: 数据库集成 (Drizzle ORM + PostgreSQL)
  ├── Day 16-17: 工作流状态机 (审批流程)
  ├── Day 18: RBAC 权限体系
  └── Day 19-20: 审计日志 + 跨模块数据依赖
```

---

## 目录

1. [App Router 路由系统](#1-app-router-路由系统)
2. [Server Component vs Client Component](#2-server-component-vs-client-component)
3. [Layout 嵌套与 Route Group](#3-layout-嵌套与-route-group)
4. [Server Actions 数据操作](#4-server-actions-数据操作)
5. [认证 (NextAuth v5 / Auth.js)](#5-认证-nextauth-v5--authjs)
6. [Middleware 中间件](#6-middleware-中间件)
7. [页面级权限控制](#7-页面级权限控制)
8. [数据库集成 (Drizzle ORM)](#8-数据库集成-drizzle-orm)
9. [工作流状态机](#9-工作流状态机)
10. [跨模块数据依赖](#10-跨模块数据依赖)
11. [RBAC 权限体系](#11-rbac-权限体系)
12. [关键 API 速查表](#12-关键-api-速查表)

---

## 1. App Router 路由系统

### 核心概念
App Router 基于**文件系统路由**：`app/` 目录下的文件和文件夹自动映射为 URL 路径。

### 路由约定速查

| 文件/文件夹 | 路由 | 说明 |
|---|---|---|
| `app/page.tsx` | `/` | 首页 |
| `app/login/page.tsx` | `/login` | 登录页 |
| `app/departments/page.tsx` | `/departments` | 部门页 |
| `app/(dashboard)/departments/page.tsx` | `/departments` | Route Group 不影响 URL |
| `app/api/auth/[...nextauth]/route.ts` | `/api/auth/*` | Catch-all 动态路由 (API) |

### 代码定位

📁 **`app/api/auth/[...nextauth]/route.ts`** — Catch-all 动态路由
- `[...nextauth]` 是 Next.js 的 **Catch-all Segment** 语法
- 匹配 `/api/auth/signin`、`/api/auth/callback/credentials`、`/api/auth/session` 等所有子路径
- `route.ts` 是 API Route 文件（不是 `page.tsx`），导出 HTTP 方法（GET/POST）

📁 **`app/(dashboard)/`** — Route Group (路由组)
- 括号 `(dashboard)` 不影响 URL 路径
- 作用：对路由逻辑分组、共享 layout，但不改变 URL 结构
- 所有在 `(dashboard)/` 下的页面都走 `app/(dashboard)/layout.tsx` 布局

### 知识要点
- `page.tsx` = 普通页面，渲染 UI
- `route.ts` = API 端点，导出 GET/POST/PUT/DELETE
- `layout.tsx` = 布局组件，包裹子页面
- `[...slug]` = Catch-all 动态路由
- `(groupName)` = Route Group，不影响 URL
- 文件放在哪个目录，URL 就是什么（静默约定，无需配置 router）

---

## 2. Server Component vs Client Component

### 核心区别

| | Server Component | Client Component |
|---|---|---|
| 标记 | 默认（无标记） | `"use client"` 指令 |
| 运行环境 | 服务端（Node.js） | 浏览器 |
| 数据获取 | 直接访问 DB、FS | 通过 fetch / Server Actions |
| JS Bundle | 不发送到客户端 | 发送到客户端 |
| hooks | ❌ 不可用 | ✅ useState, useEffect 等 |
| 交互 | 无（纯渲染） | 完整交互能力 |

### Server Component 示例

📁 **`app/(dashboard)/page.tsx`** — Dashboard (Server Component)
```tsx
// 【关键】async function 组件 = Server Component
export default async function DashboardPage() {
  // 直接在组件中 await 数据库查询
  const [deptCount] = await db.select({ value: count() }).from(departments);
  // 返回 JSX，数据已经嵌入 HTML
  return <div>{deptCount.value}</div>;
}
```

📁 **`app/(dashboard)/departments/page.tsx`** — 数据加载器模式
```tsx
// Server Component 获取数据，传给 Client Component
export default async function DepartmentsPage() {
  const data = await getDepartments();  // 服务端查 DB
  return <DepartmentList initialData={data} />;  // 传 props 给客户端
}
```

### Client Component 示例

📁 **`app/(dashboard)/departments/department-list.tsx`** — CRUD 表格
```tsx
"use client";  // 【关键】标记为客户端组件

export function DepartmentList({ initialData }) {
  const [data, setData] = useState(initialData);  // hooks 可用
  // 点击事件、表单交互都在客户端
}
```

📁 **`app/components/sidebar.tsx`** — 侧边栏导航
```tsx
"use client";
// usePathname 只能在客户端组件中使用
const pathname = usePathname();
// useSession 需要在 SessionProvider 内部
const { data: session } = useSession();
```

### 最佳实践
- **数据获取**放 Server Component（服务端直接查 DB）
- **交互逻辑**放 Client Component（表单、按钮、状态管理）
- Server Component 可以 import Client Component，反之不行
- Client Component 不能直接 import Server Actions 文件之外的 server-only 模块

---

## 3. Layout 嵌套与 Route Group

### Layout 层级结构

```
app/layout.tsx                     ← RootLayout (最外层: html, body, providers)
  └── app/(dashboard)/layout.tsx   ← DashboardLayout (侧边栏 + 内容区)
        └── app/(dashboard)/page.tsx   ← 页面内容
        └── app/(dashboard)/departments/page.tsx
        └── ...
```

### 代码定位

📁 **`app/layout.tsx`** — 根布局
- 必须包含 `<html>` 和 `<body>` 标签
- 必须接收 `children` prop
- 放在这里的组件会在所有页面中渲染（包括登录页）
- `metadata` 导出用于 SEO

📁 **`app/(dashboard)/layout.tsx`** — 嵌套布局 (Route Group)
- 只作用于 `(dashboard)` 内的页面
- 登录页（`/login`）不受此布局影响
- 包含侧边栏 + 内容区的 flex 布局

📁 **`app/providers.tsx`** — 客户端边界
- `"use client"` 标记，作为 Client Boundary
- 包裹 `SessionProvider`（Auth.js 的 React Context）
- 包裹 `Toaster`（sonner 通知组件）
- 所有需要 session 的组件都在这个边界内

### 知识要点
- Layout 在路由切换时**不会重新渲染**（只有 children 变化）
- 这意味侧边栏状态（如折叠/展开）在页面跳转时保持不变
- `metadata` 可以在 layout 或 page 中导出，page 的会合并到 layout 的
- `force-dynamic` 使 layout/page 变成动态渲染（每次请求重新获取数据）

---

## 4. Server Actions 数据操作

### 核心概念
Server Actions 是 Next.js 的核心特性之一：**在服务端执行的函数，可以从客户端直接调用**，无需手动创建 API Route。

### 代码定位

📁 **`app/(dashboard)/departments/actions.ts`** — 标准 CRUD Actions
```tsx
"use server";  // 【关键】标记整个文件为 Server Actions

import { revalidatePath } from "next/cache";

export async function createDepartment(data) {
  await db.insert(departments).values({...});
  revalidatePath("/departments");  // 【关键】使缓存失效
}

export async function getDepartments() {
  return db.select().from(departments).orderBy(departments.name);
}
```

📁 **`app/(dashboard)/departments/department-list.tsx`** — 客户端调用
```tsx
// 客户端组件中直接 import Server Action，像调用本地函数一样
import { createDepartment, getDepartments } from "./actions";

async function handleSubmit() {
  await createDepartment(values);           // Next.js 自动发送 POST 请求
  const fresh = await getDepartments();     // 重新获取最新数据
  setData(fresh);
}
```

📁 **`lib/audit.ts`** — Server Action 中的 auth() 调用
```tsx
"use server";

export async function log(action, entity, entityId, details) {
  const session = await auth();  // Server Action 中获取当前用户
  await db.insert(auditLogs).values({ user: session?.user?.name, ... });
}
```

### 知识要点
- Server Actions 只能在**服务端执行**（"use server"）
- 从客户端调用时，Next.js 自动生成 POST 端点，透明传输
- `revalidatePath(path)` 是最重要的概念 — 不清除缓存，页面不会更新
- Server Action 可以在 Server Component、Client Component 中调用
- 参数和返回值会被序列化（不能传函数、类实例等不可序列化的值）
- `form.formState.isSubmitting` 自动跟踪 Server Action 的 pending 状态

---

## 5. 认证 (NextAuth v5 / Auth.js)

### 核心概念
Auth.js (next-auth v5) 是 Next.js 生态的认证库，支持 OAuth、Credentials、Magic Link 等多种登录方式。

### 代码定位

📁 **`lib/auth.ts`** — 完整认证配置
```
NextAuth(config)
├── providers: [Credentials({ authorize })]  ← 登录方式
├── callbacks:
│   ├── jwt({ token, user })         ← 登录时将 role 写入 JWT
│   ├── session({ session, token })  ← 读取时将 role 从 JWT 映射到 session
│   └── authorized({ auth })         ← middleware 中判断是否放行
└── pages: { signIn: "/login" }      ← 自定义登录页路由
```

**关键流程**:
1. 用户登录 → `authorize()` 验证凭据 → 返回 user 对象
2. `jwt()` callback 把 `role` 编码进 JWT token
3. 生成 `authjs.session-token` cookie 发送给浏览器
4. 后续请求 → middleware 读取 cookie → 验证 JWT → `auth.user` 可用
5. `session()` callback 把 JWT 中的 `role` 映射到前端 `session.user.role`

📁 **`app/api/auth/[...nextauth]/route.ts`** — Auth API 端点
```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;  // 一行代码暴露所有认证 API
```

📁 **`app/login/page.tsx`** — 登录页面
```tsx
const result = await signIn("credentials", {
  username: formData.get("username"),
  password: formData.get("password"),
  redirect: false,  // 手动控制跳转
});
if (!result?.error) {
  router.push("/");      // 登录成功跳转
  router.refresh();      // 刷新服务端组件缓存
}
```

📁 **`app/components/sidebar.tsx`** — 显示用户信息
```tsx
const { data: session } = useSession();  // 客户端获取 session
// session.user.name → 用户名
// session.user.role → 角色（通过 session callback 注入）
```

### 知识要点
- NextAuth() 返回 `{ handlers, auth, signIn, signOut }`
- `auth()` 用于 **Server Component**，`useSession()` 用于 **Client Component**
- JWT callback 只在登录时触发一次；Session callback 每次读取 session 都触发
- middleware 中的 `auth.user` 只包含 `name/email/image`，自定义字段需要类型断言
- `signIn("credentials", { redirect: false })` 用于手动控制登录流程

---

## 6. Middleware 中间件

### 核心概念
Middleware 在**每个请求进入路由之前**执行，运行在 **Edge Runtime**（快速、轻量）。

### 代码定位

📁 **`proxy.ts`** — Middleware 入口
```ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // matcher 控制哪些路径触发 middleware
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|svgs).*)"],
};
```

📁 **`lib/auth.config.ts`** — Middleware 授权逻辑
```ts
callbacks: {
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = !!auth?.user;
    // 已登录 → 不能访问 /login
    // 未登录 → 重定向到 /login
    // 已登录 → 放行
  }
}
```

### 知识要点
- Middleware 在 **Edge Runtime** 运行，不能访问 Node.js API（fs、数据库等）
- `config.matcher` 用类似正则的 glob 模式匹配路径
- Middleware 中的 session 是轻量级的（只含 name/email/image）
- 复杂权限检查应该在 **Page（Server Component）** 中做，不在 middleware
- Middleware 返回 `Response.redirect()` 做重定向
- Middleware 文件可以放在 `src/` 或根目录，通过 `export default` 导出

---

## 7. 页面级权限控制

### 核心概念
页面级权限控制在 **Server Component 渲染前** 执行，可以访问数据库、做复杂判断。

### 代码定位

📁 **`app/(dashboard)/roles/page.tsx`** — 管理员页面保护
```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RolesPage() {
  const session = await auth();
  // 【关键】页面级角色检查
  if ((session?.user as { role?: string })?.role !== "admin") {
    redirect("/");  // 服务端重定向
  }
  const data = await getRoles();
  return <RoleList initialData={data} />;
}
```

📁 **`app/(dashboard)/audit-logs/page.tsx`** — 同样模式

### 知识要点
- `auth()` 在 Server Component 中读取 cookie，无额外网络请求
- `redirect()` 抛出 `NEXT_REDIRECT` error，Next.js 拦截后返回 307 重定向
- 三明治模式: Middleware → Page → Server Action 各自做不同粒度的检查

---

## 8. 数据库集成 (Drizzle ORM)

### 核心概念
Drizzle ORM 是 TypeScript-first 的 ORM，与 Next.js Server Components 完美契合。

### 代码定位

📁 **`lib/db/schema.ts`** — 表结构定义（8 张表）
- `pgTable()` 定义表，自动推导 TypeScript 类型
- JSONB 字段用 `.$type<T>()` 指定 TS 类型
- 外键用 `.references(() => otherTable.id)`

📁 **`lib/db/index.ts`** — 连接管理
- 模块级单例: `const db = drizzle(client, { schema })`
- `ensureSchema()`: 用 `CREATE TABLE IF NOT EXISTS` 自动建表
- 连接池: `postgres(url, { max: 10 })`

### 知识要点
- 数据库操作只能在**服务端**执行（Server Component / Server Action / API Route）
- 模块级 `const db` 在开发热重载时不会重复初始化
- `.returning()` 方法可以获取插入后的记录（如自增 ID）
- `sql` 模板字面量用于写原始 SQL 条件

---

## 9. 工作流状态机

### 核心概念
企业系统中的审批流程本质是**有限状态机**，不同状态下显示不同的 UI 和操作。

### 代码定位

📁 **`app/(dashboard)/leaves/leave-list.tsx`** — 请假工作流
```
状态: pending → approved / rejected
UI 逻辑:
- pending: 显示 [Approve] [Reject] [Delete]
- approved/rejected: 只显示 [Delete]
```

📁 **`app/(dashboard)/performance/performance-list.tsx`** — 考核工作流
```
状态: draft → self_review → completed
UI 逻辑:
- draft: 显示 [Self Review]
- self_review: 显示 [Manager Review]
- completed: 显示 [View] (只读)
```

### 知识要点
- 状态字段用 `varchar` 存储（比 enum 更灵活，不需要 ALTER TABLE）
- 状态流转逻辑在 Server Action 中实现（`update().set({ status: "approved" })`）
- 条件渲染决定哪些按钮可见（`{status === "pending" && <ApproveButton/>}`）
- 状态徽章用颜色编码（绿=完成/批准，琥珀=待处理，红=拒绝）

---

## 10. 跨模块数据依赖

### 核心概念
一个模块的页面往往需要其他模块的数据（如资产列表需要员工列表来填充"使用人"下拉框）。

### 代码定位

📁 **`app/(dashboard)/assets/page.tsx`** — 跨模块数据获取
```tsx
import { getAssets } from "./actions";
import { getEmployees } from "../employees/actions";  // 跨模块导入

export default async function AssetsPage() {
  // 【关键】Server Component 中可以跨模块调用
  const assets = await getAssets();
  const employees = await getEmployees();
  return <AssetList initialData={assets} initialEmps={employees} />;
}
```

📁 **`app/(dashboard)/leaves/page.tsx`** — 跨多模块
```tsx
const [leaveData, leaveTypesData, employeesData] = await Promise.all([
  getLeaveRequests(),  // 请假数据
  getLeaveTypes(),     // 请假类型
  getEmployees(),      // 员工列表
]);
return <LeaveList initialData={...} leaveTypes={...} employees={...} />;
```

### 知识要点
- 跨模块可以 `import` 其他模块的 Server Actions（都在服务端运行）
- `Promise.all` 并行请求提升性能（串行 await 会等待）
- 数据通过 props 从 Server Component 向下传递到 Client Component

---

## 11. RBAC 权限体系

### 核心概念
RBAC (Role-Based Access Control) = 角色 → 权限 → 功能访问控制

### 三层权限架构

```
Level 1: Middleware (proxy.ts + auth.config.ts)
  └── 检查: 是否登录？
  └── 粒度: 路由级
  └── 代码: authorized({ auth }) return auth?.user != null

Level 2: Page Server Component (roles/page.tsx)
  └── 检查: 当前角色是否允许访问此页面？
  └── 粒度: 页面级
  └── 代码: auth() → session.user.role → redirect("/")

Level 3: Server Action (actions.ts)
  └── 检查: 当前用户是否允许执行此操作？
  └── 粒度: 操作级
  └── 代码: hasPermission(userPermissions, "departments:write")
```

### 代码定位

📁 **`lib/rbac.ts`** — 权限定义和检查工具
- `PERMISSIONS` 常量：定义所有权限项（`"departments:read"` 等）
- `DEFAULT_ROLES`：预置三个角色（admin / manager / user）
- `hasPermission(userPermissions, required)`: boolean

📁 **`app/(dashboard)/roles/role-list.tsx`** — 角色 CRUD + 权限分配
- JSONB 存储权限数组：`permissions: ["departments:read", "employees:write", ...]`
- 分组复选框 UI：按模块分组显示权限选项

### 知识要点
- JSONB 存储权限比多表关联更简单直观
- `as const` 让 TypeScript 推导出字面量类型
- 中间件中的 `auth.user` 不含 `role`，必须用 `auth()` 获取

---

## 12. 关键 API 速查表

### 路由 & 导航

| API | 来源 | 用途 | 环境 |
|---|---|---|---|
| `usePathname()` | `next/navigation` | 获取当前 URL 路径 | Client |
| `useRouter()` | `next/navigation` | 编程式导航 (push/refresh) | Client |
| `redirect(url)` | `next/navigation` | 服务端重定向 | Server |
| `<Link href>` | `next/link` | 声明式导航（SPA 跳转） | Client |

### 数据获取 & 缓存

| API | 来源 | 用途 | 环境 |
|---|---|---|---|
| `export const dynamic = "force-dynamic"` | — | 禁用静态渲染 | Server |
| `revalidatePath(path)` | `next/cache` | 使路径缓存失效 | Server |
| `cookies()` | `next/headers` | 读取 Cookie | Server |

### 认证

| API | 来源 | 用途 | 环境 |
|---|---|---|---|
| `auth()` | `@/lib/auth` | 获取服务端 session | Server |
| `useSession()` | `next-auth/react` | 获取客户端 session | Client |
| `signIn()` | `next-auth/react` | 客户端登录 | Client |
| `signOut()` | `next-auth/react` | 客户端登出 | Client |

### 渲染标记

| 指令 | 作用 |
|---|---|
| `"use client"` | 标记 Client Component（文件顶部第一行） |
| `"use server"` | 标记 Server Actions（文件顶部或函数顶部） |

---

## 项目文件索引

### 核心文件（必读）

| 文件 | 知识点 |
|---|---|
| `app/layout.tsx` | RootLayout, Metadata, next/font |
| `app/providers.tsx` | Client Boundary, SessionProvider |
| `proxy.ts` | Middleware 入口, config.matcher |
| `lib/auth.config.ts` | Middleware authorized callback |
| `lib/auth.ts` | NextAuth 配置, JWT/Session callbacks |
| `app/api/auth/[...nextauth]/route.ts` | Catch-all API Route |
| `lib/db/schema.ts` | Drizzle ORM 表定义, JSONB |
| `lib/db/index.ts` | 数据库连接, ensureSchema |

### 功能模块（学习数据流）

| 模块 | Page (Server) | Actions (Server) | List (Client) |
|---|---|---|---|
| Departments | `app/(dashboard)/departments/page.tsx` | `.../actions.ts` | `.../department-list.tsx` |
| Employees | `app/(dashboard)/employees/page.tsx` | `.../actions.ts` | `.../employee-list.tsx` |
| Assets | `app/(dashboard)/assets/page.tsx` | `.../actions.ts` | `.../asset-list.tsx` |
| Leaves | `app/(dashboard)/leaves/page.tsx` | `.../actions.ts` | `.../leave-list.tsx` |
| Salaries | `app/(dashboard)/salaries/page.tsx` | `.../actions.ts` | `.../salary-list.tsx` |
| Performance | `app/(dashboard)/performance/page.tsx` | `.../actions.ts` | `.../performance-list.tsx` |
| Roles | `app/(dashboard)/roles/page.tsx` | `.../actions.ts` | `.../role-list.tsx` |
| Audit Logs | `app/(dashboard)/audit-logs/page.tsx` | `.../actions.ts` | `.../audit-log-list.tsx` |

### 共享库

| 文件 | 用途 |
|---|---|
| `lib/rbac.ts` | 权限定义 + 检查工具 |
| `lib/audit.ts` | 审计日志写入 |
| `app/components/sidebar.tsx` | 侧边栏导航组件 |
| `app/login/page.tsx` | 登录页面 |

---

## 学习建议

1. **从 Departments 模块开始** — 这是最简洁的 CRUD 例子，涵盖完整的 Server/Client/Action 模式
2. **然后看 Leaves 和 Performance** — 理解工作流状态机
3. **再看 Roles 和 auth.config.ts** — 理解三层权限控制
4. **最后看 Dashboard** — 理解跨模块数据聚合

每个模块都有密集的中文注释，建议对照代码和本笔记一起阅读。
