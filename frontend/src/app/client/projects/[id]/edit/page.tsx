"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  skills: string | null;
  budget: number;
  budget_type: string;
  deadline: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // FETCH PROJECT
  // ============================================

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/projects/${projectId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load project."
          );
        }

        const fetchedProject: Project = data.project;

        setProject(fetchedProject);

        setTitle(fetchedProject.title || "");
        setDescription(fetchedProject.description || "");
        setCategory(fetchedProject.category || "");
        setSkills(fetchedProject.skills || "");
        setBudget(String(fetchedProject.budget || ""));
        setBudgetType(fetchedProject.budget_type || "fixed");

        setDeadline(
          fetchedProject.deadline
            ? new Date(fetchedProject.deadline)
                .toISOString()
                .split("T")[0]
            : ""
        );
      } catch (error) {
        console.error("FETCH PROJECT ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // ============================================
  // HANDLE SUBMIT
  // ============================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            category,
            skills: skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
            budget: Number(budget),
            budget_type: budgetType,
            deadline,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update project."
        );
      }

      alert("Project updated successfully.");

      router.push("/client/projects");
    } catch (error) {
      console.error("UPDATE PROJECT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update project."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-gray-600">
            Loading project...
          </p>

        </div>
      </div>
    );
  }

  // ============================================
  // PROJECT NOT FOUND
  // ============================================

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">

        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">

          <h1 className="text-xl font-bold text-gray-900">
            Project not found
          </h1>

          <p className="mt-2 text-gray-500">
            The project you're trying to edit could not be found.
          </p>

          <button
            type="button"
            onClick={() => router.push("/client/projects")}
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Back to My Projects
          </button>

        </div>

      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <button
          type="button"
          onClick={() => router.push("/client/projects")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to My Projects
        </button>

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Edit Project
          </h1>

          <p className="mt-1 text-gray-500">
            Update the details of your project.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >

          <div className="space-y-6">

            {/* TITLE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Project Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* SKILLS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Required Skills
              </label>

              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, PostgreSQL"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separate skills using commas.
              </p>
            </div>

            {/* BUDGET */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Budget
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* BUDGET TYPE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Budget Type
                </label>

                <select
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="fixed">
                    Fixed
                  </option>

                  <option value="hourly">
                    Hourly
                  </option>
                </select>
              </div>

            </div>

            {/* DEADLINE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Deadline
              </label>

              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

          </div>

          {/* BUTTONS */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => router.push("/client/projects")}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}