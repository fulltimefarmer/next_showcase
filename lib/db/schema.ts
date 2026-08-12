// ============================================================================
// 【Next.js 知识点】数据库 Schema — Drizzle ORM 与 Server Components
// ============================================================================
// 1. 数据库操作在 Next.js App Router 中只能在服务端执行:
//    - Server Components (默认 async 组件)
//    - Server Actions ("use server" 文件)
//    - API Routes (route.ts)
// 2. Drizzle ORM 是 TypeScript-first 的 ORM，与 Prisma 类似但更轻量
//    - pgTable 定义表结构，自动推导 TypeScript 类型
//    - 查询结果是完全类型安全的（无需手动写类型）
// 3. JSONB 字段: PostgreSQL 特有，适合存储灵活结构（权限数组、评分维度等）
//    - 用 .$type<T>() 指定 TypeScript 类型
// ============================================================================

import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ============================================================================
// 组织架构
// ============================================================================

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // 【Next.js】Server Component 中可以直接读取这些字段渲染到 HTML
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 员工与角色
// ============================================================================

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 255 }),
  // 【Next.js】外键关联: 在 Server Action 中通过 ORM 做 JOIN 查询
  departmentId: integer("department_id").references(() => departments.id, {
    onDelete: "set null",
  }),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  hireDate: date("hire_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 角色与权限 (RBAC)
// ============================================================================

/**
 * JSONB 存储权限列表 — PostgreSQL 特有功能
 * 例如: ["departments:read", "departments:write", "employees:read"]
 * 灵活性: 新增权限不需要修改表结构，直接改应用代码即可
 */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 请假管理
// ============================================================================

export const leaveTypes = pgTable("leave_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  maxDays: integer("max_days").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * 请假申请表
 * status 流程: pending → approved/rejected
 * 这个状态机在 leave-list.tsx 的客户端组件中通过按钮触发
 */
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id, { onDelete: "cascade" })
    .notNull(),
  leaveTypeId: integer("leave_type_id")
    .references(() => leaveTypes.id, { onDelete: "restrict" })
    .notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  approvedBy: integer("approved_by").references(() => employees.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 资产管理
// ============================================================================

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  serialNumber: varchar("serial_number", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("available"),
  assignedTo: integer("assigned_to").references(() => employees.id, {
    onDelete: "set null",
  }),
  purchaseDate: date("purchase_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 薪资管理
// ============================================================================

/**
 * 薪资表
 * actual_payment = base_salary + bonus - deductions (Server Action 中计算)
 */
export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id, { onDelete: "cascade" })
    .notNull(),
  payPeriod: varchar("pay_period", { length: 20 }).notNull(),
  baseSalary: integer("base_salary").notNull().default(0),
  bonus: integer("bonus").notNull().default(0),
  deductions: integer("deductions").notNull().default(0),
  actualPayment: integer("actual_payment").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  paidDate: date("paid_date"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 绩效考核
// ============================================================================

/**
 * 绩效考核表
 * categories 用 JSONB 存多维度评分: {"work_quality": 85, "efficiency": 90, ...}
 * 相比为每个维度建列，JSONB 更灵活 — 新增维度无需改 schema
 */
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id, { onDelete: "cascade" })
    .notNull(),
  cycle: varchar("cycle", { length: 20 }).notNull(),
  categories: jsonb("categories").$type<Record<string, number>>().notNull().default({}),
  overallScore: integer("overall_score").notNull().default(0),
  selfScore: integer("self_score").notNull().default(0),
  managerScore: integer("manager_score").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 审计日志
// ============================================================================

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  user: varchar("user", { length: 255 }),
  action: varchar("action", { length: 50 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
