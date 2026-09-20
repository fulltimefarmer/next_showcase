# E-Commerce 全栈项目规划文档

> 目标：在现有 `maxopc` 脚手架（Next.js 16 + TypeScript + PostgreSQL + Drizzle + Tailwind）基础上，演进为一个**小电商**全栈项目。
> 原则：技术栈与中间件一律选**当下最主流**的方案，同时列出备选便于替换决策。

---

## 1. 项目概述

| 维度 | 描述 |
|---|---|
| 类型 | B2C 小型电商（类似小商城） |
| 受众 | ① 前端客户（浏览/下单/支付）② 后台运营（商品/订单/库存/营销） |
| 架构 | Next.js App Router 单体应用（route group 拆分双端），可平滑演进到 monorepo |
| 目标 | 覆盖电商核心闭环：商品 → 购物车 → 下单 → 支付 → 履约 → 售后 |

---

## 2. 总体架构

```
                    ┌─────────────────────────────────────────────┐
                    │           Next.js 16 (App Router)           │
                    │                                             │
  storefront 客户端 │  (store)/            (admin)/   后台管理     │
  /product /cart    │  Server Components   Server Components      │
  /checkout /account│  Server Actions      Server Actions         │
  /orders           │  Route Handlers      Route Handlers         │
                    └──────────┬──────────────────┬───────────────┘
                               │                  │
              ┌────────────────▼────┐    ┌────────▼────────────┐
              │   PostgreSQL        │    │   Redis (缓存/限流)  │
              │   (Drizzle/Prisma)  │    │   (Upstash)         │
              └────────────────┬────┘    └────────┬────────────┘
                               │                  │
              ┌────────────────▼────┐    ┌────────▼────────────┐
              │ 对象存储 (图片)      │    │ 外部服务             │
              │ S3/Blob/Cloudinary  │    │ Stripe/邮件/搜索/日志 │
              └─────────────────────┘    └─────────────────────┘
```

- **单体应用**：`app/(store)` 客户前台 + `app/(admin)` 管理后台，共享 `lib/` 数据层与类型。
- **API 风格**：默认 Server Actions；第三方回调（Webhook）、跨端/开放 API 用 Route Handlers。

---

## 3. 前端按受众切分

### 3.1 客户前台 `(store)`

| 页面 | 路由 | 说明 |
|---|---|---|
| 首页 | `/` | 商品推荐、分类入口、营销 Banner |
| 商品列表 | `/products` | 筛选（价格/分类/属性）、排序、分页 |
| 商品详情 | `/products/[slug]` | 图片、SKU 选择、库存、评价 |
| 购物车 | `/cart` | 增删改、数量、优惠券 |
| 结算 | `/checkout` | 地址、配送、支付方式、确认下单 |
| 支付结果 | `/checkout/result` | 成功/失败页 |
| 登录/注册 | `/login` `/register` | 邮箱密码 + OAuth |
| 个人中心 | `/account` | 资料、地址簿 |
| 我的订单 | `/account/orders` | 订单列表、详情、退款/售后 |
| 搜索 | `/search` | 全站搜索 |

### 3.2 管理后台 `(admin)`

| 模块 | 路由 | 说明 |
|---|---|---|
| Dashboard | `/admin` | 销售概览、关键指标图表 |
| 商品管理 | `/admin/products` | 商品/SKU CRUD、上下架 |
| 分类管理 | `/admin/categories` | 分类树、排序 |
| 库存管理 | `/admin/inventory` | 库存查看、补货、预警 |
| 订单管理 | `/admin/orders` | 订单列表、状态流转、发货 |
| 客户管理 | `/admin/customers` | 客户信息、消费记录 |
| 优惠券/促销 | `/admin/promotions` | 优惠券、满减、限时折扣 |
| 评价管理 | `/admin/reviews` | 审核、回复、删除 |
| 内容/SEO | `/admin/content` | 页面、Banner、元信息 |
| 权限管理 | `/admin/roles` | RBAC（基于 CASL） |
| 审计日志 | `/admin/audit-logs` | 操作追踪 |

---

## 4. 后端模块划分

| 模块 | 职责 | 核心实体 |
|---|---|---|
| **商品 Catalog** | 分类、商品、SKU、属性、规格 | Category, Product, SKU, Attribute |
| **库存 Inventory** | 库存数量、锁定/释放、预警 | Inventory, StockMovement |
| **客户与认证 Auth** | 注册/登录、会话、角色、地址 | User, Session, Role, Address |
| **购物车 Cart** | 会话/用户购物车、条目 | Cart, CartItem |
| **订单 Order** | 下单、状态机、订单明细 | Order, OrderItem |
| **支付 Payment** | 支付会话、回调、退款 | Payment, Refund |
| **配送 Shipping** | 配送方式、运费、物流单号 | Shipment, ShippingMethod |
| **优惠 Promotion** | 优惠券、满减、折扣规则 | Coupon, Promotion |
| **评价 Review** | 评分、评论、审核 | Review |
| **搜索 Search** | 全文检索、筛选聚合 | Search index |
| **内容 Content** | 页面、Banner、SEO 元信息 | Page, Banner |
| **审计 Audit** | 后台操作日志 | AuditLog |

### 核心状态机

```
订单:  pending → paid → processing → shipped → delivered
              ↘ cancelled / refunded

支付:  created → succeeded → refunded
              ↘ failed

库存:  in_stock → reserved → shipped / released
```

---

## 5. 技术选型总览（主流推荐 + 备选）

> 说明：`★` 为推荐（当前最主流 / 生态最好 / 与 Next.js 集成度最高）。

### 5.1 框架与语言

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 框架 | Next.js 16 App Router | Nuxt、Remix、SvelteKit | 已采用，SSR/SSG/ISR 全支持 |
| 语言 | TypeScript 5 | — | 全栈类型安全 |
| 运行时 | Node.js 20+ | Bun、Deno | Vercel 默认 Node |

### 5.2 数据库与 ORM

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 数据库 | PostgreSQL | MySQL、MongoDB、PlanetScale | 电商强事务 + JSONB 扩展性好 |
| ORM | Drizzle（已用）| Prisma、Kysely | 若求生态/迁移工具齐全可用 Prisma |
| 连接池 | postgres-js | pg、pgbouncer | 已用 |
| 迁移 | drizzle-kit | Prisma Migrate、dbmate | 已用 |

### 5.3 认证与授权

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 认证 | Auth.js (next-auth v5) | Clerk、Auth0、Better Auth、Lucia | 自托管可控；Clerk 开箱即用省事 |
| RBAC | CASL (`@casl/ability`) | Casbin、AccessControl、next-rbac | 轻量同构、TS 友好、前后端通用 |
| React 权限组件 | `@casl/react` | 手写 `<Can>` | `<Can>` 组件 / `useAbility` hook |
| 密码哈希 | bcrypt / argon2 | — | — |

> **CASL 选型说明**：放弃自研 `lib/rbac.ts`，改用 CASL 的 `defineAbilitiesFor(user)` 工厂生成 `Ability` 实例，配合 `@casl/react` 在服务端（Server Component / Server Action / Middleware）与客户端（`<Can>`）共用同一套规则；角色仍存于 `users.role`，能力（ability）在运行时按角色 + 资源条件推导。

### 5.4 支付（核心）

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 支付网关 | Stripe | PayPal、Adyen、Braintree、Mollie、Paddle、LemonSqueezy、Square | Stripe 生态最全、文档最好、Webhook 完善 |
| 国内支付 | 支付宝/微信支付 | Stripe China | 若面向国内用户 |
| 订阅 | Stripe Billing | Paddle、LemonSqueezy | 若含订阅商品 |

### 5.5 状态管理与数据请求

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 客户端状态 | Zustand | Redux Toolkit、Jotai、Recoil | 轻量、主流 |
| 服务端状态 | TanStack Query | SWR、RTK Query | 购物车/列表缓存与失效 |
| 表单 | react-hook-form | Formik、TanStack Form | 已用过 |
| 校验 | Zod | Yup、Valibot | 已用过，支持 Server 双端复用 |

### 5.6 UI 与样式

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| CSS | Tailwind CSS v4 | CSS Modules、Vanilla Extract | 已用 |
| 组件库 | shadcn/ui | Radix UI、MUI、Chakra、Ant Design、NextUI | shadcn 可复制代码、与 Tailwind 完美结合 |
| 图标 | lucide-react | Heroicons、React Icons | 已用过 |
| 通知 | sonner | react-hot-toast | 已用过 |

### 5.7 文件与媒体

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 图片存储 | Vercel Blob | AWS S3、Cloudinary、UploadThing、Cloudflare R2 | 与 Vercel 集成无缝 |
| 图片优化 | next/image | Cloudinary 动态图 | 内置 |
| 文件上传 | Vercel Blob + Server Action | S3 Presigned URL | — |

### 5.8 搜索与缓存

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 全文搜索 | Meilisearch | Algolia、Typesense、Elasticsearch、Postgres FTS | 小项目可先用 PG FTS，量起来再上专用 |
| 缓存 | Redis (Upstash) | Redis、Valkey、Next.js cache | 购物车/会话/热点数据 |
| 限流 | Upstash Ratelimit | @upstash/ratelimit、自研 | 防刷支付/登录 |

### 5.9 后台任务与消息

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 队列/任务 | Inngest | Trigger.dev、BullMQ、QStash | 订单超时取消、邮件、对账 |
| 邮件 | Resend | SendGrid、Postmark、AWS SES、Nodemailer | React 模板友好 |

### 5.10 可观测性与分析

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 错误监控 | Sentry | Axiom、Logtail、Highlight | 已够成熟 |
| 日志 | Axiom / Better Stack | pino + 自建 | 结构化日志 |
| 分析 | PostHog | Plausible、Vercel Analytics、Umami | 兼顾隐私与功能 |

### 5.11 测试与质量

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 单元/组件 | Vitest + Testing Library | Jest | 已用 |
| E2E | Playwright | Cypress | 覆盖下单/支付链路 |
| 类型检查 | tsc + ESLint 9 | Biome | 已用 |
| CI | GitHub Actions | Vercel Checks | — |

### 5.12 部署与工程化

| 领域 | 推荐 ★ | 备选 | 说明 |
|---|---|---|---|
| 部署 | Vercel | AWS、Docker + Fly.io、自建 | 与 Next.js 最契合 |
| 包管理 | pnpm | npm、bun | 已用 |
| Monorepo | Turborepo | Nx、pnpm workspace | 演进时可拆分 store/admin/worker |
| 环境变量 | Vercel Env / .env | Doppler、Infisical | 密钥管理 |

---

## 6. 数据模型草案（核心表）

```
users            id, email, name, password_hash, role
addresses        id, user_id, recipient, phone, line1, city, postal_code, is_default
categories       id, parent_id, name, slug, sort
products         id, name, slug, description, price, status, category_id
skus             id, product_id, sku_code, price, stock, attributes(JSONB)
product_images   id, product_id, url, sort
carts            id, user_id?, session_id
cart_items       id, cart_id, sku_id, quantity
orders           id, order_no, user_id, status, total, address_snapshot, ...
order_items      id, order_id, sku_id, product_snapshot, quantity, price
payments         id, order_id, provider, provider_txn_id, status, amount
refunds          id, payment_id, amount, status, reason
shipments        id, order_id, carrier, tracking_no, status
coupons          id, code, type, value, min_spend, expires_at, usage_limit
promotions       id, type, rule(JSONB), starts_at, ends_at
reviews          id, product_id, user_id, rating, content, status
audit_logs       id, user, action, entity, entity_id, details(JSONB)
```

---

## 7. 项目结构建议

```
app/
├── (store)/            # 客户前台
│   ├── page.tsx        # 首页
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   └── login/
├── (admin)/            # 管理后台
│   ├── layout.tsx      # 侧边栏 + 权限守卫
│   ├── dashboard/
│   ├── products/
│   ├── orders/
│   └── ...
├── api/
│   └── webhooks/stripe/route.ts   # 支付回调
├── layout.tsx
└── globals.css
lib/
├── db/                 # schema + client
├── auth.ts             # Auth.js 配置
├── ability.ts          # CASL 权限定义 (defineAbilitiesFor + subject 类型)
├── cart.ts
├── payment.ts          # Stripe 封装
├── email.ts
└── ...
```

---

## 8. 里程碑 / 路线图

| 阶段 | 内容 | 交付物 |
|---|---|---|
| M1 基础 | 商品/分类数据模型、前台列表/详情、后台 CRUD | 可浏览的商城骨架 |
| M2 认证 | 注册/登录、会话、CASL 权限、后台权限 | 双端登录与权限 |
| M3 交易闭环 | 购物车、下单、Stripe 支付、Webhook、库存扣减 | 可下单付款 |
| M4 履约 | 订单状态机、发货、物流单号、退款 | 订单全生命周期 |
| M5 营销与体验 | 优惠券/促销、评价、搜索、邮件通知 | 完整电商体验 |
| M6 运营与质量 | Dashboard、审计、监控、E2E、部署 | 生产可用 |

---

## 9. 关键决策点（需确认）

1. **单体 vs Monorepo**：先单体，规模上来再拆 `store` / `admin` / `worker`。
2. **支付**：是否上真实 Stripe（需账号/测试密钥）还是先用模拟支付。
3. **ORM**：沿用 Drizzle 还是迁移到 Prisma（生态更全）。
4. **认证**：自托管 Auth.js 还是用 Clerk 托管（省事但产生依赖）。
5. **目标市场**：面向国内（支付宝/微信）还是海外（Stripe），影响支付与短信选型。
6. **部署**：Vercel（最省心）还是自建（更可控、成本可预测）。
