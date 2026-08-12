import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  integer,
  timestamp,
  jsonb,
  PgColumn,
} from "drizzle-orm/pg-core";

// ============================================================================
// 组织架构
// ============================================================================

/** 部门表：公司组织架构的基本单元 */
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 员工与角色
// ============================================================================

/**
 * 员工表
 * 新增 role 字段关联 RBAC 角色，支持基于角色的权限控制
 */
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 255 }),
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
 * 角色表
 * permissions 使用 JSONB 存储权限列表，灵活扩展
 * 例如：["departments:read", "departments:write", "employees:read"]
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

/** 请假类型：年假、病假、事假等 */
export const leaveTypes = pgTable("leave_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  maxDays: integer("max_days").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * 请假申请表
 * status 流程：pending → approved/rejected
 * approved_by 记录审批人
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

/**
 * 资产表
 * status: available | in_use | maintenance | scrapped
 * assigned_to 关联员工，记录资产归属
 */
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
 * 每月/每期一条记录，记录员工的薪资明细
 * pay_period: 薪资周期标识，如 "2024-07"
 * status: draft（草稿）| paid（已发放）
 * actual_payment = base_salary + bonus - deductions
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
 * 支持多维度评分，使用 JSONB 存储各维度分数，灵活扩展
 * cycle: 考核周期，如 "2024-Q3"
 * categories 示例: {"work_quality": 85, "efficiency": 90, "teamwork": 80, "innovation": 75}
 * status: draft（草稿）| self_review（自评完成）| manager_review（主管已评）| completed（归档）
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

/**
 * 审计日志表
 * 记录关键操作，用于追溯
 * action: create | update | delete | approve | reject
 * details 使用 JSONB 存储变更详情
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  user: varchar("user", { length: 255 }),
  action: varchar("action", { length: 50 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
