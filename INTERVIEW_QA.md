# Next.js 全栈开发 · 面试题与解答 / Next.js Full-Stack Interview Questions & Answers

> **中文**：覆盖**基础篇 / 中级篇 / 高级篇**三个层级，每篇 30 道高频问答。答案力求详细，每题附「**项目案例 / Repo example**」——直接指向本仓库真实代码，若原业务模块未覆盖则在 `app/interview/` 新增了对应演示代码。
>
> **English**: Covers **Basic / Intermediate / Advanced** levels, 30 Q&A each. Each question links a **real code example** from this repo; where the business modules lacked coverage, a demo was added under `app/interview/`.

**技术栈 / Tech Stack**: Next.js 16 (App Router + Turbopack) · TypeScript 5 · PostgreSQL 18 · Drizzle ORM 0.45 · Auth.js (next-auth v5 beta) · Zod 4 + react-hook-form 7 · Tailwind CSS v4 · Vitest + Testing Library

---

## 目录 / Table of Contents

- [基础篇 / Basic](#基础篇--basic)（30 题）
- [中级篇 / Intermediate](#中级篇--intermediate)（30 题）
- [高级篇 / Advanced](#高级篇--advanced)（30 题）

---

## 基础篇 / Basic

### 1. 什么是 Next.js？和纯 React 有什么区别？/ What is Next.js and how does it differ from React?

**参考答案 / Answer**:
Next.js 是基于 React 的**全栈框架**，在 React 之上提供了路由、渲染策略、数据获取、API 端点、服务端渲染、SEO 等开箱即用的能力。纯 React 只是一个**视图库**。/ Next.js is a **full-stack framework** on top of React providing routing, rendering, data fetching, API endpoints, SSR, and SEO out of the box.

| 维度 | React | Next.js |
|---|---|---|
| 路由 | 需自配 React Router | 文件即路由（`app/`）|
| 渲染 | 默认 CSR | SSR / SSG / ISR / RSC |
| 数据获取 | API + fetch | Server Component 直查库 |
| 后端 | 无 | Server Actions、Route Handlers、Middleware |

**加分点 / Bonus**: 服务端渲染产出完整 HTML，利于 SEO 与首屏。

**📁 项目案例 / Repo example**：`app/(dashboard)/page.tsx` —— Server Component 直接 `await db.select(...)` 查库并渲染，无需额外 API 层。

```tsx
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const [deptCount] = await db.select({ value: count() }).from(departments);
  return <div>{deptCount.value}</div>;
}
```

---

### 2. App Router 和 Pages Router 的区别 / App Router vs Pages Router

**参考答案 / Answer**:

| 维度 | Pages Router (`pages/`) | App Router (`app/`) |
|---|---|---|
| 目录 | `pages/index.tsx`、`pages/api/` | `app/page.tsx`、`app/route.ts` |
| 数据获取 | `getServerSideProps`/`getStaticProps` | async Server Component 直接 `await` |
| 布局 | `_app.tsx` 全局单一 | 可嵌套 layout，切换不重渲染 |
| Server Component | 无 | 原生支持 |
| API | `pages/api/*` | `route.ts` 导出 HTTP 方法 |

**加分点 / Bonus**: App Router 是推荐方案。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/page.tsx` —— async Server Component 直接 `await getDepartments()`，等价于 `getServerSideProps`。

```tsx
export default async function DepartmentsPage() {
  const data = await getDepartments();
  return <DepartmentList initialData={data} />;
}
```

---

### 3. Server Component 和 Client Component 的区别 / Server vs Client Component

**参考答案 / Answer**:

| | Server Component | Client Component |
|---|---|---|
| 标记 | 默认 | `"use client"` |
| 运行环境 | 服务端 | 浏览器 |
| 数据库访问 | ✅ | ❌ |
| Hooks | ❌ | ✅ |
| JS 体积 | 不下发 | 下发 |

**加分点 / Bonus**: Server 可 import Client，反之不行。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/department-list.tsx` 顶部 `"use client"`（客户端交互），而 `page.tsx` 是无标记的 Server Component（数据获取）。

```tsx
"use client";
export function DepartmentList({ initialData }: { initialData: Department[] }) {
  const [data, setData] = useState(initialData);
  // ... 交互逻辑
}
```

---

### 4. 什么是 Server Actions？/ What are Server Actions?

**参考答案 / Answer**:
用 `"use server"` 声明的、只在**服务端执行**的函数，客户端可像本地函数一样调用，Next.js 自动生成 POST 端点。

**加分点 / Bonus**: 类型安全、配合 `revalidatePath`、配合 `isSubmitting`。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/actions.ts` —— 标准 Server Action。

```ts
"use server";
export async function createDepartment(data: { name: string }) {
  await db.insert(departments).values(data);
  revalidatePath("/departments");
}
```

---

### 5. SSG / SSR / ISR 分别是什么？/ What are SSG, SSR, ISR?

**参考答案 / Answer**:
- **SSG**：构建时预渲染。/ build time.
- **SSR**：每次请求实时渲染，`force-dynamic`。/ per request.
- **ISR**：`revalidate = 60` 定时后台再生成。/ timer-based.

**加分点 / Bonus**: 本仓库后台页面全部 `force-dynamic`。

**📁 项目案例 / Repo example**：`app/(dashboard)/page.tsx`（SSR）与 `app/concepts/isr/page.tsx`（ISR）。

```tsx
// SSR
export const dynamic = "force-dynamic";
// ISR
export const revalidate = 10;
```

---

### 6. `revalidatePath` 和 `revalidateTag` 的作用 / revalidatePath vs revalidateTag

**参考答案 / Answer**:
- `revalidatePath("/departments")`：按**路径**失效。
- `revalidateTag("tag")`：按**标签**失效（配合 `unstable_cache`/`fetch` tags）。

**加分点 / Bonus**: 写操作后必须失效缓存，否则返回旧数据。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/actions.ts`（revalidatePath）与新增 `app/interview/revalidate-tag/actions.ts`（revalidateTag）。

```ts
// revalidatePath
revalidatePath("/departments");
// revalidateTag（Next 16 需传 cache-life profile）
revalidateTag("interview-counter", "default");
```

---

### 7. `page.tsx`、`layout.tsx`、`route.ts` 的区别 / page / layout / route

**参考答案 / Answer**:
- `page.tsx`：渲染页面。`layout.tsx`：布局，切换不重渲染。`route.ts`：API 端点。

**加分点 / Bonus**: 同一目录下 `page.tsx` 与 `route.ts` 不能共存。

**📁 项目案例 / Repo example**：`app/layout.tsx`（根布局）、`app/(dashboard)/layout.tsx`（嵌套布局）、`app/concepts/api/route.ts`（API）。

```ts
export async function GET(request: NextRequest) {
  return Response.json({ items: listItems() });
}
```

---

### 8. 动态路由和 Catch-all 路由 / Dynamic and catch-all routes

**参考答案 / Answer**:
- `[id]`：动态段，`params.id`。
- `[...slug]`：catch-all，匹配任意层级。

**加分点 / Bonus**: `app/api/auth/[...nextauth]/route.ts` 是真实 catch-all 示例。

**📁 项目案例 / Repo example**：`app/concepts/not-found/[id]/page.tsx` 与 `app/api/auth/[...nextauth]/route.ts`。

```tsx
export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

---

### 9. `useRouter` 和 `redirect` 的区别 / useRouter vs redirect

**参考答案 / Answer**:
- `useRouter()`：客户端导航（`push`/`replace`/`refresh`）。
- `redirect()`：服务端重定向（内部抛 `NEXT_REDIRECT`）。

**加分点 / Bonus**: 登录成功用 `push` + `refresh`。

**📁 项目案例 / Repo example**：`app/login/page.tsx`（useRouter）与 `app/(dashboard)/roles/page.tsx`（redirect）。

```tsx
// 客户端
router.push("/"); router.refresh();
// 服务端
if (session?.user.role !== "admin") redirect("/");
```

---

### 10. 如何获取环境变量？`NEXT_PUBLIC_` 前缀的作用 / Environment variables

**参考答案 / Answer**:
- 服务端：`process.env.DATABASE_URL`。
- 客户端：必须 `NEXT_PUBLIC_` 前缀，构建时内联。

**加分点 / Bonus**: secrets 不加前缀，永不暴露给客户端。

**📁 项目案例 / Repo example**：`lib/db/index.ts` 读 `process.env.DATABASE_URL`；`.env.example` 是模板。

```ts
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 10 });
```

---

### 11. 什么是文件即路由（File-based Routing）？/ What is file-based routing?

**参考答案 / Answer**:
路由由 `app/` 目录结构决定：文件夹 = 路由段，`page.tsx` = 页面，`(group)` 不参与 URL，`[param]` 动态段。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/page.tsx` → URL `/departments`（`(dashboard)` 组不产生前缀）。

---

### 12. `<Link>` 和 `<a>` 的区别 / Link vs anchor

**参考答案 / Answer**:
`<Link>` 客户端导航不整页刷新 + 预加载；`<a>` 整页刷新。

**📁 项目案例 / Repo example**：`app/components/sidebar.tsx` 用 `<Link>` 做导航。

```tsx
<Link href={item.href} className="...">
  <item.icon className="size-4" />
  {!collapsed && <span>{item.label}</span>}
</Link>
```

---

### 13. 什么是 Route Group（路由组）？/ What is a route group?

**参考答案 / Answer**:
括号文件夹 `(dashboard)` 用于分组 + 共享 layout，不参与 URL。

**📁 项目案例 / Repo example**：`app/(dashboard)/` 下的页面共享一个带侧边栏的 `layout.tsx`，但 URL 仍是 `/departments` 等。

---

### 14. `"use client"` 和 `"use server"` 指令分别是什么？/ use client vs use server

**参考答案 / Answer**:
`"use client"` 标记客户端组件；`"use server"` 标记导出函数为 Server Actions。

**📁 项目案例 / Repo example**：`app/providers.tsx`（"use client" 边界）与 `lib/audit.ts`（"use server"）。

```tsx
"use client";
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}<Toaster /></SessionProvider>;
}
```

---

### 15. 什么是 async Server Component？/ What is an async Server Component?

**参考答案 / Answer**:
`page.tsx` 可定义为 `async function`，渲染前直接 `await` 数据。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/page.tsx`。

```tsx
export default async function DepartmentsPage() {
  const data = await getDepartments();
  return <DepartmentList initialData={data} />;
}
```

---

### 16. 如何在 Server Component 中获取数据？/ How to fetch data in Server Components?

**参考答案 / Answer**:
直接 `await` 数据库查询或 `fetch`，无需额外 API 层。

**📁 项目案例 / Repo example**：`app/(dashboard)/page.tsx` 用 Drizzle `count()` 聚合。

```tsx
const [deptCount] = await db.select({ value: count() }).from(departments);
```

---

### 17. `next/image` 组件的作用和好处 / Benefits of next/image

**参考答案 / Answer**:
自动多尺寸/格式优化、懒加载、防 CLS、`remotePatterns` 白名单防 SSRF。

**📁 项目案例 / Repo example**：`app/concepts/image/page.tsx` + `next.config.ts`。

```tsx
<Image src="https://images.unsplash.com/..." alt="..." width={600} height={400} />
```

```ts
images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] }
```

---

### 18. `next/link` 的预加载机制 / Link prefetching

**参考答案 / Answer**:
`<Link>` 对视口内链接 prefetch，导航近乎即时；可 `prefetch={false}` 关闭。

**📁 项目案例 / Repo example**：`app/components/sidebar.tsx` 的导航链接依赖该预加载机制。

---

### 19. Metadata API 是什么？/ What is the Metadata API?

**参考答案 / Answer**:
导出 `metadata`（静态）或 `generateMetadata`（动态）自动注入 `<head>`。

**📁 项目案例 / Repo example**：`app/layout.tsx`（静态）与 `app/concepts/metadata/[id]/page.tsx`（动态）。

```tsx
export const metadata: Metadata = { title: "Company Management System" };

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Resource ${id}` };
}
```

---

### 20. 什么是 Turbopack？/ What is Turbopack?

**参考答案 / Answer**:
Next.js 用 Rust 写的下一代打包器，更快启动与 HMR。

**📁 项目案例 / Repo example**：`package.json` 的 `dev` 脚本默认启用 Turbopack。

```json
"dev": "next dev"
```

---

### 21. 如何定义 API 路由（Route Handlers）？/ How to define API routes?

**参考答案 / Answer**:
`route.ts` 导出 `GET`/`POST` 等 HTTP 方法。

**📁 项目案例 / Repo example**：`app/concepts/api/route.ts`。

```ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  return Response.json(addItem(body.name), { status: 201 });
}
```

---

### 22. 什么是 not-found.tsx？/ What is not-found.tsx?

**参考答案 / Answer**:
自定义 404 页面，配合 `notFound()` 返回真正 404 状态码。

**📁 项目案例 / Repo example**：`app/concepts/not-found/[id]/not-found.tsx` + `page.tsx`。

```tsx
if (!resource) notFound();
```

---

### 23. 什么是 loading.tsx？/ What is loading.tsx?

**参考答案 / Answer**:
与 `page.tsx` 同级，页面加载时显示的路由级加载态。

**📁 项目案例 / Repo example**：`app/concepts/loading/loading.tsx`。

```tsx
export default function Loading() {
  return <div className="animate-spin ..." />;
}
```

---

### 24. 什么是 error.tsx 错误边界？/ What is error.tsx?

**参考答案 / Answer**:
客户端组件，接收 `{ error, reset }`，捕获当前路由段错误。

**📁 项目案例 / Repo example**：`app/concepts/error/error.tsx`。

```tsx
"use client";
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return <button onClick={reset}>Try again</button>;
}
```

---

### 25. 什么是 Suspense？/ What is Suspense?

**参考答案 / Answer**:
`fallback` 占位包裹慢内容，实现流式渲染。

**📁 项目案例 / Repo example**：`app/concepts/loading/page.tsx`。

```tsx
<Suspense fallback={<Skeleton label="用户列表" />}>
  <SlowContent label="用户列表" />
</Suspense>
```

---

### 26. 客户端组件如何调用 Server Action？/ How do client components call Server Actions?

**参考答案 / Answer**:
直接 `import` 并像本地函数一样调用，Next.js 透明处理 POST。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/department-list.tsx`。

```tsx
import { createDepartment } from "./actions";
await createDepartment(values); // 实际发送 POST 到服务端
```

---

### 27. `useRouter().refresh()` 的作用 / What does router.refresh() do?

**参考答案 / Answer**:
客户端触发重新获取当前路由的服务端组件数据，不清空客户端状态。

**📁 项目案例 / Repo example**：`app/login/page.tsx`。

```tsx
router.push("/");
router.refresh(); // 强制重新获取服务端组件 data
```

---

### 28. 如何做客户端导航？/ How to do client-side navigation?

**参考答案 / Answer**:
`<Link>` 声明式、`useRouter().push/replace` 命令式、`redirect()` 服务端。

**📁 项目案例 / Repo example**：`app/components/sidebar.tsx`（Link）与 `app/login/page.tsx`（push/replace）。

---

### 29. Tailwind CSS v4 在 Next.js 中如何集成？/ How is Tailwind v4 integrated?

**参考答案 / Answer**:
`@tailwindcss/postcss` 插件 + `globals.css` 里 `@import "tailwindcss"`。

**📁 项目案例 / Repo example**：`app/layout.tsx` 用 `next/font` 生成 CSS 变量配合 Tailwind。

```tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
<html className={`${geistSans.variable} ...`}>
```

---

### 30. 什么是 `params` 和 `searchParams`？/ What are params and searchParams?

**参考答案 / Answer**:
`params` 是动态路由参数，`searchParams` 是查询串；Next 15+ 都是 Promise，需 `await`。

**📁 项目案例 / Repo example**：`app/concepts/search/page.tsx`（searchParams）与 `app/concepts/not-found/[id]/page.tsx`（params）。

```tsx
export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
}
```

---

## 中级篇 / Intermediate

### 1. Server Actions 如何实现权限校验？/ Authorization in Server Actions

**参考答案 / Answer**:
Server Action 里先 `await auth()` 获取用户，判断权限，不通过则抛错。这是操作级（最细粒度）校验。

**加分点 / Bonus**: 绝不能只靠前端隐藏按钮。

**📁 项目案例 / Repo example**：`lib/rbac.ts` 的 `hasPermission()` + `app/(dashboard)/roles/page.tsx` 的页面级校验。

```ts
export function hasPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.includes(required);
}
```

```tsx
if (session?.user.role !== "admin") redirect("/");
```

---

### 2. Middleware 的用途和限制 / Middleware use cases and limits

**参考答案 / Answer**:
路由级拦截（登录检查）；限制：Edge Runtime（无 Node API）、精简 session（无 role）、需 `matcher`。

**📁 项目案例 / Repo example**：`proxy.ts` + `lib/auth.config.ts`。

```ts
export default NextAuth(authConfig).auth;
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|svgs).*)"],
};
```

---

### 3. Auth.js v5 (next-auth) 的认证流程 / Auth.js flow

**参考答案 / Answer**:
`signIn("credentials")` → `authorize()` 验证 → `jwt()` 写 role → 下发 cookie → middleware 验证 → `session()` 映射 role。

**📁 项目案例 / Repo example**：`lib/auth.ts` 完整实现。

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({ authorize(credentials) { /* 验证 */ } })],
  callbacks: { jwt({ token, user }) { if (user) token.role = user.role; return token; }, ... },
});
```

---

### 4. `auth()` 和 `useSession()` 的区别 / auth() vs useSession()

**参考答案 / Answer**:
`auth()` 服务端读 cookie（无网络请求）；`useSession()` 客户端经 Context。

**📁 项目案例 / Repo example**：`app/(dashboard)/roles/page.tsx`（auth）与 `app/components/sidebar.tsx`（useSession）。

```tsx
const session = await auth();           // 服务端
const { data: session } = useSession(); // 客户端
```

---

### 5. JWT callback 和 Session callback 的区别 / JWT vs Session callback

**参考答案 / Answer**:
JWT callback 登录时写一次；Session callback 每次读取映射。

**📁 项目案例 / Repo example**：`lib/auth.ts` 的两个回调。

```ts
jwt({ token, user }) { if (user) token.role = user.role; return token; },
session({ session, token }) { session.user.role = token.role; return session; },
```

---

### 6. 如何实现三层权限控制？/ Three-layer authorization

**参考答案 / Answer**:
Middleware（路由级登录）→ Page（页面级角色）→ Server Action（操作级权限）。

**📁 项目案例 / Repo example**：`proxy.ts` → `roles/page.tsx` → `lib/rbac.ts`。

---

### 7. 为什么 role 判断不放 Middleware？/ Why not check role in Middleware?

**参考答案 / Answer**:
Middleware 跑在 Edge，session 精简无 role；查库违背轻量定位，故 role 判断放在 Server Component。

**📁 项目案例 / Repo example**：`lib/auth.config.ts` 顶部注释明确说明。

```ts
// auth.user 在 middleware 中类型为 { name?, email?, image? }
// 自定义字段（如 role）不会出现在 middleware 的 session 中
```

---

### 8. Drizzle ORM 与 Server Components 如何配合 / Drizzle ORM + Server Components

**参考答案 / Answer**:
Drizzle 类型安全，DB 操作只在服务端执行。

**📁 项目案例 / Repo example**：`lib/db/schema.ts`（表定义）+ `app/(dashboard)/departments/actions.ts`（查询）。

```ts
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});
```

---

### 9. JSONB 字段的适用场景 / JSONB use cases

**参考答案 / Answer**:
适合结构灵活数据：权限数组、多维评分、审计详情。

**📁 项目案例 / Repo example**：`lib/db/schema.ts`。

```ts
permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
categories: jsonb("categories").$type<Record<string, number>>().notNull().default({}),
```

---

### 10. 如何实现审批工作流状态机？/ Approval workflow state machine

**参考答案 / Answer**:
字符串状态 + Server Action 流转 + 客户端条件渲染。

**📁 项目案例 / Repo example**：`app/(dashboard)/leaves/actions.ts`。

```ts
export async function approveLeaveRequest(id: number, approverId: number) {
  await db.update(leaveRequests).set({ status: "approved", approvedBy: approverId })
    .where(eq(leaveRequests.id, id));
  await log("approve", "leave_request", id, { approverId });
  revalidatePath("/leaves");
}
```

---

### 11. Server Action 的返回值能被客户端拿到吗？/ Can clients get Server Action return values?

**参考答案 / Answer**:
可以，返回值被序列化传回；必须可序列化。

**📁 项目案例 / Repo example**：`app/(dashboard)/leaves/actions.ts` 用 `.returning({ id })` 返回自增 ID。

```ts
const result = await db.insert(leaveRequests).values({ ... }).returning({ id: leaveRequests.id });
await log("create", "leave_request", result[0]?.id, { ... });
```

---

### 12. Next.js 的数据缓存机制 / Data caching

**参考答案 / Answer**:
Data Cache / Full Route Cache / Router Cache；写操作后需 `revalidatePath`/`revalidateTag`。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/actions.ts` 每个写操作末尾失效缓存。

```ts
await db.delete(departments).where(eq(departments.id, id));
revalidatePath("/departments");
```

---

### 13. 如何做服务端和客户端的表单校验？/ Server & client validation

**参考答案 / Answer**:
客户端 Zod + react-hook-form；服务端复用同一 schema 二次校验（安全底线）。

**📁 项目案例 / Repo example**：新增 `app/interview/server-validation/actions.ts` + `form.tsx`。

```ts
export async function createEmployee(data: unknown): Promise<ActionResult> {
  const parsed = employeeSchema.safeParse(data);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };
  return { success: true, data: parsed.data };
}
```

---

### 14. Promise.all 在 Server Component 中的作用 / Promise.all in Server Components

**参考答案 / Answer**:
并行取数，避免串行等待；总耗时从「和」变「最大值」。

**📁 项目案例 / Repo example**：`app/(dashboard)/leaves/page.tsx`。

```tsx
const [leaveData, leaveTypesData, employeesData] = await Promise.all([
  getLeaveRequests(), getLeaveTypes(), getEmployees(),
]);
```

---

### 15. Next.js 如何部署？/ How to deploy Next.js?

**参考答案 / Answer**:
Vercel / Node 服务器 / Docker / `output: "standalone"` 自托管。

**📁 项目案例 / Repo example**：`package.json` 的 `build`/`start` 脚本 + `drizzle.config.ts` 迁移配置。

```json
"build": "next build", "start": "next start"
```

---

### 16. 如何使用 Zod 进行类型推导？/ How to infer types from Zod?

**参考答案 / Answer**:
`z.infer<typeof schema>` 从 schema 自动推导类型。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/department-list.tsx`。

```ts
const formSchema = z.object({ name: z.string().min(1, "required") });
type FormValues = z.infer<typeof formSchema>;
```

---

### 17. 外键关联和 leftJoin 如何做？/ Foreign keys and leftJoin

**参考答案 / Answer**:
`.references()` 定义外键，`leftJoin` 拼装关联字段。

**📁 项目案例 / Repo example**：`lib/db/schema.ts`（外键）+ `app/(dashboard)/leaves/actions.ts`（leftJoin）。

```ts
employeeId: integer("employee_id").references(() => employees.id, { onDelete: "cascade" }),
```

```ts
.leftJoin(employees, eq(leaveRequests.employeeId, employees.id))
```

---

### 18. `.returning()` 的作用 / What does .returning() do?

**参考答案 / Answer**:
INSERT 后立即返回指定字段（如自增 ID），无需二次查询。

**📁 项目案例 / Repo example**：`app/(dashboard)/leaves/actions.ts`、`roles/actions.ts`。

```ts
.returning({ id: leaveRequests.id })
```

---

### 19. 审计日志如何实现？/ How to implement audit logging?

**参考答案 / Answer**:
写操作后调用 `log()`，try/catch 静默失败，不影响主流程。

**📁 项目案例 / Repo example**：`lib/audit.ts`。

```ts
try {
  const session = await auth();
  await db.insert(auditLogs).values({ user: session?.user?.name, action, entity, entityId, details });
} catch (err) {
  logger.error("Failed to write audit log", { ... });
}
```

---

### 20. 分页如何实现？/ How to implement pagination?

**参考答案 / Answer**:
URL `searchParams` 保持分页状态 + `limit`/`offset`。

**📁 项目案例 / Repo example**：新增 `app/interview/pagination/page.tsx`（`lib/pagination.ts` 提供通用 `paginatedQuery`）。

```tsx
const { page } = await searchParams;
const pageNum = Math.max(1, Number(page) || 1);
const data = ITEMS.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE);
```

---

### 21. 什么是乐观更新 useOptimistic？/ What is useOptimistic?

**参考答案 / Answer**:
提交后立即更新 UI，服务端确认后替换真实结果。

**📁 项目案例 / Repo example**：`app/concepts/optimistic/page.tsx`。

```tsx
const [optimisticItems, addOptimistic] = useOptimistic(items, (current, text) => [...current, text]);
addOptimistic(text);
const next = await addItem(items, text);
setItems(next);
```

---

### 22. Route Handlers 完整 CRUD 如何写？/ How to write full CRUD Route Handlers?

**参考答案 / Answer**:
`route.ts` 导出 `GET`/`POST`/`PUT`/`DELETE`，读 `searchParams`/body/headers/cookies。

**📁 项目案例 / Repo example**：`app/concepts/api/route.ts` + `app/concepts/api/[id]/route.ts`。

```ts
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json();
  return Response.json(updateItem(Number(id), body.name));
}
```

---

### 23. React Hook Form 的 isSubmitting 如何跟踪 Server Action？/ How does isSubmitting track Server Actions?

**参考答案 / Answer**:
提交函数是 async（await Server Action）时，`isSubmitting` 自动为 true。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/department-list.tsx`。

```tsx
<button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? "Saving..." : "Save"}
</button>
```

---

### 24. 每个模块的文件结构如何组织？/ How to organize each module?

**参考答案 / Answer**:
Page → Actions → Client Component 统一架构。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/`（page.tsx / actions.ts / department-list.tsx）。

---

### 25. 为什么要 force-dynamic？/ Why use force-dynamic?

**参考答案 / Answer**:
禁用静态渲染，保证实时数据/登录态页面每次动态渲染。

**📁 项目案例 / Repo example**：`app/(dashboard)/page.tsx` 顶部。

```tsx
export const dynamic = "force-dynamic";
```

---

### 26. 环境变量的安全边界（secrets）？/ Environment variable security?

**参考答案 / Answer**:
非 `NEXT_PUBLIC_` 变量只在服务端可见；secrets 绝不加前缀。

**📁 项目案例 / Repo example**：`.env.example` 只含 `DATABASE_URL`、`AUTH_SECRET` 两个服务端变量。

---

### 27. 如何在 Server Action 中处理错误？/ How to handle errors in Server Actions?

**参考答案 / Answer**:
抛异常（客户端 try/catch）或返回结果对象（表单类错误）。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/department-list.tsx` 用 try/catch + toast。

```tsx
try { await createDepartment(values); toast.success("created"); }
catch { toast.error("Operation failed"); }
```

---

### 28. revalidatePath 只刷新指定路径是什么意思？/ What does "revalidatePath only refreshes a path" mean?

**参考答案 / Answer**:
只失效指定路由的数据缓存，按需失效而非全量刷新。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/actions.ts`。

```ts
revalidatePath("/departments"); // 只失效 /departments
```

---

### 29. Drizzle ORM 与 Prisma 的对比 / Drizzle vs Prisma

**参考答案 / Answer**:
Drizzle 轻量、SQL-first、无查询引擎；Prisma 声明式 schema + 生成客户端。

**📁 项目案例 / Repo example**：`lib/db/schema.ts` 的 `pgTable` 定义（贴近 SQL 的 Drizzle 风格）。

---

### 30. 如何做 JOIN 查询返回「视图模型」？/ How to return a "view model" with JOINs?

**参考答案 / Answer**:
`leftJoin` 把关联字段拼进结果，客户端无需二次关联。

**📁 项目案例 / Repo example**：`app/(dashboard)/leaves/actions.ts` 的 `getLeaveRequests`。

```ts
return db.select({
  id: leaveRequests.id,
  employeeName: employees.name,
  leaveTypeName: leaveTypes.name,
}).from(leaveRequests)
  .leftJoin(employees, eq(leaveRequests.employeeId, employees.id))
  .leftJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id));
```

---

## 高级篇 / Advanced

### 1. React Server Components (RSC) 的渲染原理 / How do RSCs work under the hood?

**参考答案 / Answer**:
RSC 在服务端渲染，产出 RSC Payload + HTML；客户端用 Payload 构建组件树，Server Component 不下发 JS。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/page.tsx` —— Server Component 查库渲染，`department-list.tsx`（Client）才下发 JS。

```tsx
const data = await getDepartments();  // 服务端执行，代码不下发客户端
```

---

### 2. RSC Payload 是什么？/ What is the RSC Payload?

**参考答案 / Answer**:
服务端渲染产出的紧凑结构化表示（组件树 + props + 客户端引用），用于流式传输与 reconcile。

**📁 项目案例 / Repo example**：`app/(dashboard)/page.tsx` 等所有 Server Component 页面都会产出该 Payload（浏览器 Network 面板可见 `.rsc` 请求）。

---

### 3. Streaming SSR 的原理 / How does Streaming SSR work?

**参考答案 / Answer**:
用 `<Suspense>` 拆块，先返回骨架，再逐步推送慢内容。

**📁 项目案例 / Repo example**：`app/concepts/loading/page.tsx` + `slow-content.tsx`。

```tsx
<Suspense fallback={<Skeleton label="用户列表" />}>
  <SlowContent label="用户列表" />   {/* 3 秒后才到达 */}
</Suspense>
```

---

### 4. 缓存机制详解（Data Cache / Full Route Cache / Router Cache）/ Cache layers explained

**参考答案 / Answer**:
Data Cache（fetch 级持久）、Full Route Cache（路由 HTML/RSC）、Router Cache（客户端内存 payload）。

**📁 项目案例 / Repo example**：新增 `app/interview/revalidate-tag/actions.ts` 演示 Data Cache + 标签失效。

```ts
return unstable_cache(async () => ({ value: counter }), ["interview-counter"],
  { tags: ["interview-counter"], revalidate: 3600 })();
```

---

### 5. 什么是 Partial Prerendering (PPR)？/ What is Partial Prerendering?

**参考答案 / Answer**:
同一路由混合静态 + 动态内容，静态预渲染，动态部分 `<Suspense>` 流式填充。

**📁 项目案例 / Repo example**：`app/concepts/loading/page.tsx` 的「快内容 + Suspense 慢内容」结构即是 PPR 思想的雏形（PPR 本身为 experimental 标志）。

---

### 6. 什么是 React Compiler？/ What is the React Compiler?

**参考答案 / Answer**:
自动 memoization，减少手写 `useMemo`/`useCallback`。

**📁 项目案例 / Repo example**：`eslint.config.mjs` 引入 `eslint-config-next/core-web-vitals`，其中已含 React Compiler 的 `react-hooks` 校验规则（如 `set-state-in-effect`）。

---

### 7. Server Actions 的安全机制（加密闭包 ID）？/ Server Actions security (encrypted closure ID)

**参考答案 / Answer**:
每个 action 有加密 ID，客户端无法篡改逻辑；但内部仍需重新校验权限。

**📁 项目案例 / Repo example**：`lib/audit.ts` 在 action 内 `await auth()` 自动取当前用户（不信任客户端传参）。

```ts
const session = await auth();   // 从 cookie 读，而非信任客户端
```

---

### 8. Middleware 的 Edge Runtime 限制详解 / Edge Runtime limits in detail

**参考答案 / Answer**:
无 Node API、精简 session、执行时间/内存上限、需 `matcher`。

**📁 项目案例 / Repo example**：`proxy.ts` 用 `config.matcher` 精确控制触发范围。

```ts
matcher: ["/((?!api|_next/static|_next/image|favicon.ico|svgs).*)"]
```

---

### 9. 如何实现复杂 RBAC / 多租户权限？/ How to implement complex RBAC / multi-tenancy?

**参考答案 / Answer**:
JSONB 权限数组 + `resource:action` 格式；多租户加 `tenant_id` 隔离。

**📁 项目案例 / Repo example**：`lib/rbac.ts` 定义 `PERMISSIONS` 常量与 `DEFAULT_ROLES`。

```ts
export const PERMISSIONS = {
  DEPARTMENTS_READ: "departments:read",
  DEPARTMENTS_WRITE: "departments:write",
  LEAVES_APPROVE: "leaves:approve",
} as const;
```

---

### 10. Drizzle 的迁移（migrations）策略 / Drizzle migration strategy

**参考答案 / Answer**:
开发 `drizzle-kit push`；生产 `generate` + `migrate`，迁移文件纳入版本控制。

**📁 项目案例 / Repo example**：`drizzle.config.ts` + `package.json` 的 db 脚本。

```ts
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});
```

---

### 11. 事务处理（transactions）如何做？/ How to handle transactions?

**参考答案 / Answer**:
`db.transaction(async (tx) => ...)`，任一失败回滚。

**📁 项目案例 / Repo example**：新增 `app/interview/transactions/actions.ts`（插入两行后抛错演示回滚）。

```ts
await db.transaction(async (tx) => {
  await tx.insert(departments).values({ name: "TxDemo-A" });
  await tx.insert(departments).values({ name: "TxDemo-B" });
  throw new Error("触发 rollback");
});
```

---

### 12. 并发和数据竞争（乐观并发控制）/ Concurrency and optimistic concurrency

**参考答案 / Answer**:
版本号乐观锁：更新时校验版本，不匹配则冲突。

**📁 项目案例 / Repo example**：新增 `app/interview/optimistic-concurrency/actions.ts`。

```ts
if (doc.version !== expectedVersion) {
  return { ok: false, current: doc, message: "版本冲突，请刷新后重试" };
}
doc = { ...doc, title, version: doc.version + 1 };
```

---

### 13. 如何优化首屏性能（LCP / CLS / INP）？/ How to optimize Core Web Vitals?

**参考答案 / Answer**:
SSR 出 HTML（LCP）、`next/image` 预设尺寸 + `next/font` 自托管（CLS=0）、RSC 减 JS（INP）。

**📁 项目案例 / Repo example**：`app/layout.tsx` 用 `next/font` 自托管字体。

```tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
```

---

### 14. next/image 的优化原理和 remotePatterns 安全 / How next/image optimizes + remotePatterns security

**参考答案 / Answer**:
按需多尺寸/格式、懒加载、防 CLS；`remotePatterns` 白名单防 SSRF。

**📁 项目案例 / Repo example**：`next.config.ts` 只允许 `images.unsplash.com`。

```ts
images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] }
```

---

### 15. 如何做错误监控和日志追踪（traceId）？/ Error monitoring and trace tracking?

**参考答案 / Answer**:
`AsyncLocalStorage` 跨异步链传递 traceId，同一请求日志共享 ID。

**📁 项目案例 / Repo example**：`lib/logger.ts`。

```ts
const asyncContext = new AsyncLocalStorage<TraceContext>();
export async function withTrace<T>(traceId: string, fn: () => Promise<T>) {
  return asyncContext.run({ traceId }, fn);
}
```

---

### 16. 国际化（i18n）如何实现？/ How to implement i18n?

**参考答案 / Answer**:
`[locale]` 动态段 + 翻译字典；生产常用 `next-intl`/`react-i18next`。

**📁 项目案例 / Repo example**：新增 `app/interview/i18n/[locale]/page.tsx`。

```tsx
const { locale } = await params;
const t = dict[locale] ?? dict.en;   // 回退默认语言
```

---

### 17. A/B 测试和 feature flag 如何做？/ How to do A/B testing and feature flags?

**参考答案 / Answer**:
middleware 读/写 Cookie 分流，服务端按变体渲染。

**📁 项目案例 / Repo example**：新增 `app/interview/ab-test/`（`route.ts` 设 Cookie + `page.tsx` 读变体）。

```ts
res.cookies.set("ab_variant", variant, { path: "/", maxAge: 60 * 60 * 24 });
```

```tsx
const store = await cookies();
const variant = store.get("ab_variant")?.value ?? "a";
```

---

### 18. WebSocket / 实时数据如何实现？/ How to implement real-time data?

**参考答案 / Answer**:
Route Handler 返回 `text/event-stream`（SSE）或升级 WebSocket。

**📁 项目案例 / Repo example**：新增 `app/interview/sse/route.ts` + `page.tsx`。

```ts
return new Response(stream, {
  headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
});
```

---

### 19. 数据库连接池在 Serverless 中的挑战 / DB connection pooling in Serverless

**参考答案 / Answer**:
并发扩容耗尽连接；对策：限制 `max`、连接池服务、全局单例。

**📁 项目案例 / Repo example**：`lib/db/index.ts`。

```ts
const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });
```

---

### 20. 如何做缓存失效策略？/ Cache invalidation strategy

**参考答案 / Answer**:
`revalidatePath`（路径）、`revalidateTag`（标签）、`revalidate`（时间）、`router.refresh()`（客户端）。

**📁 项目案例 / Repo example**：`app/(dashboard)/departments/actions.ts`（revalidatePath）+ `app/interview/revalidate-tag/actions.ts`（revalidateTag）。

---

### 21. 测试策略（Vitest + Testing Library）？/ Testing strategy?

**参考答案 / Answer**:
Vitest 测纯函数、Testing Library 测组件、直接调用 action 断言、Playwright E2E。

**📁 项目案例 / Repo example**：`lib/concepts-store.test.ts` + `app/concepts/concepts.test.tsx` + `vitest.config.ts`。

```ts
import { describe, it, expect } from "vitest";
describe("concepts-store", () => {
  it("listItems 返回所有项", () => { expect(listItems()).toHaveLength(2); });
});
```

---

### 22. 部署到边缘（Edge Functions）？/ Deploy to the edge?

**参考答案 / Answer**:
Middleware 默认 Edge；Route Handler 可 `export const runtime = "edge"`。

**📁 项目案例 / Repo example**：`proxy.ts` 即运行在 Edge Runtime 的 middleware。

---

### 23. 安全性：CSRF / XSS / SQL 注入防护？/ Security: CSRF, XSS, SQL injection?

**参考答案 / Answer**:
React 默认转义防 XSS；ORM 参数化防注入；加密 action ID 防 CSRF。

**📁 项目案例 / Repo example**：`lib/db/index.ts` 用 Drizzle 参数化查询；`app/(dashboard)/page.tsx` 的 `sql` 仅用于静态条件。

```ts
.where(sql`${assets.status} = 'available'`)
```

---

### 24. 如何做代码分割和动态导入（dynamic()）？/ Code splitting and dynamic import?

**参考答案 / Answer**:
`next/dynamic` 按需加载组件，配合 `loading` 与 `ssr: false`。

**📁 项目案例 / Repo example**：新增 `app/interview/dynamic-import/page.tsx` + `heavy.tsx`。

```tsx
const Heavy = dynamic(() => import("./heavy"), {
  loading: () => <p>加载中...</p>,
  ssr: false,
});
```

---

### 25. React 19 新特性（useActionState / useFormStatus）？/ React 19 features?

**参考答案 / Answer**:
`useFormStatus` 读 pending、`useActionState` 管理 action 返回值、`useOptimistic` 乐观更新。

**📁 项目案例 / Repo example**：新增 `app/interview/react19/page.tsx` + `app/concepts/optimistic/page.tsx`。

```tsx
const [state, formAction] = useActionState(submitComment, { message: "" });
const { pending } = useFormStatus();
```

---

### 26. useTransition 和 startTransition 的作用？/ useTransition and startTransition?

**参考答案 / Answer**:
标记非紧急更新，避免慢渲染阻塞输入。

**📁 项目案例 / Repo example**：新增 `app/interview/transition/page.tsx`。

```tsx
const [isPending, startTransition] = useTransition();
setInput(value);
startTransition(() => setFilter(value));
```

---

### 27. 如何实现复杂状态机（XState 思路）？/ How to implement a complex state machine?

**参考答案 / Answer**:
显式定义状态 + 允许转移 + 触发动作，每个转移封装为独立 Server Action。

**📁 项目案例 / Repo example**：`app/(dashboard)/leaves/actions.ts`（pending→approved/rejected）、`performance/actions.ts`（draft→self_review→completed）、`salaries/actions.ts`（draft→paid）。

---

### 28. 性能剖析和调试如何做？/ Profiling and debugging?

**参考答案 / Answer**:
`ANALYZE=true next build`、React DevTools、缓存调试、结构化日志 + traceId。

**📁 项目案例 / Repo example**：`lib/logger.ts`（结构化日志 + traceId）+ `package.json` 的 `build` 脚本做类型/编译校验。

---

### 29. Monorepo / 多应用部署？/ Monorepo / multi-app deployment?

**参考答案 / Answer**:
pnpm workspace 组织多应用 + 共享包。

**📁 项目案例 / Repo example**：`pnpm-workspace.yaml` 已存在。

---

### 30. 未来趋势（RSC / PPR / Cache Components）？/ Future trends?

**参考答案 / Answer**:
RSC 默认化、PPR 成默认、Cache Components 细粒度缓存、React Compiler 自动优化。

**📁 项目案例 / Repo example**：本仓库已用 Next 16 的 `revalidateTag(tag, profile)`（Cache Components 时代 API），见 `app/interview/revalidate-tag/actions.ts`。

```ts
revalidateTag("interview-counter", "default");   // 传入 cache-life profile
```

---

> 学习材料对照：8 小时速成见 `LEARNING_8H.md`，知识点笔记见 `STUDY_NOTE.md`，项目结构见 `README.md`。面试题演示区源码见 `app/interview/`。/ See `LEARNING_8H.md`, `STUDY_NOTE.md`, `README.md`, and `app/interview/`.
