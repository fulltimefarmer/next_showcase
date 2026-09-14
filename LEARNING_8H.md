# Next.js 全栈开发 · 8 小时速成指南 / Next.js Full-Stack Development · 8-Hour Crash Course

> **中文**：面向熟练 Java 后端工程师的 Next.js 16 (App Router) 快速入门。学习材料为本仓库 `next_showcase`（企业管理系统，含认证 / RBAC / 审批工作流 / 审计日志）。每个知识点都映射到 Java/Spring 生态的对应概念，用已有知识加速理解。
>
> **English**: A fast-track guide to Next.js 16 (App Router) for experienced Java backend engineers. Learning material: this repo `next_showcase` (a company management system with auth / RBAC / approval workflows / audit logs). Each concept is mapped to its Java/Spring counterpart to accelerate learning.

---

> ## 🆕 新增学习案例 / New Hands-on Cases
>
> 本次在原项目基础上，补齐了**项目原本没有、但对 Next.js 全栈开发很重要**的 9 个知识点，全部落在 `app/concepts/` 学习区，可直接运行体验。
> These 9 important-but-missing concepts are implemented under `app/concepts/` and runnable.
>
> | # | 知识点 / Concept | 入口 / Entry | 一句话 / One-liner |
> |---|---|---|---|
> | 1 | `loading.tsx` + Suspense 流式渲染 / Streaming | `/concepts/loading` | 慢组件先显示骨架屏，快内容立即渲染 |
> | 2 | `error.tsx` 错误边界 / Error boundary | `/concepts/error` | 局部容错 + reset 重试 |
> | 3 | `not-found.tsx` + `notFound()` / 404 | `/concepts/not-found` | 主动返回 404 + 自定义页面 |
> | 4 | `generateMetadata` 动态 SEO / Dynamic SEO | `/concepts/metadata/42` | 按参数动态生成 title/meta |
> | 5 | ISR（`revalidate`）增量静态再生成 / ISR | `/concepts/isr` | 静态缓存 + 定时后台更新 |
> | 6 | `useSearchParams` URL 筛选 / URL filters | `/concepts/search` | 查询参数驱动筛选，可分享可回退 |
> | 7 | `useOptimistic` 乐观更新 / Optimistic UI | `/concepts/optimistic` | React 19：提交立即更新，失败回滚 |
> | 8 | Route Handlers 完整 CRUD / API routes | `/concepts/route-handlers` | GET/POST/PUT/DELETE + 动态参数 + cookies/headers |
> | 9 | `next/image` 图片优化 / Image optimization | `/concepts/image` | 格式转换、懒加载、CLS=0 |
>
> 详细讲解见文末 [🆕 补充案例 / Additional Cases](#additional-cases) 章节。

---

## 目录 / Table of Contents

- [0. 项目整体心智模型 / Project Mental Model](#0-项目整体心智模型--project-mental-model)
- [第 1 小时 / Hour 1：App Router 路由系统 / Routing](#第-1-小时--hour-1app-router-路由系统--routing)
- [第 2 小时 / Hour 2：Server Component vs Client Component](#第-2-小时--hour-2server-component-vs-client-component)
- [第 3 小时 / Hour 3：数据获取与渲染策略 / Data Fetching & Rendering](#第-3-小时--hour-3数据获取与渲染策略--data-fetching--rendering)
- [第 4 小时 / Hour 4：Server Actions —— 全栈核心](#第-4-小时--hour-4server-actions--全栈核心)
- [第 5 小时 / Hour 5：认证 (Auth.js v5) 与路由保护 / Auth & Route Protection](#第-5-小时--hour-5认证-authjs-v5-与路由保护--auth--route-protection)
- [第 6 小时 / Hour 6：数据库集成与表单校验 / Drizzle ORM & Validation](#第-6-小时--hour-6数据库集成与表单校验--drizzle-orm--validation)
- [第 7 小时 / Hour 7：实战 —— 状态机 / RBAC / 审计日志 / State Machine, RBAC & Audit](#第-7-小时--hour-7实战--状态机--rbac--审计日志--state-machine-rbac--audit)
- [第 8 小时 / Hour 8：构建、部署、测试与总结 / Build, Deploy, Test & Summary](#第-8-小时--hour-8构建部署测试与总结--build-deploy-test--summary)
- [🆕 补充案例 / Additional Cases](#additional-cases)
- [附录 / Appendix：关键 API 速查表 / API Cheat Sheet](#附录--appendix关键-api-速查表--api-cheat-sheet)

---

## 0. 项目整体心智模型 / Project Mental Model

**Java 视角的一句话总结 / One-sentence summary (Java perspective)**：Next.js 把「前后端」合并进一个项目 —— 服务端组件相当于「Controller + View 模板引擎」，Server Action 相当于「无 REST 注解的 Controller 方法」，客户端组件相当于「原生 JS + React 的交互层」。

**English**: Next.js merges frontend and backend into one project — Server Components act like "Controller + view template engine", Server Actions act like "Controller methods without REST annotations", and Client Components are the "interactive layer built with React".

```
┌─────────────────────────────────────────────────────┐
│  Browser (Client)                                    │
│   ├─ Client Component  ("use client")                │  ← interaction, hooks, events
│   └─ Calls Server Actions (auto POST, no manual fetch)│
├─────────────────────────────────────────────────────┤
│  Server (Node.js Runtime)                            │
│   ├─ Middleware (Edge Runtime)                       │  ← like a Spring Filter
│   ├─ Server Component (default)                      │  ← like Thymeleaf rendering
│   ├─ Server Action  ("use server")                   │  ← like @Controller methods
│   └─ Database (Drizzle ORM + PostgreSQL)             │
└─────────────────────────────────────────────────────┘
```

**项目结构速览 / Project structure at a glance**（每个业务模块都是「三段式」，先记住这个模式 / every module follows a 3-part pattern）:

```
app/(dashboard)/departments/
├── page.tsx             # Server Component: queries data, passes to client
├── actions.ts           # Server Actions: DB ops + revalidatePath
└── department-list.tsx  # Client Component: forms, modals, list refresh
```

**建议的阅读顺序 / Suggested reading order**:
1. `departments/` —— 最简 CRUD，理解三段式 / simplest CRUD, learn the pattern
2. `leaves/` + `performance/` —— 工作流状态机 / workflow state machines
3. `roles/` + `lib/auth.config.ts` —— 三层权限 / three-layer permission control
4. `lib/auth.ts` + `proxy.ts` —— 认证链路 / auth flow

---

## 第 1 小时 / Hour 1：App Router 路由系统 / Routing

**目标 / Goal**: 理解「文件即路由」的约定，能徒手建出任意页面和 API。/ Understand "file = route" conventions and build any page/API by hand.

### 核心概念 / Core concepts（Java 映射 / Java mapping）

| Next.js App Router | Java/Spring 对应 / equivalent | 说明 / Notes |
|---|---|---|
| `app/page.tsx` | `@GetMapping("/")` | 首页 / home |
| `app/login/page.tsx` | `@GetMapping("/login")` | 登录页 / login |
| `app/api/**/route.ts` | `@RestController` | API 端点 / API endpoint |
| `(group)/` 括号目录 / parenthesized dir | — | 分组，不影响 URL / groups without affecting URL |
| `[id]/` 方括号目录 / bracketed dir | `@PathVariable` | 动态路由 / dynamic route |
| `[...slug]/` | `**` 通配 / wildcard | Catch-all 路由 / catch-all route |

### 关键文件约定 / Key file conventions（对照代码 / see code）

| 文件名 / File | 作用 / Purpose | 本仓库示例 / Example |
|---|---|---|
| `page.tsx` | 渲染一个页面 / render a page | `app/(dashboard)/departments/page.tsx` |
| `layout.tsx` | 布局（包裹子页面）/ layout | `app/layout.tsx`, `app/(dashboard)/layout.tsx` |
| `route.ts` | API 端点（导出 GET/POST 等）/ API endpoint | `app/api/auth/[...nextauth]/route.ts` |
| `loading.tsx` | 加载中 UI（本仓库未用）/ loading UI | — |
| `error.tsx` | 错误边界（本仓库未用）/ error boundary | — |

### 三个必懂概念 / Three must-know concepts

**① Route Group `(dashboard)` —— 括号不影响 URL / parentheses do NOT affect the URL**

`app/(dashboard)/departments/page.tsx` 对应的 URL 仍然是 `/departments`。/ The URL is still `/departments`.
它的作用是让一组页面共享一个 `layout.tsx`（侧边栏 + 内容区），而登录页 `/login` 不受影响。/ Its purpose: let a group of pages share one `layout.tsx` (sidebar + content), while `/login` stays independent.

```
app/layout.tsx                       ← root layout (html/body/providers)
  ├── app/login/page.tsx             ← NOT affected by dashboard layout
  └── app/(dashboard)/layout.tsx     ← sidebar + content area
        ├── page.tsx                 ← /  (Dashboard)
        └── departments/page.tsx     ← /departments
```

**② `[...nextauth]` Catch-all 动态路由 / catch-all dynamic route**

`app/api/auth/[...nextauth]/route.ts` 中 `[...nextauth]` 匹配 `/api/auth/` 下所有子路径（signin、callback、session…）。Auth.js 只导出一对 `GET/POST` handler，就接管了全部认证接口。/ `[...nextauth]` matches all sub-paths under `/api/auth/`. Auth.js exports just one pair of `GET/POST` handlers to handle all auth endpoints.

**③ Layout 在路由切换时不重新渲染 / Layout does NOT re-render on route change**

从 `/departments` 切到 `/employees`，`(dashboard)/layout.tsx`（侧边栏）**不会**重新执行，只有 `children` 变化。/ Navigating from `/departments` to `/employees` does NOT re-run the layout; only `children` change. That's why the sidebar's collapsed state persists across navigation.

### 动手练习 / Hands-on (15 min)

1. 在 `app/(dashboard)/` 下新建 `test/page.tsx`，写一个最简单的 `export default function TestPage() { return <h1>Test</h1> }` / Create `test/page.tsx` under `app/(dashboard)/` with a minimal page.
2. 访问 `/test`，确认能打开且左侧侧边栏还在 / Visit `/test`, confirm it opens and the sidebar still shows.
3. 把目录改成 `app/(dashboard)/(admin)/test/`，再访问 `/test`，确认 URL 不变 / Move it to `app/(dashboard)/(admin)/test/`, visit `/test`, confirm the URL is unchanged.
4. 在 `app/api/hello/route.ts` 写 `export async function GET() { return Response.json({ ok: true }) }`，访问 `/api/hello` / Add a `hello` API route and test it.

---

## 第 2 小时 / Hour 2：Server Component vs Client Component

**目标 / Goal**: 这是 Next.js 最重要的心智模型，必须彻底搞懂。/ The most important mental model — master it.

### 一张表搞懂区别 / One-table comparison

| | Server Component（默认 / default） | Client Component（`"use client"`） |
|---|---|---|
| 运行环境 / Runtime | 服务端 Node.js / server | 浏览器 / browser |
| 数据库访问 / DB access | ✅ 直接 `await db.select()` | ❌ 只能通过 Server Action / only via actions |
| hooks | ❌ `useState` 不可用 | ✅ |
| 事件处理 / events | ❌ 无 `onClick` | ✅ |
| JS 体积 / bundle | 不下发 / not shipped | 下发 / shipped |
| 类比 / analogy | Thymeleaf/Freemarker 模板 | 原生 JS 交互层 |

### 核心代码定位 / Key code locations

**Server Component 直接查库 / direct DB query** —— `app/(dashboard)/page.tsx`

```tsx
export const dynamic = "force-dynamic";  // 禁用静态缓存，每次请求都查库 / disable static cache

export default async function DashboardPage() {
  const [deptCount] = await db.select({ value: count() }).from(departments);
  return <div>{deptCount.value}</div>;
}
```

对比 Java / Compared to Java：这就是「Controller 里查数据库，把结果渲染进 HTML 返回」，只是没有显式的 `@GetMapping` 注解 —— **文件名即路由，async 组件即接口**。/ "Query the DB in a controller and render the result into HTML" — just without explicit `@GetMapping`: **the filename is the route, the async component is the endpoint**.

**Server Component 作为 Data Loader** —— `app/(dashboard)/departments/page.tsx`

```tsx
export default async function DepartmentsPage() {
  const data = await getDepartments();          // 服务端查库 / query on server
  return <DepartmentList initialData={data} />;  // 通过 props 传给客户端 / pass via props
}
```

**Client Component 负责交互 / handles interaction** —— `department-list.tsx`

```tsx
"use client";
export function DepartmentList({ initialData }) {
  const [data, setData] = useState(initialData);  // 客户端才有 hooks / hooks only on client
  // ... 表单、弹窗、按钮都在这 / forms, modals, buttons live here
}
```

### 三条铁律 / Three rules

1. **Server Component 可以 import Client Component，反之不行**。/ A Server Component can import a Client Component, not the other way around.
2. **数据获取放 Server，交互放 Client** —— 性能关键（数据库逻辑不下发到浏览器）。/ Put data fetching on the server and interaction on the client — DB logic is never shipped to the browser.
3. **`"use client"` 是「客户端边界」**：被它包裹的整个子树都会变成客户端。参考 `app/providers.tsx`（SessionProvider 必须在客户端）。/ `"use client"` marks a client boundary; the whole subtree becomes client. See `app/providers.tsx`.

### 动手练习 / Hands-on (15 min)

1. 打开 `departments/page.tsx` 和 `department-list.tsx`，指出「谁查库、谁交互」。/ Identify "who queries the DB, who handles interaction".
2. 尝试在一个 Server Component 里写 `useState`，观察编译报错（理解边界最快的方式）。/ Try `useState` in a Server Component and observe the error — the fastest way to learn the boundary.

---

## 第 3 小时 / Hour 3：数据获取与渲染策略 / Data Fetching & Rendering

**目标 / Goal**: 理解渲染模式（SSG/SSR/ISR）和缓存，知道什么时候会「拿到旧数据」。/ Understand SSG/SSR/ISR and caching, and when you might get stale data.

### 三种渲染策略 / Three rendering strategies（Java 映射 / mapping）

| 策略 / Strategy | 触发方式 / Trigger | 何时渲染 / When rendered | Java 类比 / analogy |
|---|---|---|---|
| 静态 SSG / Static | 默认 / default | 构建时一次 / at build time | 预生成静态 HTML |
| 动态 SSR / Dynamic | `export const dynamic = "force-dynamic"` | 每次请求 / per request | 实时渲染 |
| 增量 ISR / Incremental | `export const revalidate = 60` | 按时间间隔 / on interval | 缓存 + 定时刷新 |

### 为什么本仓库几乎每个 page 都有 `force-dynamic`？/ Why almost every page uses `force-dynamic`?

因为这是带登录、实时数据的后台系统，**构建时无法预渲染**（不知道用户是谁、数据一直在变）。不声明的话，Next.js 会在 `next build` 时尝试静态生成，导致报错或返回过期数据。/ Because this is an authenticated, real-time admin system that can't be pre-rendered at build time. Without it, `next build` tries to statically generate and either errors or serves stale data.

### 缓存失效 / Cache invalidation：`revalidatePath` —— 最关键的一个 API / the most important API

这是 Next.js 和传统 SPA + REST 最大的区别之一。**写操作后不清缓存，页面不会更新。** / A key difference from classic SPA + REST: **without clearing the cache after a write, the page won't update.**

```tsx
// actions.ts
export async function createDepartment(data) {
  await db.insert(departments).values({...});
  revalidatePath("/departments");  // 使 /departments 的缓存失效 / invalidate cache
}
```

- `revalidatePath(path)`：按路径失效 / by path
- `revalidateTag(tag)`：按标签失效 / by tag
- `router.refresh()`：客户端手动刷新服务端组件缓存（见 `login/page.tsx`）/ client-side refresh

### 数据获取的两种方式 / Two ways to fetch data

1. **Server Component 直接查库**（本项目用法，推荐）/ direct DB query (recommended)
2. **`fetch` 自带缓存**：`fetch(url, { next: { revalidate: 60 } })` 用于调第三方 API。/ fetch with built-in cache for third-party APIs.

### 动手练习 / Hands-on (15 min)

1. 在 departments 页面删掉 `createDepartment` 里的 `revalidatePath`，新增一个部门，观察页面**不刷新**的现象，再加回来。/ Remove `revalidatePath`, create a department, observe the page NOT refreshing, then restore it.
2. 在浏览器 DevTools Network 里观察保存时实际发出的请求（Server Action 自动生成的 POST）。/ Observe the auto-generated POST request in the Network tab.

---

## 第 4 小时 / Hour 4：Server Actions —— 全栈核心

**目标 / Goal**: 理解 Server Action 如何替代手写 REST 接口，成为 Next.js 全栈开发的灵魂。/ Understand how Server Actions replace handwritten REST endpoints.

### 核心概念 / Core concept（Java 映射 / mapping）

Server Action = **`"use server"` 声明的函数，可以从客户端像调用本地函数一样调用**。/ A function declared with `"use server"` that clients can call like a local function.

| 概念 / Concept | Java/Spring 对应 / equivalent |
|---|---|
| `"use server"` 文件 / file | `@RestController` 类的所有方法 / all methods of a controller |
| 单个导出函数 / exported function | `@PostMapping` 方法 |
| 客户端 import 并调用 / client imports & calls | 前端 `fetch` 封装 / fetch wrapper |
| `revalidatePath` | 手动清缓存（Next.js 特有）/ cache invalidation (Next.js-specific) |

### 完整链路 / Full chain（对照 `departments` 模块）

**① 定义 Server Action / Define** —— `app/(dashboard)/departments/actions.ts`

```tsx
"use server";   // 整个文件的导出函数都是 Server Action / all exports are actions

import { revalidatePath } from "next/cache";

export async function createDepartment(data: { name: string; description?: string }) {
  await db.insert(departments).values({ name: data.name, description: data.description || null });
  revalidatePath("/departments");
}
```

**② 客户端直接调用 / Client calls it directly** —— `department-list.tsx`

```tsx
"use client";
import { createDepartment, getDepartments } from "./actions";

async function onFormSubmit(values) {
  await createDepartment(values);      // 看起来像本地调用，实际是 POST / looks local, actually POST
  const fresh = await getDepartments(); // 重新拉最新数据 / re-fetch latest data
  setData(fresh);
}
```

### 关键理解点 / Key points

1. **不需要写 `/api/departments` 这种接口** —— Next.js 自动为每个 Server Action 生成 POST 端点。/ No need to write REST endpoints; Next.js auto-generates a POST endpoint per action.
2. **参数和返回值会被序列化** —— 不能传函数、class 实例、`Date`（需先转字符串）。/ Args and return values are serialized — no functions, class instances, or raw `Date`.
3. **类型安全贯穿** —— `actions.ts` 返回类型能被客户端推导（`Awaited<ReturnType<typeof getDepartments>>[number]`）。/ Types flow end-to-end.
4. **`revalidatePath` 必须在写操作后调用** —— 否则 UI 不更新。/ Always call it after writes.

### 常见陷阱 / Common pitfalls

- 把 Server Action 当普通函数在客户端 import 后，却以为它同步返回：它是 async 的，必须 `await`。/ They're async — always `await`.
- 在 Server Action 里读 `useState`：不可能，Action 在服务端跑。/ No React state on the server.

### 动手练习 / Hands-on (30 min)

1. 通读 `departments/actions.ts`（4 个函数）—— 最简 CRUD 范本。/ Read the 4 functions — the simplest CRUD template.
2. 对照 `employees/actions.ts`，找外键字段 `departmentId` 的处理差异。/ Compare FK handling in employees.
3. 打开 `leaves/actions.ts`，理解 `leftJoin` 如何把员工名/类型名拼进结果。/ Understand how `leftJoin` embeds names.

---

## 第 5 小时 / Hour 5：认证 (Auth.js v5) 与路由保护 / Auth & Route Protection

**目标 / Goal**: 理解 NextAuth 认证链路 + 三层权限控制。/ Understand the Auth.js flow + three-layer authorization.

### 认证链路 / Auth flow（对照 `lib/auth.ts`）

```
用户提交登录表单 (login/page.tsx)
   → signIn("credentials", { ... })          // 客户端发起 / client initiates
   → Credentials.authorize() 验证账号密码    // lib/auth.ts
   → jwt() callback 把 role 写入 JWT token
   → 生成 session cookie 下发浏览器 / issue session cookie
   → 后续请求 middleware 读 cookie 验证 / middleware verifies
   → session() callback 把 role 映射到前端 / map role to session
```

**关键文件 / Key files**:

| 文件 / File | 作用 / Purpose |
|---|---|
| `lib/auth.ts` | 完整配置（Credentials + jwt/session callbacks）/ full config |
| `lib/auth.config.ts` | 中间件配置（pages + authorized callback）/ middleware config |
| `proxy.ts` | Middleware 入口（导出 `NextAuth(authConfig).auth`）/ middleware entry |
| `app/api/auth/[...nextauth]/route.ts` | 认证 API 端点 / auth API endpoint |
| `app/providers.tsx` | SessionProvider 客户端边界 / client boundary |

### 两个 callback 的时机 / Two callback timings（易混淆，务必记牢 / easy to mix up）

| Callback | 触发时机 / When | 作用 / Purpose |
|---|---|---|
| `jwt({ token, user })` | **只在登录时**触发一次 / once at login | 把自定义字段（role）写入 JWT / write role into JWT |
| `session({ session, token })` | **每次读取 session**都触发 / on every read | 把 JWT 的 role 映射到 session.user / map role to session |

### `auth()` vs `useSession()`

| API | 环境 / Environment | 说明 / Notes |
|---|---|---|
| `auth()` | Server Component / Server Action | 直接读 cookie，无网络请求 / reads cookie directly |
| `useSession()` | Client Component | 通过 Context 获取，需在 SessionProvider 内 / via Context |

### 三层权限控制 / Three-layer authorization

```
Level 1: Middleware (proxy.ts + auth.config.ts)
  → 判断「是否登录」，未登录重定向到 /login / check login, redirect to /login
Level 2: Page Server Component (roles/page.tsx)
  → auth() 拿 session，判断 role，非 admin 则 redirect("/") / check role
Level 3: Server Action
  → 每个操作校验权限（lib/rbac.ts 的 hasPermission）/ per-operation check
```

**为什么 role 检查不放 middleware？** 因为 middleware 运行在 **Edge Runtime**（快、轻量），session 解码是精简的，只含 `name/email/image`，**不含 role**。复杂权限判断必须回到能访问数据库的 Server Component 做。/ Middleware runs on Edge Runtime with a slim session (no `role`); complex checks belong in the Server Component that can access the DB.

### 动手练习 / Hands-on (30 min)

1. 通读 `lib/auth.ts`（USERS 硬编码 + 两个 callback）。/ Read the hardcoded USERS + two callbacks.
2. 通读 `lib/auth.config.ts` 的 `authorized` 回调。/ Read the `authorized` callback.
3. 用 `admin` / `manager` / `user` 三个账号分别登录。/ Log in with the three test accounts.
4. 用 `user` 账号直接访问 `/roles`，观察被重定向回 `/`。/ Visit `/roles` as `user` and observe the redirect.

---

## 第 6 小时 / Hour 6：数据库集成与表单校验 / Drizzle ORM & Validation

**目标 / Goal**: 理解 TypeScript-first ORM 与 Server Components 的配合，以及 Zod + react-hook-form 校验。/ Understand the TS-first ORM and Zod + react-hook-form validation.

### Drizzle ORM（对照 `lib/db/`）

| 概念 / Concept | 说明 / Notes | 位置 / Location |
|---|---|---|
| `pgTable()` | 定义表，自动推导 TS 类型 / define table, infer types | `schema.ts` |
| `drizzle(client)` | 创建 ORM 实例（模块单例）/ create singleton instance | `index.ts` |
| `ensureSchema()` | `CREATE TABLE IF NOT EXISTS` 自动建表 / auto-create tables | `index.ts` |
| `.returning()` | 插入后拿自增 ID / get auto-increment ID | `leaves/actions.ts` |
| `leftJoin` | 关联查询 / joins | `leaves/actions.ts` |
| JSONB `.$type<T>()` | 存灵活结构 / flexible structures | `schema.ts` |

**关键理解 / Key point**: 数据库操作只能在**服务端**执行（Server Component / Server Action / API Route）。模块级 `const db` 在开发热重载下只初始化一次。/ DB ops only run on the server; the module-level `db` is initialized once even under HMR.

### Zod + react-hook-form（对照 `department-list.tsx`）

```tsx
const formSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;  // 自动推导类型 / inferred type

const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });
```

- `zod` 定义 schema（类似 Java 的 `@Valid` + Bean Validation）
- `zodResolver` 把 Zod 错误接到 react-hook-form
- `form.register("name")` 双向绑定 / two-way binding
- `form.formState.isSubmitting` 自动跟踪 Server Action pending 状态 / auto-tracks pending

### JSONB 的实用场景 / JSONB use cases（本项目亮点 / highlights）

| 表 / Table | JSONB 字段 | 用途 / Use |
|---|---|---|
| `roles` | `permissions` | 权限数组 / permission array |
| `performance_reviews` | `categories` | 维度评分 / dimension scores |
| `audit_logs` | `details` | 变更详情 / change details |

好处 / Benefit：新增权限/维度**不改表结构**，只改应用代码。/ Add permissions/dimensions without schema changes.

### 动手练习 / Hands-on (30 min)

1. 通读 `lib/db/schema.ts`（8 张表，注意外键 `onDelete` 策略：cascade / set null / restrict）。/ Read all 8 tables, note the `onDelete` strategies.
2. 通读 `lib/db/index.ts` 的 `ensureSchema()`。/ Read `ensureSchema()`.
3. 看 `salaries/actions.ts`，理解服务端计算 `actualPayment = base + bonus - deductions`。/ Understand server-side calculation.

---

## 第 7 小时 / Hour 7：实战 —— 状态机 / RBAC / 审计日志 / State Machine, RBAC & Audit

**目标 / Goal**: 把前 6 小时的知识串成完整的企业级功能。/ Combine everything into complete enterprise features.

### 7.1 工作流状态机 / Workflow state machine

企业审批本质是**有限状态机**，用字符串字段 + 条件渲染实现。/ Approvals are finite state machines implemented with string fields + conditional rendering.

| 模块 / Module | 状态流转 / Transitions | 触发动作 / Trigger |
|---|---|---|
| 请假 `leaves` | `pending → approved / rejected` | approve/reject |
| 考核 `performance` | `draft → self_review → completed` | self / manager review |
| 薪资 `salaries` | `draft → paid` | pay |

**实现模式 / Pattern**（对照 `leave-list.tsx`）:
1. 状态字段用 `varchar` 存（比 enum 灵活，无需 `ALTER TABLE`）/ string status
2. 状态流转封装在 Server Action 中 / transitions in Server Actions
3. 客户端条件渲染决定按钮可见性：`{req.status === "pending" && <button>Approve</button>}`
4. 状态徽章用颜色编码（`statusMap`）/ color-coded badges

### 7.2 RBAC 权限体系（对照 `lib/rbac.ts`）

```
角色(role) → 权限(permissions 数组) → 功能访问控制 / role → permissions → access
```

- `PERMISSIONS` 常量定义所有权限项（`"departments:read"` 等）/ all permission keys
- `DEFAULT_ROLES` 预置 admin / manager / user
- `hasPermission(userPermissions, required)` 判断 / check
- 权限存 JSONB，`roles/role-list.tsx` 用分组复选框编辑 / edited via grouped checkboxes

### 7.3 审计日志 / Audit logging（对照 `lib/audit.ts`）

关键设计原则：**审计日志不能影响主流程**。/ Audit logging must never break the main flow.

```tsx
export async function log(action, entity, entityId, details) {
  try {
    const session = await auth();   // 自动拿当前用户 / current user
    await db.insert(auditLogs).values({...});
  } catch (err) {
    logger.error("Failed to write audit log", {...});  // 静默失败 / fail silently
  }
}
```

每个业务 Action 里 `await log("create", "leave_request", id, {...})`，即可自动记录操作轨迹。/ Each business action calls `log(...)` to record its trail.

### 7.4 跨模块数据依赖 / Cross-module data（对照 `leaves/page.tsx`）

```tsx
const [leaveData, leaveTypesData, employeesData] = await Promise.all([
  getLeaveRequests(), getLeaveTypes(), getEmployees(),
]);
```

- Server Component 可跨模块 import 其它模块的 Server Action / cross-import actions
- `Promise.all` 并行请求（类比 Java 的 `CompletableFuture.allOf`）

### 动手练习 / Hands-on (45 min)

1. 走一遍请假全流程：创建 → 审批 → 查看审计日志。/ Run the leave workflow end-to-end.
2. 走一遍绩效考核：创建 → 自评 → 主管评分。/ Run the performance review flow.
3. 在 `roles` 页面给 `user` 加 `leaves:approve`，观察 JSONB 存储。/ Grant a permission and inspect JSONB storage.
4. 打开 `audit-logs`，对照每条日志的 `details`。/ Inspect audit log details.

---

## 第 8 小时 / Hour 8：构建、部署、测试与总结 / Build, Deploy, Test & Summary

**目标 / Goal**: 掌握项目生命周期命令 + 生产部署要点。/ Master lifecycle commands and deployment essentials.

### 常用命令 / Common commands

```bash
pnpm dev            # 开发服务器（Turbopack，热更新）/ dev server
pnpm build          # 生产构建 / production build
pnpm start          # 生产服务器 / production server
pnpm lint           # ESLint 检查 / lint
pnpm test           # Vitest 单测 / unit tests
pnpm db:push        # 同步 schema / push schema
pnpm db:generate    # 生成迁移文件 / generate migration
pnpm db:migrate     # 运行迁移 / run migration
pnpm db:seed        # 填充测试数据（幂等）/ seed (idempotent)
pnpm db:studio      # Drizzle Studio 可视化 / visual studio
```

### 生产部署要点 / Production deployment essentials

1. **环境变量 / env vars**：`DATABASE_URL` 等服务端变量不要加 `NEXT_PUBLIC_` 前缀（加了会暴露到客户端）。/ Never prefix server secrets with `NEXT_PUBLIC_`.
2. **迁移策略 / migrations**：学习/原型用 `ensureSchema()`，**生产必须用 `drizzle-kit generate` + `migrate`**。/ Use real migrations in production.
3. **连接池 / connection pool**：`postgres(url, { max: 10 })`，Serverless 环境务必限制。/ Limit pool size in serverless.
4. **认证密钥 / auth secret**：`AUTH_SECRET` 必须是强随机串，不能提交到 git。/ Strong random secret, never committed.
5. **构建产物 / artifacts**：`pnpm build` 后 `.next/` 是产物，可 `pnpm start` 或部署到 Vercel / Docker。/ Deploy `.next/` via Vercel or Docker.

### 测试 / Testing（Vitest + Testing Library）

`vitest.config.ts` 已配好 jsdom 环境 + `@` 别名。/ jsdom + `@` alias already configured. Use `@testing-library/react` to render Client Components and mock Server Actions.

### 总结 / Summary：Next.js 全栈能力清单 / checklist

学完这 8 小时，你应该掌握 / After 8 hours you should master:

- [x] App Router 文件路由（page / layout / route / 动态路由 / Route Group）
- [x] Server Component vs Client Component 的边界与分工 / boundaries & division of labor
- [x] 渲染策略（SSG/SSR/ISR）+ `revalidatePath` 缓存失效 / rendering + cache invalidation
- [x] Server Actions 替代手写 REST / Server Actions instead of REST
- [x] Auth.js v5 认证 + Middleware 路由保护 / auth + route protection
- [x] Drizzle ORM 集成 + Zod 表单校验 / ORM + validation
- [x] 状态机工作流 + RBAC + 审计日志 / workflows + RBAC + audit
- [x] 构建 / 部署 / 测试 / build, deploy, test

### 延伸学习方向 / Next steps

- `loading.tsx` / `error.tsx`（路由级加载态和错误边界）/ loading & error boundaries —— ✅ 已落地 `app/concepts/`
- Streaming / Suspense（渐进式渲染）/ progressive rendering —— ✅ 已落地 `app/concepts/loading`
- `generateMetadata`（动态 SEO）—— ✅ 已落地 `app/concepts/metadata/[id]`
- 缓存更细粒度控制（`revalidateTag`、`unstable_cache`）/ finer cache control
- React 19 的 `useOptimistic`（乐观更新）/ optimistic updates —— ✅ 已落地 `app/concepts/optimistic`
- Route Handlers / `next/image` / ISR / 404 —— ✅ 已落地 `app/concepts/`，见 🆕 补充案例章节

---

<a id="additional-cases"></a>
## 🆕 补充案例 / Additional Cases

> 以下 9 个知识点是 Next.js 全栈开发的高频必会项，但本项目**原有业务模块没有覆盖**，现全部落地在 `app/concepts/` 学习区，带密集中文注释 + 每个案例单独可运行。建议在第 8 小时前后逐一遍历。

### A1. `loading.tsx` + Suspense 流式渲染 / Streaming
**入口 / Entry**: `/concepts/loading`（`app/concepts/loading/`）

**核心点 / Key points**:
- **路由级 `loading.tsx`**：与 `page.tsx` 同级，async 页面加载时显示整页加载态。
- **组件级 `<Suspense>`**：把页面拆成小块，慢组件先显示 `fallback`，快内容立即渲染 —— 这是 App Router **流式渲染（Streaming）** 的核心。
- 对比传统 SSR：传统要等所有数据就绪才返回完整 HTML；Streaming 先返回骨架，再逐步推送慢组件内容。
- 注意 `/concepts/loading` 的 page 用了 `<Suspense>`，所以路由级 `loading.tsx`（同目录）不会触发；两者是互补的两个粒度。

**Java 类比**: `<Suspense>` 类似「服务端先返回页面骨架，异步分片数据像 SSE/和 commit 一样逐步下推」。

### A2. `error.tsx` 错误边界 / Error boundary
**入口 / Entry**: `/concepts/error`（`app/concepts/error/`），点「Throw error」触发

**核心点 / Key points**:
- `error.tsx` 必须是**客户端组件**（`"use client"`），接收 `{ error, reset }`。
- `reset()` 重新渲染该路由段；错误只影响**当前路由段**，layout 和整站不受影响（局部容错）。
- 生产环境不会把错误详情泄露给客户端。
- 搭配 `global-error.tsx`（根级别）可兜底根布局错误。

### A3. `not-found.tsx` + `notFound()` / 404
**入口 / Entry**: `/concepts/not-found`（点 id=3 触发） + 全局 `/app/not-found.tsx`

**核心点 / Key points**:
- `notFound()`：在 Server Component / Server Action 中主动返回 404（内部抛 `NEXT_NOT_FOUND`）。
- `not-found.tsx`：**就近原则** —— `[id]/not-found.tsx` 只对该段生效；`app/not-found.tsx` 是全局兜底。
- 与 `error.tsx` 区别：404 = 资源不存在；error = 执行出错。

### A4. `generateMetadata` 动态 SEO / Dynamic SEO
**入口 / Entry**: `/concepts/metadata/42`（改 id 观察标题变化）

**核心点 / Key points**:
- 静态 `export const metadata = {...}`（见 `app/layout.tsx`）。
- 动态 `export async function generateMetadata({ params, searchParams })`：在服务端运行，可查库后返回动态 `title` / `description` / `openGraph`。
- 每个资源页有独立 SEO 信息，利于搜索引擎和社交分享卡片。

### A5. ISR（`revalidate`）增量静态再生成 / Incremental Static Regeneration
**入口 / Entry**: `/concepts/isr`（**需 `pnpm build && pnpm start` 才能观测到缓存效果**）

**核心点 / Key points**:
- `export const revalidate = 10`：首次请求按需生成静态页并缓存；10 秒内命中缓存；超时后下次请求后台重新生成。
- 对比本项目的 `force-dynamic`（每次请求实时渲染）—— ISR 是「静态缓存 + 定时更新」，性能更好。
- 适合：内容更新不频繁但需一定新鲜度的页面（商品详情、文章页）。

### A6. `useSearchParams` URL 筛选 / URL filters
**入口 / Entry**: `/concepts/search`

**核心点 / Key points**:
- 服务端读：Server Component 的 `searchParams`（Next 15+ 是 Promise，需 await）。
- 客户端读：`useSearchParams()` hook（使用它的组件静态渲染时需包 `<Suspense>`）。
- 用 URL 查询参数 `?status=xxx` 筛选的好处：状态**可分享、可回退、可索引**，对比 useState 无法分享。

### A7. `useOptimistic` 乐观更新 / Optimistic UI（React 19）
**入口 / Entry**: `/concepts/optimistic`

**核心点 / Key points**:
- `useOptimistic(state, reducer)`：提交后**立即**更新 UI（带 pending 标记），Server Action 返回真实结果后替换，失败则回滚。
- 与 Server Action 搭配是 React 19 官方推荐模式（对应 `useActionState` 同族）。
- 对比传统 `await action → setState`：用户感知零延迟。

### A8. Route Handlers 完整 CRUD / API routes
**入口 / Entry**: `/concepts/route-handlers`（客户端 fetch 调用） + 直接访问 `/concepts/api`

**核心点 / Key points**:
- `route.ts` 导出 `GET` / `POST` / `PUT` / `DELETE`（类比 Spring `@RestController`）。
- 动态参数 `[id]/route.ts`：`context.params.id`（Next 15+ 是 Promise）。
- `request.nextUrl.searchParams` 读查询参数；`headers()` / `cookies()`（`next/headers`）读请求头和 Cookie（返回 Promise）。
- 场景：对接外部 Webhook、暴露公开 API、移动端复用；**页面内部数据操作优先用 Server Actions**（更简洁）。

### A9. `next/image` 图片优化 / Image optimization
**入口 / Entry**: `/concepts/image`（已配置 `next.config.ts` 的 `remotePatterns`）

**核心点 / Key points**:
- 替代原生 `<img>`：自动格式转换（WebP/AVIF）、按视口生成尺寸、懒加载、防布局偏移（CLS=0）。
- 远程图片必须先配置 `images.remotePatterns` 指定允许域名（安全机制，防 SSRF）。
- 本地图片用静态 import 自动推断宽高。

---

## 附录 / Appendix：关键 API 速查表 / API Cheat Sheet

### 路由 & 导航 / Routing & Navigation

| API | 来源 / Source | 环境 / Env | 用途 / Use |
|---|---|---|---|
| `usePathname()` | `next/navigation` | Client | 当前路径 / current path |
| `useRouter()` | `next/navigation` | Client | `push` / `refresh` |
| `useSearchParams()` | `next/navigation` | Client | 读 URL 查询参数 / read query params |
| `redirect(url)` | `next/navigation` | Server | 服务端重定向 / server redirect |
| `notFound()` | `next/navigation` | Server | 返回 404 / trigger 404 |
| `<Link>` | `next/link` | Client | SPA 跳转 / SPA navigation |

### 数据 & 缓存 / Data & Cache

| API | 来源 / Source | 环境 / Env |
|---|---|---|
| `export const dynamic = "force-dynamic"` | — | Server |
| `export const revalidate = N` | — | Server |
| `revalidatePath(path)` | `next/cache` | Server |
| `cookies()` / `headers()` | `next/headers` | Server |

### 特殊文件 & SEO / Special Files & SEO

| 文件 / File | 作用 / Purpose |
|---|---|
| `loading.tsx` | 路由级加载态 / route-level loading UI |
| `error.tsx` | 路由段错误边界（客户端组件，接收 error/reset） |
| `not-found.tsx` | 404 页面（根目录=全局，段内=局部） |
| `generateMetadata({ params })` | 动态 SEO（服务端生成 title/meta/OG） |
| `next/image` | 图片优化（格式转换、懒加载、CLS=0，需配 remotePatterns） |

### React 19 Hooks

| Hook | 用途 / Use |
|---|---|
| `useOptimistic(state, reducer)` | 乐观更新：提交立即更新，失败回滚 / optimistic UI |

### 认证 / Auth

| API | 来源 / Source | 环境 / Env |
|---|---|---|
| `auth()` | `@/lib/auth` | Server |
| `useSession()` | `next-auth/react` | Client |
| `signIn()` / `signOut()` | `next-auth/react` | Client |

### 渲染指令 / Directives

| 指令 / Directive | 作用 / Purpose |
|---|---|
| `"use client"` | 标记 Client Component / mark client component |
| `"use server"` | 标记 Server Action / mark server action |

---

> 完整中文知识笔记见 `STUDY_NOTE.md`，面试题见 `INTERVIEW_QA.md`。/ See `STUDY_NOTE.md` for detailed notes and `INTERVIEW_QA.md` for interview Q&A.
