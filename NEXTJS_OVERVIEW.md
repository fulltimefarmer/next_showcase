# Next.js 技术栈概述（面向 Java 工程师）

> 用你最熟悉的 Java 后端概念来理解 Next.js 全栈开发。看完这篇，你就能快速建立整体认知。

---

## 1. Next.js 是什么？

一句话：**Next.js 是「基于 React 的全栈框架」，相当于 Java 世界的 Spring Boot。**

| Java 视角 | Next.js |
|---|---|
| Spring Boot（全家桶框架） | Next.js（路由/渲染/API 一站式） |
| Thymeleaf / JSP（服务端模板） | React（组件化 UI 库） |
| `@RestController` + `@Service` | Route Handlers + Server Actions |
| Maven / Gradle | pnpm |
| Spring Security | Auth.js |
| MyBatis / JPA | Drizzle ORM |
| Bean Validation | Zod |

传统 Java Web 开发是「后端出接口，前端用 JS 单独写」。Next.js 的核心理念是：**前后端在一个项目里、用一种语言（TypeScript）搞定**，服务端和客户端代码无缝衔接。

---

## 2. 主要用途（能解决什么问题）

1. **全栈 Web 应用**：一个项目同时写页面（前端）和接口/数据库逻辑（后端）。
2. **服务端渲染（SSR）/ SEO 友好**：服务端直接产出 HTML，搜索引擎能抓取，首屏快。
3. **后台管理系统 / 企业级应用**：权限、表格、表单、审批流这类「内部系统」的绝佳选择。
4. **API 服务**：也能只写纯接口（Route Handlers），当 Node 后端用。
5. **高性能静态站**：构建时预渲染成静态 HTML（SSG），部署到 CDN。

> 本项目 `next_showcase` 就是一个典型的「企业级内部管理系统（CMS）」，包含部门、员工、请假审批、薪资、绩效、权限等模块。

---

## 3. 核心概念（用 Java 类比）

### 3.1 渲染模式（对应 Java 的「返回页面 vs 返回 JSON」）

| 模式 | 说明 | Java 类比 |
|---|---|---|
| SSR 动态渲染 | 每次请求服务端实时渲染 HTML | 传统 JSP/Thymeleaf 服务端渲染 |
| SSG 静态生成 | 构建时预渲染成静态文件 | 静态资源直接部署 |
| ISR 增量再生成 | 静态 + 定时后台更新 | 静态页 + 定时任务刷新 |
| CSR 客户端渲染 | 纯前端 JS 渲染 | 前后端分离的 SPA |

### 3.2 Server Component vs Client Component（最重要的一对概念）

这是 Next.js 特有的设计，可以类比成：

- **Server Component（默认）**：跑在服务端的组件，能直接查数据库。→ 类比 **Service/Controller 层**，代码不下发到浏览器。
- **Client Component（`"use client"`）**：跑在浏览器的组件，负责交互（点击、表单、hooks）。→ 类比 **前端 JS 页面**。

**口诀**：需要数据放 Server，需要交互放 Client。

### 3.3 Server Actions（替代传统 Controller 接口）

用 `"use server"` 声明的函数，前端可以直接「像调用本地函数一样」调用它，Next.js 自动生成 HTTP 请求。

```ts
// 类似 @RestController 的方法，但前端直接 import 调用
"use server";
export async function createDepartment(data: { name: string }) {
  await db.insert(departments).values(data);
  revalidatePath("/departments"); // 类似清除缓存，让页面刷新
}
```

> 类比：不用再手写 `@PostMapping("/api/department")` + 前端 `fetch`，而是「一个函数前后端共用」。

---

## 4. Route Handlers 与 Server Actions 详解（URL 映射）

这是 Next.js 写「后端逻辑」的两种方式，也是 Java 工程师最需要理解的部分：

- **Route Handler**：显式的 API 接口，类似 `@RestController`。
- **Server Action**：隐藏的「函数接口」，前端直接 import 调用，类似框架自动生成的接口。

### 4.1 Route Handler 是什么

`route.ts` 是一个**纯后端接口文件**（不渲染页面），导出 HTTP 方法函数。类比 `@RestController` + `@RequestMapping`。

**URL 映射规则 = 文件路径即 URL**。Next.js 根据 `route.ts` 所在的**目录路径**决定接口地址，无需任何注解。

| 文件路径 | 映射到的 URL | Java 类比 |
|---|---|---|
| `app/concepts/api/route.ts` | `GET/POST/DELETE /concepts/api` | `@RequestMapping("/concepts/api")` |
| `app/concepts/api/[id]/route.ts` | `/concepts/api/:id` | `@GetMapping("/concepts/api/{id}")` |
| `app/api/auth/[...nextauth]/route.ts` | `/api/auth/**`（任意子路径） | `@RequestMapping("/api/auth/**")` |

#### 例 1：固定路径（对应 `@RequestParam` + `@RequestBody`）

`app/concepts/api/route.ts` —— 文件名是 `route.ts`，目录 `concepts/api` 即 URL：

```ts
// 映射到 GET /concepts/api?keyword=xxx
export async function GET(request: NextRequest) {
  // 读查询参数，类比 @RequestParam("keyword")
  const keyword = request.nextUrl.searchParams.get("keyword") ?? "";
  return Response.json({ items: listItems(keyword) });
}

// 映射到 POST /concepts/api
export async function POST(request: NextRequest) {
  // 读 JSON body，类比 @RequestBody
  const body = await request.json();
  return Response.json(addItem(body.name), { status: 201 });
}
```

#### 例 2：动态路径 `[id]`（对应 `@PathVariable`）

`app/concepts/api/[id]/route.ts` —— 方括号 `[id]` 就是动态路径参数：

```ts
// 映射到 PUT /concepts/api/123
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;   // 类比 @PathVariable("id")，Next 15+ 需 await
  const body = await request.json();
  return Response.json(updateItem(Number(id), body.name));
}
```

#### 例 3：Catch-all `[...nextauth]`（对应通配路径）

`app/api/auth/[...nextauth]/route.ts` —— 三个点 `[...nextauth]` 匹配**任意层级子路径**：

```ts
import { handlers } from "@/lib/auth";

// 匹配 /api/auth/signin、/api/auth/callback/credentials、/api/auth/session 等所有子路径
export const { GET, POST } = handlers;
```

#### 读取其他请求信息（对照表）

| 需求 | Next.js 写法 | Java 类比 |
|---|---|---|
| 查询参数 | `request.nextUrl.searchParams.get("x")` | `@RequestParam` |
| JSON 请求体 | `await request.json()` | `@RequestBody` |
| 请求头 | `(await headers()).get("user-agent")` | `@RequestHeader` |
| Cookie | `(await cookies()).get("visitor")` | `@CookieValue` |

> 注意：`headers()` / `cookies()` 来自 `next/headers`，Next 15+ 返回 Promise，需 `await`。

---

### 4.2 Server Action 是什么

用 `"use server"` 声明的函数，跑在服务端，但前端可以**像调用本地函数一样直接 import 调用**。Next.js 会自动生成 HTTP 请求，你完全不用手写接口。

```ts
// app/(dashboard)/departments/actions.ts
"use server";

export async function createDepartment(data: { name: string }) {
  await db.insert(departments).values(data);
  revalidatePath("/departments");  // 清除缓存，让页面显示新数据
}
```

前端（Client Component）直接调用：

```tsx
// app/(dashboard)/departments/department-list.tsx
"use client";
import { createDepartment } from "./actions";

await createDepartment(values);  // 看似本地函数，实际是 POST 到服务端执行
```

### 4.3 Server Action 的 URL 映射（关键！）

Server Action **没有你可见的 URL**。它的映射机制是：

1. 编译时，Next.js 给每个 Server Action 分配一个**加密的 action ID**。
2. 前端调用时，Next.js 把函数调用替换成一个 `POST` 请求，**发到当前页面的 URL**，请求体里带上这个加密 ID。
3. 服务端收到后，根据 ID 找到对应函数执行。

| 对比 | Route Handler | Server Action |
|---|---|---|
| URL | 显式，由文件路径决定 | 隐式，加密 action ID |
| 客户端调用 | 手动 `fetch("/xxx")` | `import` 后像本地函数调用 |
| 类型安全 | 需自己定义接口契约 | 参数/返回值前后端自动类型安全 |
| 适用场景 | 对外 API、Webhook、移动端复用 | 页面内部的数据操作（表单、CRUD） |
| Java 类比 | `@RestController`（公开接口） | Controller 里的方法，框架自动暴露 |

### 4.4 什么时候用哪个？

**优先用 Server Action**（大多数页面内操作）：
- 表单提交、增删改查、页面内部交互。
- 好处：类型安全、代码少、自动缓存失效。

**用 Route Handler**（需要独立 URL 的场景）：
- 对外公开 API、第三方 Webhook 回调、移动端复用后端逻辑。
- 需要 GET 缓存、或非页面交互的接口。

> 本项目同时用到了两者：业务模块的 CRUD 用 Server Action（`app/(dashboard)/*/actions.ts`），认证接口用 Route Handler（`app/api/auth/[...nextauth]/route.ts`），演示接口见 `app/concepts/api/`。

---

## 5. 技术栈组件清单（每个解决什么问题）

以本项目 `package.json` 为例，按职责分类：

### 5.1 框架层

| 类库 | 解决什么问题 | Java 类比 |
|---|---|---|
| **Next.js 16** | 路由、渲染、API、SSR 的全栈框架 | Spring Boot |
| **React 19** | 声明式 UI 组件库（Next.js 的基础） | Thymeleaf 模板引擎（但更强） |

### 5.2 语言

| 类库 | 解决什么问题 | Java 类比 |
|---|---|---|
| **TypeScript** | 给 JS 加静态类型，编译期查错 | Java 的类型系统 |

### 5.3 数据层

| 类库 | 解决什么问题 | Java 类比 |
|---|---|---|
| **PostgreSQL** | 关系型数据库 | MySQL/Oracle |
| **Drizzle ORM** | 类型安全的 SQL 构建器，定义表结构和查询 | MyBatis / JPA / Hibernate |
| **postgres-js** | PostgreSQL 的底层驱动（连接池） | JDBC Driver |

### 5.4 认证授权

| 类库 | 解决什么问题 | Java 类比 |
|---|---|---|
| **Auth.js (next-auth v5)** | 登录认证、Session、JWT | Spring Security |

### 5.5 表单与校验

| 类库 | 解决什么问题 | Java 类比 |
|---|---|---|
| **Zod** | 数据校验 + 自动推导类型 | Bean Validation / Hibernate Validator |
| **react-hook-form** | 表单状态管理、提交、错误处理 | Spring 的 `@ModelAttribute` + 表单绑定 |
| **@hookform/resolvers** | 把 Zod 接入 react-hook-form | 校验器适配器 |

### 5.6 样式与 UI

| 类库 | 解决什么问题 | Java 类比 |
|---|---|---|
| **Tailwind CSS v4** | 原子化 CSS，写 className 即样式 | Bootstrap（但更灵活） |
| **Lucide React** | 图标库 | Font Awesome |
| **Sonner** | Toast 通知提示 | 前端弹窗组件 |

### 5.7 测试

| 类库 | 解决什么问题 | Java 类比 |
|---|---|---|
| **Vitest** | 单元测试框架 | JUnit |
| **Testing Library** | 组件测试（模拟用户交互） | MockMvc / Selenium |

### 5.8 工具链

| 类库 | 解决什么问题 | Java 类比 |
|---|---|---|
| **pnpm** | 包管理器（快、省磁盘） | Maven / Gradle |
| **Turbopack** | 打包器（Rust 写的，比 Webpack 快） | javac / 打包插件 |
| **ESLint 9** | 代码规范检查 | Checkstyle / SpotBugs |
| **Drizzle Kit** | 数据库迁移工具（建表/改表） | Flyway / Liquibase |

---

## 6. 目录结构速览（对应本项目）

```
app/                       # 页面和路由（类似 Spring 的 Controller 层）
├── (dashboard)/           # 受保护的后台页面（路由组，括号不参与 URL）
│   ├── departments/       # 部门模块
│   │   ├── page.tsx       # 页面（Server Component，查数据）
│   │   ├── actions.ts     # Server Actions（写数据库）
│   │   └── department-list.tsx  # 客户端组件（交互）
│   └── ...
├── api/auth/[...nextauth]/route.ts  # 认证接口（类似 @RequestMapping）
├── layout.tsx             # 根布局（类似 Tiles 模板）
└── globals.css            # 全局样式

lib/                       # 后端逻辑（类似 Service / Repository 层）
├── auth.ts                # 认证配置
├── rbac.ts                # 权限判断
├── audit.ts               # 审计日志
└── db/
    ├── index.ts           # 数据库连接（类似 DataSource）
    └── schema.ts          # 表结构定义（类似 Entity）

proxy.ts                   # 中间件（类似 Filter / Interceptor）
```

每个业务模块遵循统一模式：**Page（查数据）→ Actions（写数据）→ Client List（交互）**。

---

## 7. 一个完整流程的 Java ↔ Next.js 对照

**需求**：新增一个部门。

| 步骤 | Java 写法 | Next.js 写法 |
|---|---|---|
| 定义表结构 | `@Entity` + JPA 注解 | `schema.ts` 里 `pgTable(...)` |
| 写接口 | `@PostMapping` + Service | `actions.ts` 里 `"use server"` 函数 |
| 校验参数 | `@Valid` + `@NotBlank` | Zod schema |
| 提交表单 | 前端 `fetch` 调接口 | 前端直接 `await createDepartment(...)` |
| 刷新列表 | 前端重新请求 | `revalidatePath("/departments")` |
| 权限控制 | `@PreAuthorize` | Server Action 里 `auth()` + `hasPermission()` |

---

## 8. 学习路线建议（从 Java 迁移）

1. **先学 TypeScript 基础**：类型、接口、泛型（你有 Java 底子，很快）。
2. **理解 React 组件与 hooks**：`useState`、`useEffect`。
3. **掌握核心概念**：Server/Client Component、Server Actions、渲染模式。
4. **上手数据层**：Drizzle ORM 定义表、查询、事务。
5. **接入认证**：Auth.js 登录 + JWT + 权限。
6. **进阶**：缓存机制、流式渲染、性能优化。

> 更多细节可参考本仓库的 `LEARNING_8H.md`（8 小时速成）和 `STUDY_NOTE.md`（知识点笔记）、`INTERVIEW_QA.md`（面试题）。
