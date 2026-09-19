"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ListChecks,
  Calendar,
  IndianRupee,
  X,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

interface Project {
  id: number;
  title: string;
  status: string;
}

interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  amount: number | null;
  due_date: string | null;
  progress: number;
  status: "pending" | "in_progress" | "completed";
}

export default function ClientMilestonesPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<number | null>(null);

  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingMilestones, setLoadingMilestones] =
    useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingMilestone, setEditingMilestone] =
    useState<Milestone | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    due_date: "",
  });

  const [saving, setSaving] = useState(false);

  // ============================================
  // GET LOGGED-IN USER
  // ============================================

  const getUser = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user:", error);
      return null;
    }
  };

  // ============================================
  // LOAD CLIENT PROJECTS
  // ============================================

  const fetchProjects = async () => {
    try {
      const user = getUser();

      if (!user?.id) {
        return;
      }

      setLoadingProjects(true);

      const response = await fetch(
        `http://localhost:5000/api/projects/client/${user.id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load projects."
        );
      }

      const loadedProjects: Project[] =
        data.projects || [];

      setProjects(loadedProjects);

      // Automatically select first project
      if (loadedProjects.length > 0) {
        setSelectedProject((currentProject) => {
          const projectStillExists = loadedProjects.some(
            (project) => project.id === currentProject
          );

          if (projectStillExists) {
            return currentProject;
          }

          return loadedProjects[0].id;
        });
      } else {
        setSelectedProject(null);
        setMilestones([]);
      }
    } catch (error) {
      console.error("FETCH PROJECTS ERROR:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  // ============================================
  // LOAD MILESTONES
  // ============================================

  const fetchMilestones = async (projectId: number) => {
    try {
      setLoadingMilestones(true);

      const response = await fetch(
        `http://localhost:5000/api/milestones/project/${projectId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load milestones."
        );
      }

      setMilestones(data.milestones || []);
    } catch (error) {
      console.error(
        "FETCH MILESTONES ERROR:",
        error
      );

      setMilestones([]);
    } finally {
      setLoadingMilestones(false);
    }
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    fetchProjects();
  }, []);

  // ============================================
  // LOAD MILESTONES WHEN PROJECT CHANGES
  // ============================================

  useEffect(() => {
    if (!selectedProject) {
      setMilestones([]);
      return;
    }

    fetchMilestones(selectedProject);
  }, [selectedProject]);

  // ============================================
  // REFRESH PAGE DATA
  // ============================================

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);

      await fetchProjects();

      // Fetch milestones for currently selected project
      if (selectedProject) {
        await fetchMilestones(selectedProject);
      }
    } catch (error) {
      console.error("REFRESH ERROR:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================
  // OPEN CREATE MODAL
  // ============================================

  const openCreateModal = () => {
    setEditingMilestone(null);

    setFormData({
      title: "",
      description: "",
      amount: "",
      due_date: "",
    });

    setShowModal(true);
  };

  // ============================================
  // OPEN EDIT MODAL
  // ============================================

  const openEditModal = (milestone: Milestone) => {
    setEditingMilestone(milestone);

    setFormData({
      title: milestone.title || "",
      description: milestone.description || "",
      amount:
        milestone.amount !== null
          ? String(milestone.amount)
          : "",
      due_date: milestone.due_date
        ? milestone.due_date.split("T")[0]
        : "",
    });

    setShowModal(true);
  };

  // ============================================
  // CLOSE MODAL
  // ============================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingMilestone(null);
  };

  // ============================================
  // FORM CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================
  // CREATE / UPDATE MILESTONE
  // ============================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!selectedProject) {
      alert("Please select a project.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Milestone title is required.");
      return;
    }

    if (
      formData.amount &&
      Number(formData.amount) < 0
    ) {
      alert("Amount cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      let url =
        "http://localhost:5000/api/milestones";

      let method = "POST";

      let body: Record<string, unknown> = {
        project_id: selectedProject,
        title: formData.title.trim(),
        description:
          formData.description.trim() || null,
        amount: formData.amount
          ? Number(formData.amount)
          : null,
        due_date: formData.due_date || null,
      };

      // UPDATE
      if (editingMilestone) {
        url = `http://localhost:5000/api/milestones/${editingMilestone.id}`;
        method = "PUT";

        body = {
          title: formData.title.trim(),
          description:
            formData.description.trim() || null,
          amount: formData.amount
            ? Number(formData.amount)
            : null,
          due_date: formData.due_date || null,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to save milestone."
        );
      }

      setShowModal(false);
      setEditingMilestone(null);

      setFormData({
        title: "",
        description: "",
        amount: "",
        due_date: "",
      });

      await fetchMilestones(selectedProject);

      alert(
        editingMilestone
          ? "Milestone updated successfully."
          : "Milestone created successfully."
      );
    } catch (error) {
      console.error(
        "SAVE MILESTONE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE MILESTONE
  // ============================================

  const handleDelete = async (
    milestoneId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this milestone?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/milestones/${milestoneId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete milestone."
        );
      }

      if (selectedProject) {
        await fetchMilestones(selectedProject);
      }

      alert("Milestone deleted successfully.");
    } catch (error) {
      console.error(
        "DELETE MILESTONE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  // ============================================
  // STATUS BADGE
  // ============================================

  const getStatusStyle = (
    status: Milestone["status"]
  ) => {
    if (status === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "in_progress") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusText = (
    status: Milestone["status"]
  ) => {
    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "completed") {
      return "Completed";
    }

    return "Pending";
  };

  // ============================================
  // LOADING PROJECTS
  // ============================================

  if (loadingProjects) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading projects...
        </p>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <ListChecks
                size={24}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Milestones
              </h1>

              <p className="text-sm text-gray-500">
                Manage milestones for your projects
              </p>
            </div>
          </div>
        </div>

        {/* HEADER BUTTONS */}

        <div className="flex flex-wrap items-center gap-2">
          {/* BACK TO DASHBOARD */}

          <button
            type="button"
            onClick={() => router.push("/client")}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-gray-700
              shadow-sm
              transition
              hover:border-emerald-500
              hover:bg-emerald-50
              hover:text-emerald-700
            "
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-gray-700
              shadow-sm
              transition
              hover:border-emerald-500
              hover:bg-emerald-50
              hover:text-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

          {/* ADD MILESTONE */}

          {selectedProject && (
            <button
              type="button"
              onClick={openCreateModal}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-emerald-700
              "
            >
              <Plus size={18} />
              Add Milestone
            </button>
          )}
        </div>
      </div>

      {/* NO PROJECTS */}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <ListChecks
              size={26}
              className="text-gray-400"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            No projects found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create a project first before adding
            milestones.
          </p>

          <Link
            href="/client/create-project"
            className="mt-5 inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <>
          {/* PROJECT SELECTOR */}

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Select Project
            </label>

            <select
              value={selectedProject ?? ""}
              onChange={(e) =>
                setSelectedProject(
                  Number(e.target.value)
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            >
              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* MILESTONE LIST */}

          {loadingMilestones ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                Loading milestones...
              </p>
            </div>
          ) : milestones.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <ListChecks
                  size={26}
                  className="text-emerald-600"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-800">
                No milestones yet
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add milestones to divide your project
                into manageable stages.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus size={17} />
                Add First Milestone
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map(
                (milestone, index) => (
                  <div
                    key={milestone.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    {/* TOP */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <h2 className="break-words text-base font-bold text-gray-900 sm:text-lg">
                            {milestone.title}
                          </h2>

                          {milestone.description && (
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          milestone.status
                        )}`}
                      >
                        {getStatusText(
                          milestone.status
                        )}
                      </span>
                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <IndianRupee
                          size={17}
                          className="text-emerald-600"
                        />

                        <span>
                          Amount:{" "}
                          <strong className="text-gray-900">
                            {milestone.amount !==
                            null
                              ? `₹${Number(
                                  milestone.amount
                                ).toLocaleString(
                                  "en-IN"
                                )}`
                              : "Not specified"}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar
                          size={17}
                          className="text-emerald-600"
                        />

                        <span>
                          Due:{" "}
                          <strong className="text-gray-900">
                            {milestone.due_date
                              ? new Date(
                                  milestone.due_date
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "Not specified"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">
                          Freelancer Progress
                        </span>

                        <span className="text-xs font-bold text-emerald-600">
                          {milestone.progress ||
                            0}
                          %
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{
                            width: `${
                              milestone.progress ||
                              0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            milestone
                          )
                        }
                        disabled={
                          milestone.status ===
                          "completed"
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-lg
                          border
                          border-gray-200
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-gray-700
                          transition
                          hover:border-emerald-500
                          hover:bg-emerald-50
                          hover:text-emerald-700
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            milestone.id
                          )
                        }
                        disabled={
                          milestone.status ===
                          "completed"
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-lg
                          border
                          border-red-200
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-red-600
                          transition
                          hover:bg-red-50
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================
          CREATE / EDIT MODAL
      ============================================ */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingMilestone
                    ? "Edit Milestone"
                    : "Create Milestone"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editingMilestone
                    ? "Update milestone details."
                    : "Add a new stage to your project."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Milestone Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. UI Design Completion"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what should be completed..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />
              </div>

              {/* AMOUNT */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Amount
                </label>

                <div className="relative">
                  <IndianRupee
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    placeholder="5000"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      py-3
                      pl-9
                      pr-4
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />
                </div>
              </div>

              {/* DUE DATE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Due Date
                </label>

                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />
              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    rounded-xl
                    border
                    border-gray-300
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    rounded-xl
                    bg-emerald-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-emerald-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving
                    ? "Saving..."
                    : editingMilestone
                    ? "Update Milestone"
                    : "Create Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
