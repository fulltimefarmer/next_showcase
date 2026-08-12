/**
 * 数据库初始化脚本 — 填充充足的测试数据
 *
 * 用法: pnpm db:seed
 *
 * 特性:
 * - 幂等: 多次运行先清空再填充，结果一致
 * - 外键安全: 按依赖顺序清理和插入
 * - 自动加载 .env.local: 无需额外配置
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

// ── 加载 .env.local ──────────────────────────────────────────────────────────
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch { /* .env.local not found, will use process.env */ }

const DATABASE_URL = process.env.DATABASE_URL!;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL 未设置，请检查 .env.local 文件");
  process.exit(1);
}
const sql = postgres(DATABASE_URL, { max: 1 });

// ── 工具函数 ────────────────────────────────────────────────────────────────
function date(daysOffset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}
function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}
function period(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// ── 主函数 ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 开始初始化测试数据...\n");

  // ── 清空 ──────────────────────────────────────────────────────────────────
  console.log("🧹 清空已有数据...");
  await sql.unsafe(`
    TRUNCATE TABLE audit_logs, leave_requests, salaries, performance_reviews,
                 assets, employees, leave_types, roles, departments
    RESTART IDENTITY CASCADE
  `);
  console.log("   已清空所有表\n");

  // ========================================================================
  // 1. 部门 — 8个
  // ========================================================================
  console.log("📦 插入部门...");
  const deptRes = await sql.unsafe(`
    INSERT INTO departments (name, description) VALUES
      ('Engineering',       'Software development, DevOps and QA'),
      ('Marketing',         'Brand strategy, content and growth'),
      ('Finance',           'Accounting, FP&A and compliance'),
      ('Human Resources',   'Recruitment, L&D and culture'),
      ('Operations',        'Supply chain and office management'),
      ('Sales',             'Enterprise and SMB sales'),
      ('IT',                'Internal tools and helpdesk'),
      ('Legal',             'Contracts, IP and regulatory')
    RETURNING id, name
  `);
  const D: Record<string, number> = {};
  for (const r of deptRes) D[r.name] = r.id;
  console.log(`   已插入 ${Object.keys(D).length} 个部门`);

  // ========================================================================
  // 2. 角色 — 3个 (预置)
  // ========================================================================
  console.log("🔐 插入角色...");
  await sql.unsafe(`
    INSERT INTO roles (name, description, permissions) VALUES
      ('admin', 'Full system access',
       '["departments:read","departments:write","employees:read","employees:write","assets:read","assets:write","roles:read","roles:write","leaves:read","leaves:write","leaves:approve","audit:read"]'::jsonb),
      ('manager', 'Department manager',
       '["departments:read","employees:read","assets:read","assets:write","leaves:read","leaves:approve"]'::jsonb),
      ('user', 'Regular employee',
       '["departments:read","employees:read","assets:read","leaves:read","leaves:write"]'::jsonb)
  `);
  console.log("   已插入 3 个角色\n");

  // ========================================================================
  // 3. 员工 — 24人
  //    每个部门 1 个 manager + 1-2 个 user，加 1 个 admin
  // ========================================================================
  console.log("👥 插入员工...");
  const empRes = await sql.unsafe(`
    INSERT INTO employees (name, email, phone, position, department_id, role, hire_date) VALUES
      -- Engineering (4)
      ('Zhang Wei',     'zhangwei@company.com',   '13800001001', 'Engineering Director',   ${D["Engineering"]},  'manager', '${fmt(date(-900))}'),
      ('Li Na',         'lina@company.com',        '13800001002', 'Senior Developer',       ${D["Engineering"]},  'user',    '${fmt(date(-500))}'),
      ('Wang Fang',     'wangfang@company.com',    '13800001003', 'Frontend Developer',     ${D["Engineering"]},  'user',    '${fmt(date(-365))}'),
      ('Chen Jie',      'chenjie@company.com',     '13800001004', 'Backend Developer',      ${D["Engineering"]},  'user',    '${fmt(date(-200))}'),
      -- Marketing (3)
      ('Zhao Min',      'zhaomin@company.com',     '13800001005', 'Marketing Manager',      ${D["Marketing"]},    'manager', '${fmt(date(-600))}'),
      ('Sun Hao',       'sunhao@company.com',      '13800001006', 'Content Specialist',     ${D["Marketing"]},    'user',    '${fmt(date(-300))}'),
      ('Peng Lin',      'penglin@company.com',     '13800001020', 'SEO Analyst',            ${D["Marketing"]},    'user',    '${fmt(date(-180))}'),
      -- Finance (3)
      ('Zhou Lin',      'zhoulin@company.com',     '13800001007', 'Finance Manager',        ${D["Finance"]},      'manager', '${fmt(date(-700))}'),
      ('Wu Yu',         'wuyu@company.com',        '13800001008', 'Accountant',             ${D["Finance"]},      'user',    '${fmt(date(-180))}'),
      ('Deng Xin',      'dengxin@company.com',     '13800001021', 'Financial Analyst',      ${D["Finance"]},      'user',    '${fmt(date(-150))}'),
      -- HR (3)
      ('Xu Jing',       'xujing@company.com',      '13800001009', 'HR Director',            ${D["Human Resources"]}, 'manager', '${fmt(date(-800))}'),
      ('Ma Tao',        'matao@company.com',       '13800001010', 'HR Specialist',          ${D["Human Resources"]}, 'user',    '${fmt(date(-150))}'),
      ('Guo Li',        'guoli@company.com',       '13800001022', 'Recruiter',              ${D["Human Resources"]}, 'user',    '${fmt(date(-120))}'),
      -- Operations (3)
      ('Liu Yang',      'liuyang@company.com',     '13800001011', 'Operations Manager',     ${D["Operations"]},   'manager', '${fmt(date(-550))}'),
      ('Huang Lei',     'huanglei@company.com',    '13800001012', 'Operations Analyst',     ${D["Operations"]},   'user',    '${fmt(date(-120))}'),
      ('Xiang Bo',      'xiangbo@company.com',     '13800001023', 'Logistics Coordinator',  ${D["Operations"]},   'user',    '${fmt(date(-90))}'),
      -- Sales (3)
      ('Lin Xiao',      'linxiao@company.com',     '13800001013', 'Sales Manager',          ${D["Sales"]},        'manager', '${fmt(date(-500))}'),
      ('He Qiang',      'heqiang@company.com',     '13800001014', 'Sales Representative',   ${D["Sales"]},        'user',    '${fmt(date(-90))}'),
      ('Mei Jia',       'meijia@company.com',      '13800001024', 'Account Executive',      ${D["Sales"]},        'user',    '${fmt(date(-60))}'),
      -- IT (2)
      ('Feng Yuan',     'fengyuan@company.com',    '13800001015', 'IT Manager',             ${D["IT"]},           'manager', '${fmt(date(-400))}'),
      ('Yu Lei',        'yulei@company.com',       '13800001016', 'System Engineer',        ${D["IT"]},           'user',    '${fmt(date(-100))}'),
      -- Legal (2)
      ('Qin Wei',       'qinwei@company.com',      '13800001017', 'Legal Counsel',          ${D["Legal"]},        'manager', '${fmt(date(-350))}'),
      ('Bai Xue',       'baixue@company.com',      '13800001018', 'Paralegal',              ${D["Legal"]},        'user',    '${fmt(date(-80))}'),
      -- Admin
      ('System Admin',  'admin@company.com',       '13800001000', 'System Administrator',   ${D["Engineering"]},  'admin',   '${fmt(date(-1000))}')
    RETURNING id, name
  `);
  const E: Record<string, number> = {};
  for (const r of empRes) E[r.name] = r.id;
  console.log(`   已插入 ${Object.keys(E).length} 名员工\n`);

  // ========================================================================
  // 4. 请假类型 — 5种
  // ========================================================================
  console.log("🏖️  插入请假类型...");
  const ltRes = await sql.unsafe(`
    INSERT INTO leave_types (name, description, max_days) VALUES
      ('Annual Leave',    'Paid annual vacation',              15),
      ('Sick Leave',      'Paid sick leave with medical note', 12),
      ('Personal Leave',  'Unpaid personal time off',           5),
      ('Marriage Leave',  'Marriage / civil union leave',       3),
      ('Maternity Leave', 'Maternity / family care leave',    180)
    RETURNING id, name
  `);
  const L: Record<string, number> = {};
  for (const r of ltRes) L[r.name] = r.id;
  console.log(`   已插入 ${Object.keys(L).length} 种请假类型\n`);

  // ========================================================================
  // 5. 请假申请 — 18条 (6 pending / 10 approved / 2 rejected)
  // ========================================================================
  console.log("📝 插入请假申请...");
  await sql.unsafe(`
    INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status, approved_by) VALUES
      -- pending
      (${E["Li Na"]},        ${L["Annual Leave"]},    '${fmt(date(30))}',  '${fmt(date(32))}',  'Family vacation',              'pending',  NULL),
      (${E["Chen Jie"]},     ${L["Personal Leave"]},  '${fmt(date(10))}',  '${fmt(date(11))}',  'Personal matters',             'pending',  NULL),
      (${E["Ma Tao"]},       ${L["Marriage Leave"]},  '${fmt(date(45))}',  '${fmt(date(47))}',  'Getting married',              'pending',  NULL),
      (${E["Huang Lei"]},    ${L["Personal Leave"]},  '${fmt(date(14))}',  '${fmt(date(14))}',  'Moving house',                 'pending',  NULL),
      (${E["Liu Yang"]},     ${L["Sick Leave"]},      '${fmt(date(5))}',   '${fmt(date(6))}',   'Back pain',                    'pending',  NULL),
      (${E["Guo Li"]},       ${L["Annual Leave"]},    '${fmt(date(60))}',  '${fmt(date(64))}',  'Overseas trip',                'pending',  NULL),
      -- approved (past)
      (${E["Wang Fang"]},    ${L["Sick Leave"]},      '${fmt(date(-5))}',  '${fmt(date(-3))}',  'Fever and headache',           'approved', ${E["Zhang Wei"]}),
      (${E["Sun Hao"]},      ${L["Annual Leave"]},    '${fmt(date(-20))}', '${fmt(date(-15))}', 'Travel abroad',                'approved', ${E["Zhao Min"]}),
      (${E["He Qiang"]},     ${L["Annual Leave"]},    '${fmt(date(-10))}', '${fmt(date(-8))}',  'Short break',                  'approved', ${E["Lin Xiao"]}),
      (${E["Zhao Min"]},     ${L["Annual Leave"]},    '${fmt(date(-30))}', '${fmt(date(-25))}', 'Annual family trip',           'approved', ${E["System Admin"]}),
      (${E["Peng Lin"]},     ${L["Annual Leave"]},    '${fmt(date(-40))}', '${fmt(date(-38))}', 'Wedding anniversary',          'approved', ${E["Zhao Min"]}),
      (${E["Deng Xin"]},     ${L["Sick Leave"]},      '${fmt(date(-15))}', '${fmt(date(-14))}', 'Dental surgery',               'approved', ${E["Zhou Lin"]}),
      (${E["Xiang Bo"]},     ${L["Annual Leave"]},    '${fmt(date(-50))}', '${fmt(date(-45))}', 'Family reunion',               'approved', ${E["Liu Yang"]}),
      (${E["Mei Jia"]},      ${L["Personal Leave"]},  '${fmt(date(-8))}',  '${fmt(date(-8))}',  'Visa appointment',             'approved', ${E["Lin Xiao"]}),
      (${E["Yu Lei"]},       ${L["Annual Leave"]},    '${fmt(date(-35))}', '${fmt(date(-30))}', 'Hiking trip',                  'approved', ${E["Feng Yuan"]}),
      (${E["Bai Xue"]},      ${L["Maternity Leave"]}, '${fmt(date(-60))}', '${fmt(date(-1))}',  'Maternity leave',              'approved', ${E["Qin Wei"]}),
      -- rejected
      (${E["Wu Yu"]},        ${L["Sick Leave"]},      '${fmt(date(-2))}',  '${fmt(date(0))}',   'Stomach flu (no doctor note)', 'rejected', ${E["Zhou Lin"]}),
      (${E["Yu Lei"]},       ${L["Annual Leave"]},    '${fmt(date(-3))}',  '${fmt(date(-1))}',  'Last-minute request',          'rejected', ${E["Feng Yuan"]})
  `);
  console.log("   已插入 18 条请假申请 (6 pending / 10 approved / 2 rejected)\n");

  // ========================================================================
  // 6. 资产 — 24件
  //    类型: Laptop(7)、Monitor(4)、Phone(4)、Furniture(3)、Printer(2)、
  //          Network(2)、Server(1)、Tablet(1)
  //    状态: in_use(17)、available(5)、maintenance(2)
  // ========================================================================
  console.log("💻 插入资产...");
  await sql.unsafe(`
    INSERT INTO assets (name, type, serial_number, status, assigned_to, purchase_date) VALUES
      -- Laptops (7)
      ('MacBook Pro 16 M3',       'Laptop',    'SN-MBP-2024-001', 'in_use',      ${E["Zhang Wei"]},     '${fmt(date(-600))}'),
      ('Dell XPS 15',             'Laptop',    'SN-DELL-2024-001', 'in_use',     ${E["Li Na"]},         '${fmt(date(-400))}'),
      ('ThinkPad X1 Carbon Gen11','Laptop',    'SN-TP-2024-001',  'in_use',      ${E["Wang Fang"]},     '${fmt(date(-300))}'),
      ('MacBook Air M3',          'Laptop',    'SN-MBA-2024-001', 'in_use',      ${E["Zhao Min"]},      '${fmt(date(-350))}'),
      ('HP EliteBook 840 G10',    'Laptop',    'SN-HP-2024-001',  'in_use',      ${E["Wu Yu"]},         '${fmt(date(-180))}'),
      ('Framework Laptop 16',     'Laptop',    'SN-FW-2024-001',  'in_use',      ${E["Feng Yuan"]},     '${fmt(date(-200))}'),
      ('MacBook Pro 14 M3',       'Laptop',    'SN-MBP-2024-002', 'maintenance', NULL,                  '${fmt(date(-500))}'),
      -- Monitors (4)
      ('Dell UltraSharp U2723QE', 'Monitor',   'SN-MON-2024-001', 'in_use',      ${E["Chen Jie"]},      '${fmt(date(-500))}'),
      ('LG 32UN880 4K Ergo',      'Monitor',   'SN-MON-2024-002', 'in_use',      ${E["Sun Hao"]},       '${fmt(date(-250))}'),
      ('Apple Studio Display',    'Monitor',   'SN-MON-2024-003', 'in_use',      ${E["Qin Wei"]},       '${fmt(date(-100))}'),
      ('Samsung M8 32 Smart',     'Monitor',   'SN-MON-2024-004', 'available',   NULL,                  '${fmt(date(-80))}'),
      -- Phones (4)
      ('iPhone 15 Pro',           'Phone',     'SN-IP-2024-001',  'in_use',      ${E["Lin Xiao"]},      '${fmt(date(-90))}'),
      ('Samsung Galaxy S24 Ultra','Phone',     'SN-SG-2024-001',  'in_use',      ${E["He Qiang"]},      '${fmt(date(-60))}'),
      ('Google Pixel 8 Pro',      'Phone',     'SN-GP-2024-001',  'in_use',      ${E["Mei Jia"]},       '${fmt(date(-50))}'),
      ('iPhone 15 Pro',           'Phone',     'SN-IP-2024-002',  'available',   NULL,                  '${fmt(date(-30))}'),
      -- Furniture (3)
      ('Herman Miller Aeron Chair','Furniture','SN-FUR-2024-001', 'in_use',      ${E["Zhou Lin"]},      '${fmt(date(-700))}'),
      ('Fully Jarvis Standing Desk','Furniture','SN-FUR-2024-002','in_use',      ${E["Xu Jing"]},       '${fmt(date(-600))}'),
      ('Steelcase Gesture Chair',  'Furniture','SN-FUR-2024-003', 'available',   NULL,                  '${fmt(date(-400))}'),
      -- Printers (2)
      ('HP LaserJet Pro M404dn',  'Printer',   'SN-HP-2024-001',  'in_use',      ${E["Liu Yang"]},      '${fmt(date(-400))}'),
      ('Brother MFC-L8900CDW',    'Printer',   'SN-BR-2024-001',  'maintenance', NULL,                  '${fmt(date(-350))}'),
      -- Network (2)
      ('Cisco Catalyst 9200',     'Network',   'SN-CS-2024-001',  'in_use',      ${E["Yu Lei"]},        '${fmt(date(-300))}'),
      ('Ubiquiti Dream Machine Pro','Network', 'SN-UD-2024-001',  'in_use',      ${E["Feng Yuan"]},     '${fmt(date(-200))}'),
      -- Server / Tablet
      ('Dell PowerEdge R750',     'Server',    'SN-PE-2024-001',  'in_use',      ${E["Yu Lei"]},        '${fmt(date(-350))}'),
      ('iPad Pro 12.9 M2',        'Tablet',    'SN-IPD-2024-001', 'available',   NULL,                  '${fmt(date(-150))}')
  `);
  console.log("   已插入 24 件资产 (17 in_use / 5 available / 2 maintenance)\n");

  // ========================================================================
  // 7. 薪资 — 72条 (24人 × 3个月)
  //    本月 draft + 上月 paid + 上上月 paid = 24 draft + 48 paid
  // ========================================================================
  console.log("💰 插入薪资记录...");
  const cy = new Date().getFullYear();
  const cm = new Date().getMonth() + 1;

  // 每个人的薪资基准 (月薪 * 100 为分，实际存整数)
  const payroll = [
    { name: "Zhang Wei",    base: 42000, bonus: 6000,  deduct: 3500 },
    { name: "Li Na",        base: 28000, bonus: 3500,  deduct: 2200 },
    { name: "Wang Fang",    base: 22000, bonus: 2500,  deduct: 1600 },
    { name: "Chen Jie",     base: 20000, bonus: 2000,  deduct: 1400 },
    { name: "Zhao Min",     base: 32000, bonus: 4500,  deduct: 2800 },
    { name: "Sun Hao",      base: 17000, bonus: 1200,  deduct: 900  },
    { name: "Peng Lin",     base: 15000, bonus: 1000,  deduct: 700  },
    { name: "Zhou Lin",     base: 35000, bonus: 5000,  deduct: 3200 },
    { name: "Wu Yu",        base: 18000, bonus: 1500,  deduct: 1100 },
    { name: "Deng Xin",     base: 20000, bonus: 1800,  deduct: 1300 },
    { name: "Xu Jing",      base: 36000, bonus: 5000,  deduct: 3300 },
    { name: "Ma Tao",       base: 16000, bonus: 1000,  deduct: 800  },
    { name: "Guo Li",       base: 14000, bonus: 800,   deduct: 600  },
    { name: "Liu Yang",     base: 30000, bonus: 4000,  deduct: 2500 },
    { name: "Huang Lei",    base: 19000, bonus: 1600,  deduct: 1200 },
    { name: "Xiang Bo",     base: 15000, bonus: 1000,  deduct: 700  },
    { name: "Lin Xiao",     base: 31000, bonus: 6000,  deduct: 3000 },
    { name: "He Qiang",     base: 15000, bonus: 2500,  deduct: 1000 },
    { name: "Mei Jia",      base: 18000, bonus: 3000,  deduct: 1200 },
    { name: "Feng Yuan",    base: 28000, bonus: 3500,  deduct: 2200 },
    { name: "Yu Lei",       base: 22000, bonus: 2000,  deduct: 1500 },
    { name: "Qin Wei",      base: 35000, bonus: 4000,  deduct: 3000 },
    { name: "Bai Xue",      base: 16000, bonus: 1500,  deduct: 900  },
    { name: "System Admin", base: 45000, bonus: 7000,  deduct: 4000 },
  ];

  const months = [
    { month: cm, year: cy, status: "draft", paid: null, label: "current" },
    { month: cm === 1 ? 12 : cm - 1, year: cm === 1 ? cy - 1 : cy, status: "paid", paid: fmt(date(-15)), label: "last" },
    { month: cm <= 2 ? cm + 10 : cm - 2, year: cm <= 2 ? cy - 1 : cy, status: "paid", paid: fmt(date(-45)), label: "2mo ago" },
  ];

  let salaryCount = 0;
  for (const p of payroll) {
    for (const m of months) {
      const bonus = m.status === "paid" ? Math.round(p.bonus * (0.85 + Math.random() * 0.25)) : p.bonus;
      const actual = p.base + bonus - p.deduct;
      await sql.unsafe(`
        INSERT INTO salaries (employee_id, pay_period, base_salary, bonus, deductions, actual_payment, status, paid_date, remarks)
        VALUES (
          ${E[p.name]}, '${period(m.year, m.month)}',
          ${p.base}, ${bonus}, ${p.deduct}, ${actual},
          '${m.status}',
          ${m.paid ? `'${m.paid}'` : "NULL"},
          ${m.status === "paid" ? "'Paid on time'" : "NULL"}
        )
      `);
      salaryCount++;
    }
  }
  console.log(`   已插入 ${salaryCount} 条薪资记录 (24 draft + 48 paid)\n`);

  // ========================================================================
  // 8. 绩效考核 — 20条
  //    覆盖三个周期 (2024-Q2, 2024-Q3, 2024-Q4)，混合状态
  // ========================================================================
  console.log("📊 插入绩效考核...");

  const reviews = [
    // 2024-Q3 — completed
    { emp: "Li Na",      cycle: "2024-Q3", s: 88, m: 92, o: 90, st: "completed", cats: '{"work_quality":90,"efficiency":88,"teamwork":85,"innovation":90,"attendance":95}', c: "Excellent output and mentorship" },
    { emp: "Wang Fang",  cycle: "2024-Q3", s: 82, m: 80, o: 81, st: "completed", cats: '{"work_quality":85,"efficiency":78,"teamwork":82,"innovation":80,"attendance":88}', c: "Solid frontend contributions" },
    { emp: "Sun Hao",    cycle: "2024-Q3", s: 70, m: 75, o: 73, st: "completed", cats: '{"work_quality":72,"efficiency":68,"teamwork":75,"innovation":70,"attendance":85}', c: "Needs efficiency improvement" },
    { emp: "Wu Yu",      cycle: "2024-Q3", s: 85, m: 88, o: 87, st: "completed", cats: '{"work_quality":88,"efficiency":84,"teamwork":86,"innovation":82,"attendance":95}', c: "Very reliable work" },
    { emp: "He Qiang",   cycle: "2024-Q3", s: 65, m: 70, o: 68, st: "completed", cats: '{"work_quality":68,"efficiency":62,"teamwork":70,"innovation":60,"attendance":80}', c: "New employee, improving" },
    { emp: "Yu Lei",     cycle: "2024-Q3", s: 80, m: 83, o: 82, st: "completed", cats: '{"work_quality":82,"efficiency":80,"teamwork":78,"innovation":76,"attendance":92}', c: "Good system maintenance" },
    { emp: "Deng Xin",   cycle: "2024-Q3", s: 76, m: 79, o: 78, st: "completed", cats: '{"work_quality":78,"efficiency":75,"teamwork":78,"innovation":72,"attendance":88}', c: "Accurate financial reports" },
    { emp: "Peng Lin",   cycle: "2024-Q3", s: 72, m: 74, o: 73, st: "completed", cats: '{"work_quality":75,"efficiency":70,"teamwork":74,"innovation":72,"attendance":85}', c: "SEO improvements seen" },
    // 2024-Q3 — self_review (waiting for manager)
    { emp: "Chen Jie",   cycle: "2024-Q3", s: 75, m: 0, o: 0, st: "self_review", cats: '{"work_quality":75,"efficiency":70,"teamwork":80,"innovation":72,"attendance":78}', c: "Self review done, waiting" },
    { emp: "Huang Lei",  cycle: "2024-Q3", s: 78, m: 0, o: 0, st: "self_review", cats: '{"work_quality":80,"efficiency":76,"teamwork":78,"innovation":74,"attendance":82}', c: "Self evaluation submitted" },
    { emp: "Xiang Bo",   cycle: "2024-Q3", s: 70, m: 0, o: 0, st: "self_review", cats: '{"work_quality":72,"efficiency":68,"teamwork":70,"innovation":66,"attendance":80}', c: "Waiting for review" },
    // 2024-Q3 — draft (not started)
    { emp: "Ma Tao",     cycle: "2024-Q3", s: 0, m: 0, o: 0, st: "draft", cats: '{}', c: null },
    { emp: "Guo Li",     cycle: "2024-Q3", s: 0, m: 0, o: 0, st: "draft", cats: '{}', c: null },
    { emp: "Mei Jia",    cycle: "2024-Q3", s: 0, m: 0, o: 0, st: "draft", cats: '{}', c: null },
    // 2024-Q2 — completed
    { emp: "Li Na",      cycle: "2024-Q2", s: 86, m: 90, o: 88, st: "completed", cats: '{"work_quality":88,"efficiency":84,"teamwork":86,"innovation":88,"attendance":92}', c: "Led 3 key projects" },
    { emp: "Zhao Min",   cycle: "2024-Q2", s: 80, m: 85, o: 83, st: "completed", cats: '{"work_quality":82,"efficiency":78,"teamwork":84,"innovation":80,"attendance":90}', c: "Great campaign results" },
    { emp: "Zhou Lin",   cycle: "2024-Q2", s: 90, m: 92, o: 91, st: "completed", cats: '{"work_quality":92,"efficiency":90,"teamwork":88,"innovation":86,"attendance":96}', c: "Outstanding quarter close" },
    { emp: "Xu Jing",    cycle: "2024-Q2", s: 88, m: 90, o: 89, st: "completed", cats: '{"work_quality":90,"efficiency":86,"teamwork":92,"innovation":84,"attendance":94}', c: "Great talent retention" },
    // 2024-Q4 — completed (newest)
    { emp: "Liu Yang",   cycle: "2024-Q4", s: 75, m: 78, o: 77, st: "completed", cats: '{"work_quality":78,"efficiency":74,"teamwork":76,"innovation":72,"attendance":88}', c: "Steady operations" },
    { emp: "Zhang Wei",  cycle: "2024-Q4", s: 92, m: 94, o: 93, st: "completed", cats: '{"work_quality":94,"efficiency":92,"teamwork":90,"innovation":94,"attendance":96}', c: "Exceptional engineering leadership" },
  ];

  for (const r of reviews) {
    await sql.unsafe(`
      INSERT INTO performance_reviews (employee_id, cycle, categories, overall_score, self_score, manager_score, status, comments)
      VALUES (
        ${E[r.emp]}, '${r.cycle}',
        '${r.cats}'::jsonb,
        ${r.o}, ${r.s}, ${r.m},
        '${r.st}',
        ${r.c ? `'${r.c.replace(/'/g, "''")}'` : "NULL"}
      )
    `);
  }
  console.log("   已插入 20 条绩效考核 (3 draft / 3 self_review / 14 completed)\n");

  // ========================================================================
  // 9. 审计日志 — 25条
  // ========================================================================
  console.log("📜 插入审计日志...");
  const audit = [
    ["System Admin","create","department",D["Engineering"],'{"name":"Engineering"}'],
    ["System Admin","create","department",D["Marketing"],'{"name":"Marketing"}'],
    ["System Admin","create","employee",E["Zhang Wei"],'{"name":"Zhang Wei","position":"Engineering Director"}'],
    ["System Admin","create","employee",E["Li Na"],'{"name":"Li Na","position":"Senior Developer"}'],
    ["System Admin","create","employee",E["Zhao Min"],'{"name":"Zhao Min","position":"Marketing Manager"}'],
    ["Zhang Wei","approve","leave_request",2,'{"status":"approved"}'],
    ["Zhao Min","approve","leave_request",4,'{"status":"approved"}'],
    ["Zhou Lin","reject","leave_request",17,'{"status":"rejected","reason":"No doctor note"}'],
    ["Feng Yuan","reject","leave_request",18,'{"status":"rejected","reason":"Last minute"}'],
    ["System Admin","create","asset",1,'{"name":"MacBook Pro 16 M3","type":"Laptop"}'],
    ["System Admin","update","asset",7,'{"status":"maintenance"}'],
    ["System Admin","create","salary",1,'{"pay_period":"2025-08","employee":"Zhang Wei"}'],
    ["System Admin","approve","salary",25,'{"action":"pay","pay_period":"2025-07"}'],
    ["Zhang Wei","approve","performance_review",9,'{"action":"manager_review","score":92}'],
    ["Zhao Min","approve","performance_review",16,'{"action":"manager_review","score":85}'],
    ["Zhou Lin","approve","performance_review",17,'{"action":"manager_review","score":92}'],
    ["Xu Jing","approve","performance_review",18,'{"action":"manager_review","score":90}'],
    ["Liu Yang","approve","performance_review",19,'{"action":"manager_review","score":78}'],
    ["Zhang Wei","approve","performance_review",20,'{"action":"manager_review","score":94}'],
    ["Lin Xiao","approve","leave_request",10,'{"status":"approved"}'],
    ["Zhao Min","approve","leave_request",11,'{"status":"approved"}'],
    ["System Admin","create","employee",E["Peng Lin"],'{"name":"Peng Lin"}'],
    ["System Admin","create","role",1,'{"name":"admin","permissions":["all"]}'],
    ["Feng Yuan","update","asset",22,'{"assigned_to":"Yu Lei"}'],
    ["Zhou Lin","approve","leave_request",12,'{"status":"approved"}'],
  ];

  for (const entry of audit) {
    const [user, action, entity, entityId, details] = entry as [string, string, string, number, string];
    await sql.unsafe(`
      INSERT INTO audit_logs ("user", action, entity, entity_id, details)
      VALUES ('${user}', '${action}', '${entity}', ${entityId}, '${details.replace(/'/g, "''")}'::jsonb)
    `);
  }
  console.log("   已插入 25 条审计日志\n");

  // ========================================================================
  // 统计
  // ========================================================================
  const stats = await sql.unsafe(`
    SELECT
      (SELECT COUNT(*) FROM departments)        d,
      (SELECT COUNT(*) FROM roles)              r,
      (SELECT COUNT(*) FROM employees)          e,
      (SELECT COUNT(*) FROM leave_types)        lt,
      (SELECT COUNT(*) FROM leave_requests)     lr,
      (SELECT COUNT(*) FROM assets)             a,
      (SELECT COUNT(*) FROM salaries)           s,
      (SELECT COUNT(*) FROM performance_reviews) p,
      (SELECT COUNT(*) FROM audit_logs)         al
  `);
  const c = stats[0];
  const items: [string, number][] = [
    ["部门",       Number(c.d)],
    ["角色",       Number(c.r)],
    ["员工",       Number(c.e)],
    ["请假类型",    Number(c.lt)],
    ["请假申请",    Number(c.lr)],
    ["资产",       Number(c.a)],
    ["薪资记录",    Number(c.s)],
    ["绩效考核",    Number(c.p)],
    ["审计日志",    Number(c.al)],
  ];
  const total = items.reduce((s, [, n]) => s + (n as number), 0);

  console.log("==================================================");
  console.log("✅ 数据初始化完成！");
  console.log("==================================================");
  for (const [label, n] of items) {
    console.log(`   ${label.padEnd(10, " ")} ${n}`);
  }
  console.log(`   ${"总计".padEnd(10, " ")} ${total} 条记录`);
  console.log("==================================================\n");

  await sql.end();
}

main().catch((err) => {
  console.error("❌ 初始化失败:", err);
  process.exit(1);
});
