// ============================================================================
// 【Next.js 知识点】RBAC (Role-Based Access Control) 工具
// ============================================================================
// 1. 权限系统在 Next.js 中的三层控制:
//    - Middleware (proxy.ts): 路由级 — 检查是否登录（最快，Edge Runtime）
//    - Page Server Component: 页面级 — auth() 获取 session 后判断 role
//    - Server Action: 操作级 — 每个 action 内部验证权限（最细粒度）
// 2. 这套工具函数在 Server Actions 中配合 auth() 使用:
//    ① auth() 获取 session → session.user.role
//    ② 从数据库查询该 role 的 permissions → 得到权限数组
//    ③ hasPermission(userPermissions, required) 做判断
// ============================================================================

/** 系统中定义的所有权限项 */
export const PERMISSIONS = {
  DEPARTMENTS_READ: "departments:read",
  DEPARTMENTS_WRITE: "departments:write",
  EMPLOYEES_READ: "employees:read",
  EMPLOYEES_WRITE: "employees:write",
  ASSETS_READ: "assets:read",
  ASSETS_WRITE: "assets:write",
  ROLES_READ: "roles:read",
  ROLES_WRITE: "roles:write",
  LEAVES_READ: "leaves:read",
  LEAVES_WRITE: "leaves:write",
  LEAVES_APPROVE: "leaves:approve",
  AUDIT_READ: "audit:read",
} as const;

/** 预置角色及其默认权限 */
export const DEFAULT_ROLES = [
  {
    name: "admin",
    description: "Super admin with full access",
    permissions: Object.values(PERMISSIONS),
  },
  {
    name: "manager",
    description: "Department manager",
    permissions: [
      PERMISSIONS.DEPARTMENTS_READ,
      PERMISSIONS.EMPLOYEES_READ,
      PERMISSIONS.ASSETS_READ,
      PERMISSIONS.ASSETS_WRITE,
      PERMISSIONS.LEAVES_READ,
      PERMISSIONS.LEAVES_APPROVE,
    ],
  },
  {
    name: "user",
    description: "Regular employee",
    permissions: [
      PERMISSIONS.DEPARTMENTS_READ,
      PERMISSIONS.EMPLOYEES_READ,
      PERMISSIONS.ASSETS_READ,
      PERMISSIONS.LEAVES_READ,
      PERMISSIONS.LEAVES_WRITE,
    ],
  },
];

export function hasPermission(
  userPermissions: string[],
  required: string
): boolean {
  return userPermissions.includes(required);
}
