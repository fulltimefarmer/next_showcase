// ============================================================================
// 【Next.js 知识点】数据库连接 — Drizzle ORM + PostgreSQL
// ============================================================================
// 1. 数据库连接在模块作用域创建（模块单例）
//    - Next.js 在开发模式下会热重载，但模块级变量只会初始化一次
//    - postgres-js 库内置了连接池管理（max: 10）
// 2. ensureSchema(): 用 CREATE TABLE IF NOT EXISTS 确保表结构
//    - 这是一个简化方案，适合学习和原型开发
//    - 生产环境推荐用 Drizzle Kit 的 migration（drizzle-kit generate + migrate）
//    - 为什么在每次请求时调用？开发模式下热重载可能导致 schema 不稳定
//      IF NOT EXISTS 保证了幂等性
// 3. db 是 Drizzle ORM 实例，在所有 Server Components 和 Server Actions 中共享
// ============================================================================

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { createLogger } from "@/lib/logger";

const logger = createLogger("lib/db");

// 【Next.js】process.env 访问环境变量（.env.local 中的值）
// 只有 DATABASE_URL 这种非 NEXT_PUBLIC_ 前缀的变量才能在服务端访问
const connectionString = process.env.DATABASE_URL!;

// 【postgres-js】创建连接池，max: 10 限制最大连接数
// 在 Serverless 环境中连接数限制很重要
const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });

/**
 * 确保数据库表结构存在
 * 用 CREATE TABLE IF NOT EXISTS 安全 — 已存在的表不会重建，不会丢数据
 *
 * 注意: 这不是生产推荐做法（应该用 migration），
 * 但适合学习和快速原型开发
 */
export async function ensureSchema() {
  logger.debug("ensureSchema: 开始确保表结构存在");
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      position VARCHAR(255),
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      hire_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      permissions JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS leave_types (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      max_days INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      approved_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS salaries (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      pay_period VARCHAR(20) NOT NULL,
      base_salary INTEGER NOT NULL DEFAULT 0,
      bonus INTEGER NOT NULL DEFAULT 0,
      deductions INTEGER NOT NULL DEFAULT 0,
      actual_payment INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      paid_date DATE,
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS performance_reviews (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      cycle VARCHAR(20) NOT NULL,
      categories JSONB NOT NULL DEFAULT '{}',
      overall_score INTEGER NOT NULL DEFAULT 0,
      self_score INTEGER NOT NULL DEFAULT 0,
      manager_score INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      comments TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      serial_number VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'available',
      assigned_to INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      purchase_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      "user" VARCHAR(255),
      action VARCHAR(50) NOT NULL,
      entity VARCHAR(50) NOT NULL,
      entity_id INTEGER,
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  logger.debug("ensureSchema: 表结构就绪");
}
