"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  Clock,
  ArrowLeft,
  Search,
  Filter,
  RotateCcw,
  Tag,
  MapPin,
  X,
} from "lucide-react";

interface Project {
  id: number;
  client_id: number;
  client_user_id?: number;
  title: string;
  description: string;
  category: string;
  skills: string | null;
  budget: number;
  budget_type: string;
  deadline: string;
  status?: string;
  created_at?: string;
}

interface User {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "freelancer" | "client";
}

export default function BrowseProjectsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  // Projects stay empty until user searches
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // SEARCH / FILTER STATES
  // ============================================

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [budgetType, setBudgetType] = useState("");

  // ============================================
  // CHECK LOGGED-IN USER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "freelancer") {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error("Invalid user data:", error);

      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // ============================================
  // PAGE LOADING
  // ============================================

  useEffect(() => {
    if (!user) return;

    // Do NOT fetch projects automatically.
    // Projects appear only after searching.
    setLoading(false);
  }, [user]);

  // ============================================
  // SEARCH PROJECTS
  // ============================================

  const fetchProjects = async () => {
    try {
      setSearching(true);
      setError("");

      const params = new URLSearchParams();

      // Search text
      if (search.trim() !== "") {
        params.append("search", search.trim());
      }

      // Category
      if (category.trim() !== "") {
        params.append("category", category.trim());
      }

      // Skills
      if (skills.trim() !== "") {
        params.append("skills", skills.trim());
      }

      // Location
      if (location.trim() !== "") {
        params.append("location", location.trim());
      }

      // Budget type
      if (budgetType.trim() !== "") {
        params.append("budget_type", budgetType.trim());
      }

      // ============================================
      // DO NOT SEARCH IF EVERYTHING IS EMPTY
      // ============================================

      if (params.toString() === "") {
        setProjects([]);

        setError(
          "Please enter a search term or select at least one filter."
        );

        return;
      }

      // ============================================
      // SEARCH API
      // ============================================

      const url = `http://localhost:5000/api/projects/search?${params.toString()}`;

      const response = await fetch(url);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to search projects."
        );
      }

      setProjects(data.projects || []);
    } catch (error) {
      console.error("SEARCH PROJECTS ERROR:", error);

      setProjects([]);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to search projects."
      );
    } finally {
      setSearching(false);
    }
  };

  // ============================================
  // SEARCH BUTTON
  // ============================================

  const handleSearch = () => {
    fetchProjects();
  };

  // ============================================
  // RESET FILTERS
  // ============================================

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setSkills("");
    setLocation("");
    setBudgetType("");

    // Clear projects
    setProjects([]);

    // Clear error
    setError("");
  };

  // ============================================
  // ENTER KEY SEARCH
  // ============================================

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // ============================================
  // FORMAT SKILLS
  // ============================================

  const formatSkills = (skillsValue: string | null) => {
    if (!skillsValue) {
      return [];
    }

    // ============================================
    // TRY JSON FORMAT FIRST
    // ============================================

    try {
      const parsed = JSON.parse(skillsValue);

      if (Array.isArray(parsed)) {
        return parsed.map((skill) => String(skill).trim());
      }
    } catch {
      // Not JSON
    }

    // ============================================
    // COMMA-SEPARATED FORMAT
    // ============================================

    return skillsValue
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");
  };

  // ============================================
  // LOADING
  // ============================================

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <DashboardLayout role="freelancer">
      <div className="w-full">

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() => router.push("/freelancer")}
            className="
              mb-4
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-gray-600
              transition
              hover:text-emerald-600
            "
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Browse Projects
          </h1>

          <p className="mt-1 text-gray-500">
            Search for projects that match your skills,
            category, location, and preferred budget type.
          </p>

        </div>

        {/* ============================================
            SEARCH & FILTERS
        ============================================ */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

          {/* FILTER HEADER */}

          <div className="mb-5 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
              <Filter
                size={18}
                className="text-emerald-600"
              />
            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                Search & Filters
              </h2>

              <p className="text-xs text-gray-500">
                Enter your requirements and search for projects
              </p>

            </div>

          </div>

          {/* ============================================
              SEARCH BOX
          ============================================ */}

          <div className="relative">

            <Search
              size={19}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              placeholder="Search projects, skills, categories..."
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                py-3
                pl-10
                pr-10
                text-sm
                text-gray-900
                outline-none
                transition
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  transition
                  hover:text-gray-600
                "
              >
                <X size={18} />
              </button>
            )}

          </div>

          {/* ============================================
              FILTER GRID
          ============================================ */}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* CATEGORY */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <div className="relative">

                <Tag
                  size={17}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  type="text"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  placeholder="e.g. Web Development"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    py-3
                    pl-10
                    pr-3
                    text-sm
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

              </div>

            </div>

            {/* SKILLS */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Skills
              </label>

              <div className="relative">

                <BriefcaseBusiness
                  size={17}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  type="text"
                  value={skills}
                  onChange={(event) =>
                    setSkills(event.target.value)
                  }
                  placeholder="e.g. React"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    py-3
                    pl-10
                    pr-3
                    text-sm
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

              </div>

            </div>

            {/* LOCATION */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location
              </label>

              <div className="relative">

                <MapPin
                  size={17}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="e.g. Anand"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    py-3
                    pl-10
                    pr-3
                    text-sm
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

              </div>

            </div>

            {/* BUDGET TYPE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Budget Type
              </label>

              <div className="relative">

                <DollarSign
                  size={17}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <select
                  value={budgetType}
                  onChange={(event) =>
                    setBudgetType(event.target.value)
                  }
                  className="
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    py-3
                    pl-10
                    pr-3
                    text-sm
                    text-gray-700
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                >
                  <option value="">
                    All Budget Types
                  </option>

                  <option value="fixed">
                    Fixed
                  </option>

                  <option value="hourly">
                    Hourly
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* ============================================
              BUTTONS
          ============================================ */}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">

            {/* SEARCH BUTTON */}

            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-emerald-700
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:w-auto
              "
            >
              <Search size={17} />

              {searching
                ? "Searching..."
                : "Search Projects"}
            </button>

            {/* RESET BUTTON */}

            <button
              type="button"
              onClick={handleReset}
              disabled={searching}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-gray-300
                bg-white
                px-6
                py-3
                text-sm
                font-semibold
                text-gray-700
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:w-auto
              "
            >
              <RotateCcw size={17} />

              Reset Filters
            </button>

          </div>

        </div>

        {/* ============================================
            ERROR
        ============================================ */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* ============================================
            SEARCHING
        ============================================ */}

        {searching && (
          <div className="mb-6 flex items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 p-4">

            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

            <p className="text-sm font-medium text-emerald-700">
              Searching projects...
            </p>

          </div>
        )}

        {/* ============================================
            PROJECT COUNT
        ============================================ */}

        {!searching &&
          !error &&
          projects.length > 0 && (
            <div className="mb-4 flex items-center justify-between">

              <p className="text-sm text-gray-500">

                Showing{" "}

                <span className="font-semibold text-gray-900">
                  {projects.length}
                </span>{" "}

                {projects.length === 1
                  ? "project"
                  : "projects"}

              </p>

            </div>
          )}

        {/* ============================================
            INITIAL EMPTY STATE
        ============================================ */}

        {!searching &&
          !error &&
          projects.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">

                <Search
                  size={30}
                  className="text-emerald-600"
                />

              </div>

              <h2 className="mt-5 text-xl font-semibold text-gray-900">
                Search for Projects
              </h2>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                Enter a project name, skill, category,
                location, or select a budget type to find
                available projects.
              </p>

            </div>
          )}

        {/* ============================================
            PROJECTS
        ============================================ */}

        {projects.length > 0 && !searching && (
          <div className="space-y-5">

            {projects.map((project) => {

              const projectSkills =
                formatSkills(project.skills);

              return (
                <div
                  key={project.id}
                  className="
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:shadow-md
                    sm:p-6
                  "
                >

                  {/* ====================================
                      PROJECT HEADER
                  ==================================== */}

                  <div className="flex flex-col justify-between gap-4 lg:flex-row">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold text-gray-900">
                          {project.title}
                        </h2>

                        <span
                          className="
                            rounded-full
                            bg-emerald-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-emerald-700
                          "
                        >
                          {project.status || "Open"}
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-medium text-emerald-600">
                        {project.category}
                      </p>

                    </div>

                    {/* VIEW DETAILS */}

                    <div className="shrink-0">

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/freelancer/browse-projects/${project.id}`
                          )
                        }
                        className="
                          rounded-lg
                          bg-emerald-600
                          px-5
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-emerald-700
                        "
                      >
                        View Details
                      </button>

                    </div>

                  </div>

                  {/* ====================================
                      DESCRIPTION
                  ==================================== */}

                  <p className="mt-5 leading-7 text-gray-600">
                    {project.description}
                  </p>

                  {/* ====================================
                      PROJECT INFORMATION
                  ==================================== */}

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-1
                      gap-4
                      border-t
                      border-gray-100
                      pt-5
                      sm:grid-cols-2
                      lg:grid-cols-4
                    "
                  >

                    {/* BUDGET */}

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">

                        <DollarSign
                          size={20}
                          className="text-emerald-600"
                        />

                      </div>

                      <div>

                        <p className="text-xs text-gray-500">
                          Budget
                        </p>

                        <p className="font-semibold text-gray-900">
                          $
                          {Number(
                            project.budget
                          ).toFixed(2)}
                        </p>

                      </div>

                    </div>

                    {/* DEADLINE */}

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">

                        <CalendarDays
                          size={20}
                          className="text-blue-600"
                        />

                      </div>

                      <div>

                        <p className="text-xs text-gray-500">
                          Deadline
                        </p>

                        <p className="font-semibold text-gray-900">
                          {new Date(
                            project.deadline
                          ).toLocaleDateString()}
                        </p>

                      </div>

                    </div>

                    {/* LOCATION */}

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">

                        <MapPin
                          size={20}
                          className="text-orange-600"
                        />

                      </div>

                      <div>

                        <p className="text-xs text-gray-500">
                          Location
                        </p>

                        <p className="font-semibold text-gray-900">
                          {project.client_user_id
                            ? "Client Location"
                            : "Not specified"}
                        </p>

                      </div>

                    </div>

                    {/* BUDGET TYPE */}

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">

                        <Clock
                          size={20}
                          className="text-purple-600"
                        />

                      </div>

                      <div>

                        <p className="text-xs text-gray-500">
                          Budget Type
                        </p>

                        <p className="font-semibold capitalize text-gray-900">
                          {project.budget_type}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* ====================================
                      SKILLS
                  ==================================== */}

                  {projectSkills.length > 0 && (
                    <div className="mt-5 border-t border-gray-100 pt-5">

                      <p className="mb-3 text-sm font-semibold text-gray-700">
                        Required Skills
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {projectSkills.map(
                          (skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="
                                rounded-full
                                bg-gray-100
                                px-3
                                py-1
                                text-xs
                                font-medium
                                text-gray-700
                              "
                            >
                              {skill}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}