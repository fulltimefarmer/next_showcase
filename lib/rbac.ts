/**
 * RBAC (Role-Based Access Control) 权限系统
 *
 * Next.js 中权限控制的三层机制：
 * 1. Middleware (proxy.ts) — 路由级拦截，检查是否登录
 * 2. Layout/Page — 页面级检查，通过 auth() 获取 session 后判断 role
 * 3. Server Action — 操作级检查，每个 action 内部验证权限
 */

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

/**
 * 检查用户是否拥有指定权限
 *
 * @param userPermissions 用户拥有的权限列表
 * @param required 需要的单个权限
 * @returns 是否拥有权限
 *
 * 用法（在 Server Action 中）：
 *   const session = await auth();
 *   if (!hasPermission(userPermissions, PERMISSIONS.DEPARTMENTS_WRITE)) {
 *     throw new Error("Forbidden");
 *   }
 */
export function hasPermission(
  userPermissions: string[],
  required: string
): boolean {
  return userPermissions.includes(required);
}

/**
 * 检查用户是否拥有任一权限（OR 逻辑）
 */
export function hasAnyPermission(
  userPermissions: string[],
  required: string[]
): boolean {
  return required.some((p) => userPermissions.includes(p));
}

/**
 * 检查用户是否拥有所有权限（AND 逻辑）
 */
export function hasAllPermissions(
  userPermissions: string[],
  required: string[]
): boolean {
  return required.every((p) => userPermissions.includes(p));
}
