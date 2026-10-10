
"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, FolderKanban } from "lucide-react";
import DashboardLayout from "@/app/components/layout/DashboardLayout";

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number | string;
  budget_type: string;
  deadline: string;
  status: string;
  progress: number;
  client_id: number;
  freelancer_id: number | null;
  created_at: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const API_URL = "http://localhost:5000/api/admin/projects";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in as an administrator.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        status,
        page: String(page),
        limit: "10",
      });

      const response = await fetch(
        `${API_URL}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load projects."
        );
      }

      setProjects(data.projects);
      setPagination(data.pagination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatus(event.target.value);
    setPage(1);
  };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                <FolderKanban className="text-emerald-600" size={30} />
                Manage Projects
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Review and monitor projects across FreelanceShield.
              </p>
            </div>

            <button
              onClick={fetchProjects}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {pagination.total}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Open Projects</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {projects.filter((p) => p.status === "open").length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">In Progress (current page)</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {projects.filter((p) => p.status === "in_progress").length}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                value={search}
                onChange={handleSearch}
                placeholder="Search by title, description, category or ID..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={status}
              onChange={handleStatusChange}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Project",
                      "Client ID",
                      "Freelancer ID",
                      "Budget",
                      "Deadline",
                      "Status",
                      "Progress",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        Loading projects...
                      </td>
                    </tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        No projects found.
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="max-w-xs px-5 py-4">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {project.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            #{project.id}
                            {project.category
                              ? ` · ${project.category}`
                              : ""}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {project.client_id}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {project.freelancer_id ?? "Unassigned"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-800">
                          ₹{Number(project.budget).toLocaleString("en-IN")}
                          <span className="ml-1 text-xs font-normal text-gray-500">
                            {project.budget_type}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {(() => {
  if (!project.deadline) return "—";

  const date = new Date(project.deadline);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN");
})()}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              project.status === "open"
                                ? "bg-emerald-100 text-emerald-700"
                                : project.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : project.status === "completed"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {project.status.replaceAll("_", " ")}
                          </span>
                        </td>

                        <td className="min-w-32 px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, project.progress)
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {project.progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                {pagination.total === 0
                  ? "No projects"
                  : `Showing ${(page - 1) * pagination.limit + 1}–${Math.min(
                      page * pagination.limit,
                      pagination.total
                    )} of ${pagination.total} projects`}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => current - 1)}
                  disabled={loading || page <= 1}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 text-sm text-gray-600">
                  Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                </span>
                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={
                    loading || page >= pagination.totalPages
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
