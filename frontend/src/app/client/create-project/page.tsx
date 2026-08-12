"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [deadline, setDeadline] = useState("");

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // ADD SKILL
  // ============================================

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    if (skills.includes(skill)) {
      setSkillInput("");
      return;
    }

    setSkills([...skills, skill]);
    setSkillInput("");
  };

  // ============================================
  // REMOVE SKILL
  // ============================================

  const removeSkill = (skillToRemove: string) => {
    setSkills(
      skills.filter((skill) => skill !== skillToRemove)
    );
  };

  // ============================================
  // CREATE PROJECT
  // ============================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    // --------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------

    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim() ||
      !budget ||
      !deadline ||
      skills.length === 0
    ) {
      setError(
        "Please fill all required fields and add at least one skill."
      );
      return;
    }

    // --------------------------------------------
    // GET LOGGED-IN USER
    // --------------------------------------------

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }

    if (user.role !== "client") {
      setError("Only clients can create projects.");
      return;
    }

    // --------------------------------------------
    // SEND TO BACKEND
    // --------------------------------------------

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            budget: Number(budget),
            budget_type: budgetType,
            deadline,
            skills,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project."
        );
      }

      alert("Project created successfully!");

      router.push("/client");
    } catch (error) {
      console.error("CREATE PROJECT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() => router.push("/client")}
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-slate-600
              transition
              hover:text-slate-900
            "
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-semibold text-slate-900">
            Post a Project
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Tell freelancers what you need and find the right
            talent for your project.
          </p>

        </div>

        {/* ========================================= */}
        {/* FORM CARD */}
        {/* ========================================= */}

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* PROJECT TITLE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Project Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Build a modern business website"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Project Description *
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={6}
                placeholder="Describe the project, requirements, goals, and expected outcome..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category *
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              >
                <option value="">
                  Select a category
                </option>

                <option value="Web Development">
                  Web Development
                </option>

                <option value="Mobile Development">
                  Mobile Development
                </option>

                <option value="UI/UX Design">
                  UI/UX Design
                </option>

                <option value="Graphic Design">
                  Graphic Design
                </option>

                <option value="Content Writing">
                  Content Writing
                </option>

                <option value="Digital Marketing">
                  Digital Marketing
                </option>

                <option value="Data Entry">
                  Data Entry
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* BUDGET */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Budget *
                </label>

                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) =>
                    setBudget(e.target.value)
                  }
                  placeholder="500"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Budget Type *
                </label>

                <select
                  value={budgetType}
                  onChange={(e) =>
                    setBudgetType(e.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                >
                  <option value="fixed">
                    Fixed Price
                  </option>

                  <option value="hourly">
                    Hourly Rate
                  </option>
                </select>
              </div>

            </div>

            {/* DEADLINE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Deadline *
              </label>

              <input
                type="date"
                value={deadline}
                onChange={(e) =>
                  setDeadline(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />
            </div>

            {/* SKILLS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Required Skills *
              </label>

              <div className="flex gap-2">

                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) =>
                    setSkillInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="e.g. React"
                  className="
                    min-w-0
                    flex-1
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-slate-900
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-slate-800
                  "
                >
                  <Plus size={17} />
                  Add
                </button>

              </div>

              {/* SKILL TAGS */}

              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">

                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-emerald-50
                        px-3
                        py-1.5
                        text-sm
                        font-medium
                        text-emerald-700
                      "
                    >
                      {skill}

                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(skill)
                        }
                        className="hover:text-red-600"
                      >
                        <X size={15} />
                      </button>
                    </span>
                  ))}

                </div>
              )}

            </div>

            {/* SUBMIT */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  router.push("/client")
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  rounded-xl
                  bg-emerald-600
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Creating Project..."
                  : "Create Project"}
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}