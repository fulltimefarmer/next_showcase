#!/usr/bin/env bash
#
# init.sh — 一键初始化整个项目
#
# 步骤：
#   0. 预检（node / pnpm / psql / PostgreSQL 是否就绪）
#   1. 安装依赖
#   2. 清理构建产物
#   3. 重新编译整个项目
#   4. 删除数据库
#   5. 重建数据库
#   6. 初始化 schema + 种子数据
#
set -euo pipefail

# ── 输出工具 ────────────────────────────────────────────────────────────────
info() { printf '\033[1;34m[init]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m[init]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[init]\033[0m %s\n' "$*" >&2; exit 1; }

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ── 解析 DATABASE_URL ───────────────────────────────────────────────────────
ENV_FILE=".env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  fail "Missing $ENV_FILE. Run 'cp .env.example .env.local' and set DATABASE_URL."
fi

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs)"
if [[ -z "$DATABASE_URL" ]]; then
  fail "DATABASE_URL not found in $ENV_FILE."
fi

# postgres://user[:pass]@host:port/dbname
DB_NAME="$(printf '%s' "$DATABASE_URL" | sed -E 's#.*/([^/?]+)(\?.*)?$#\1#')"
DB_USER="$(printf '%s' "$DATABASE_URL" | sed -E 's#^.*//([^:@/]+).*$#\1#')"
DB_PASS="$(printf '%s' "$DATABASE_URL" | sed -E 's#^.*//[^:@/]+:([^@]+)@.*$#\1#')"
DB_HOST="$(printf '%s' "$DATABASE_URL" | sed -E 's#^.*@([^:/]+).*$#\1#')"
DB_PORT="$(printf '%s' "$DATABASE_URL" | sed -E 's#^.*@[^:]+:([0-9]+).*$#\1#')"

DB_USER="${DB_USER:-$(whoami)}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

[[ -z "$DB_NAME" ]] && fail "Could not parse database name from DATABASE_URL."
[[ -n "$DB_PASS" ]] && export PGPASSWORD="$DB_PASS"

info "Database: $DB_NAME (user=$DB_USER host=$DB_HOST port=$DB_PORT)"

# ── 0. 预检 ─────────────────────────────────────────────────────────────────
info "[0/6] Checking prerequisites..."
command -v node  >/dev/null 2>&1 || fail "node not found."
command -v pnpm  >/dev/null 2>&1 || fail "pnpm not found."
command -v psql  >/dev/null 2>&1 || fail "psql not found (install PostgreSQL)."

if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
  fail "PostgreSQL is not running at $DB_HOST:$DB_PORT. Start it with 'brew services start postgresql@18'."
fi

# ── 1. 安装依赖 ─────────────────────────────────────────────────────────────
info "[1/6] Installing dependencies..."
pnpm install

# ── 2. 清理构建产物 ─────────────────────────────────────────────────────────
info "[2/6] Cleaning build artifacts (.next)..."
rm -rf .next

# ── 3. 重新编译整个项目 ─────────────────────────────────────────────────────
info "[3/6] Recompiling project (pnpm build)..."
pnpm build

# ── 4. 删除数据库 ───────────────────────────────────────────────────────────
info "[4/6] Dropping database '$DB_NAME'..."
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" --if-exists "$DB_NAME" 2>/dev/null || true

# ── 5. 重建数据库 ───────────────────────────────────────────────────────────
info "[5/6] Creating database '$DB_NAME'..."
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

# ── 6. 初始化 schema + 种子数据 ─────────────────────────────────────────────
info "[6/6] Initializing schema and seed data..."
pnpm db:seed

ok "Project initialized successfully."
ok "Run 'pnpm dev' to start the development server."
