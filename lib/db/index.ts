import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });

/**
 * 确保数据库表结构存在
 * Next.js 开发模式下每次请求都会重新编译，用 CREATE TABLE IF NOT EXISTS 安全
 */
export async function ensureSchema() {
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
}
