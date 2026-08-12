// ============================================================================
// 【Next.js 知识点】多步骤工作流 — 绩效考核
// ============================================================================
// 1. 绩效考核是更复杂的工作流状态机: draft → self_review → completed
//    - draft: 初始状态，等待员工自评
//    - self_review: 员工已完成自评，等待主管评分
//    - completed: 主管已评分，考核归档
// 2. JSONB 字段存储多维度评分数据，避免为每个维度建表列
//    - 新增考核维度只需改 DIMENSIONS 常量，无需改 database schema
// 3. Context-sensitive 按钮: 不同状态下显示不同操作
//    - draft → "Self Review" 按钮
//    - self_review → "Manager Review" 按钮
//    - completed → "View" 按钮(只读)
// ============================================================================

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2, X, TrendingUp, Star, UserCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  getReviews,
  createReview,
  submitSelfReview,
  submitManagerReview,
  deleteReview,
} from "./actions";
import type { getEmployees } from "../employees/actions";

const DIMENSIONS = [
  { key: "work_quality", label: "Work Quality", desc: "Accuracy and completeness of deliverables" },
  { key: "efficiency", label: "Efficiency", desc: "Speed and productivity" },
  { key: "teamwork", label: "Teamwork", desc: "Collaboration with colleagues" },
  { key: "innovation", label: "Innovation", desc: "Creative problem solving" },
  { key: "attendance", label: "Attendance", desc: "Punctuality and time management" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-50 text-slate-600 ring-slate-600/20" },
  self_review: { label: "Self-reviewed", className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  manager_review: { label: "In Review", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
};

type Review = Awaited<ReturnType<typeof getReviews>>[number];
type Employee = Awaited<ReturnType<typeof getEmployees>>[number];

const createFormSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  cycle: z.string().min(1, "Cycle is required"),
});

type CreateFormValues = z.infer<typeof createFormSchema>;

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-50 text-emerald-700"
      : score >= 60
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {score}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: typeof TrendingUp;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`size-4 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function PerformanceList({
  initialData,
  employees,
}: {
  initialData: Review[];
  employees: Employee[];
}) {
  const [data, setData] = useState(initialData);
  const [showCreate, setShowCreate] = useState(false);
  const [reviewing, setReviewing] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<Review | null>(null);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { employeeId: "", cycle: "" },
  });

  function openReview(review: Review) {
    const cats = (review.categories as Record<string, number>) || {};
    const initial: Record<string, number> = {};
    for (const d of DIMENSIONS) {
      initial[d.key] = cats[d.key] ?? 0;
    }
    setScores(initial);
    setComments(review.comments ?? "");
    setReviewing(review);
  }

  function closeReview() {
    setReviewing(null);
    setScores({});
    setComments("");
  }

  async function onCreate(values: CreateFormValues) {
    try {
      await createReview({
        employeeId: parseInt(values.employeeId, 10),
        cycle: values.cycle,
        categories: {},
      });
      toast.success("Review created");
      setShowCreate(false);
      createForm.reset();
      const fresh = await getReviews();
      setData(fresh);
    } catch {
      toast.error("Failed to create review");
    }
  }

  async function onSelfReview() {
    if (!reviewing) return;
    const total = DIMENSIONS.reduce((s, d) => s + (scores[d.key] ?? 0), 0);
    const selfScore = Math.round(total / DIMENSIONS.length);
    const categories = { ...scores };
    try {
      await submitSelfReview(reviewing.id, { selfScore, categories, comments });
      toast.success("Self review submitted");
      closeReview();
      const fresh = await getReviews();
      setData(fresh);
    } catch {
      toast.error("Failed to submit self review");
    }
  }

  async function onManagerReview() {
    if (!reviewing) return;
    const total = DIMENSIONS.reduce((s, d) => s + (scores[d.key] ?? 0), 0);
    const managerScore = Math.round(total / DIMENSIONS.length);
    const overallScore = managerScore;
    const categories = { ...scores };
    try {
      await submitManagerReview(reviewing.id, { managerScore, categories, overallScore, comments });
      toast.success("Manager review submitted");
      closeReview();
      const fresh = await getReviews();
      setData(fresh);
    } catch {
      toast.error("Failed to submit manager review");
    }
  }

  async function onDelete() {
    if (!deleting) return;
    try {
      await deleteReview(deleting.id);
      toast.success("Review deleted");
      setDeleting(null);
      const fresh = await getReviews();
      setData(fresh);
    } catch {
      toast.error("Failed to delete review");
    }
  }

  const draftCount = data.filter((r) => r.status === "draft").length;
  const selfReviewCount = data.filter((r) => r.status === "self_review").length;
  const completedCount = data.filter((r) => r.status === "completed").length;
  const scoredReviews = data.filter((r) => r.overallScore > 0);
  const avgScore =
    scoredReviews.length > 0
      ? `${Math.round(scoredReviews.reduce((s, r) => s + r.overallScore, 0) / scoredReviews.length)}/100`
      : "—";

  const isViewMode = reviewing?.status === "completed";

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Performance Reviews</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="size-4" />
          New Review
        </button>
      </div>

      {data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Draft"
            value={draftCount}
            icon={FileText}
            color="text-slate-500"
            bg="bg-slate-100"
          />
          <StatCard
            label="Self-reviewed"
            value={selfReviewCount}
            icon={UserCheck}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Completed"
            value={completedCount}
            icon={Star}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            label="Avg Overall Score"
            value={avgScore}
            icon={TrendingUp}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        {data.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No reviews found. Click &quot;New Review&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Cycle</th>
                <th className="px-4 py-3">Self Score</th>
                <th className="px-4 py-3">Manager Score</th>
                <th className="px-4 py-3">Overall Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-48 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((review) => {
                const status = statusMap[review.status] ?? statusMap.draft;
                const actionButtons = (() => {
                  const buttons: React.ReactNode[] = [];
                  if (review.status === "draft") {
                    buttons.push(
                      <button
                        key="self"
                        onClick={() => openReview(review)}
                        className="rounded px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        Self Review
                      </button>
                    );
                  } else if (review.status === "self_review") {
                    buttons.push(
                      <button
                        key="manager"
                        onClick={() => openReview(review)}
                        className="rounded px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
                      >
                        Manager Review
                      </button>
                    );
                  } else if (review.status === "completed") {
                    buttons.push(
                      <button
                        key="view"
                        onClick={() => openReview(review)}
                        className="rounded px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        View
                      </button>
                    );
                  }
                  buttons.push(
                    <button
                      key="delete"
                      onClick={() => setDeleting(review)}
                      className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  );
                  return buttons;
                })();

                return (
                  <tr
                    key={review.id}
                    className="border-b border-slate-100 text-sm hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {review.employeeName || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{review.cycle}</td>
                    <td className="px-4 py-3">
                      {review.selfScore > 0 ? <ScoreBadge score={review.selfScore} /> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {review.managerScore > 0 ? <ScoreBadge score={review.managerScore} /> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {review.overallScore > 0 ? <ScoreBadge score={review.overallScore} /> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actionButtons}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">New Review</h2>
              <button
                onClick={() => {
                  setShowCreate(false);
                  createForm.reset();
                }}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Employee
                </label>
                <select
                  {...createForm.register("employeeId")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {createForm.formState.errors.employeeId && (
                  <p className="mt-1 text-xs text-red-500">
                    {createForm.formState.errors.employeeId.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Review Cycle
                </label>
                <input
                  {...createForm.register("cycle")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 2024-Q3"
                />
                {createForm.formState.errors.cycle && (
                  <p className="mt-1 text-xs text-red-500">
                    {createForm.formState.errors.cycle.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    createForm.reset();
                  }}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createForm.formState.isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {isViewMode
                  ? "View Review"
                  : reviewing.status === "draft"
                    ? "Self Review"
                    : "Manager Review"}
              </h2>
              <button
                onClick={closeReview}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-5">
              {DIMENSIONS.map((d) => (
                <div key={d.key}>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      {d.label}
                    </label>
                    <span className="text-sm font-semibold text-slate-900">
                      {scores[d.key] ?? 0}
                    </span>
                  </div>
                  <p className="mb-2 text-xs text-slate-400">{d.desc}</p>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={scores[d.key] ?? 0}
                    disabled={isViewMode}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [d.key]: parseInt(e.target.value, 10) }))
                    }
                    className="w-full"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Comments
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  disabled={isViewMode}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Optional comments"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeReview}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {isViewMode ? "Close" : "Cancel"}
                </button>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={
                      reviewing.status === "draft" ? onSelfReview : onManagerReview
                    }
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Delete Review
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
