"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "../../../components/layout/DashboardLayout";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  Clock,
  Send,
} from "lucide-react";

interface Project {
  id: number;
  client_id: number;
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

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Proposal states
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalError, setProposalError] = useState("");

  // ============================================
  // CHECK LOGGED-IN FREELANCER
  // ============================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser: User = JSON.parse(storedUser);

      if (loggedInUser.role !== "freelancer") {
        router.push("/login");
        return;
      }

      setUser(loggedInUser);
    } catch (error) {
      console.error("INVALID USER DATA:", error);

      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // ============================================
  // FETCH PROJECT DETAILS
  // ============================================

  useEffect(() => {
    if (!user || !projectId) return;

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

        setProject(data.project);
      } catch (error) {
        console.error("FETCH PROJECT DETAILS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user, projectId]);

  // ============================================
  // OPEN PROPOSAL FORM
  // ============================================

  const handleApplyClick = () => {
    console.log("APPLY BUTTON CLICKED");

    setShowProposalForm(true);
    setProposalMessage("");
    setProposalError("");

    // Put the form near the top of the screen
    setTimeout(() => {
      document
        .getElementById("proposal-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // ============================================
  // SUBMIT PROPOSAL
  // ============================================

  const handleSubmitProposal = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user || !project) return;

    // Basic validation
    if (!coverLetter.trim()) {
      setProposalError("Please enter a cover letter.");
      return;
    }

    if (!proposedBudget || Number(proposedBudget) <= 0) {
      setProposalError("Please enter a valid proposed budget.");
      return;
    }

    if (!deliveryTime || Number(deliveryTime) <= 0) {
      setProposalError("Please enter a valid delivery time.");
      return;
    }

    try {
      setSubmitting(true);
      setProposalError("");
      setProposalMessage("");

      const response = await fetch(
        "http://localhost:5000/api/proposals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: project.id,
            freelancer_id: user.id,
            cover_letter: coverLetter.trim(),
            proposed_budget: Number(proposedBudget),
            delivery_time: Number(deliveryTime),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit proposal."
        );
      }

      console.log("PROPOSAL SUBMITTED:", data);

      setProposalMessage(
        "Proposal submitted successfully!"
      );

      // Clear form
      setCoverLetter("");
      setProposedBudget("");
      setDeliveryTime("");

      // Hide form after successful submission
      setShowProposalForm(false);

      // Scroll to top so success message is visible
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("SUBMIT PROPOSAL ERROR:", error);

      setProposalError(
        error instanceof Error
          ? error.message
          : "Unable to submit proposal."
      );
    } finally {
      setSubmitting(false);
    }
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
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR / PROJECT NOT FOUND
  // ============================================

  if (error || !project) {
    return (
      <DashboardLayout role="freelancer">
        <div className="w-full">
          <button
            type="button"
            onClick={() =>
              router.push("/freelancer/browse-projects")
            }
            className="
              mb-6
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
            Back to Browse Projects
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <BriefcaseBusiness
                size={26}
                className="text-red-600"
              />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Project not found
            </h2>

            <p className="mt-2 text-gray-600">
              {error || "This project could not be found."}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================
  // PROJECT DETAILS
  // ============================================

  return (
    <DashboardLayout role="freelancer">
      <div className="w-full">

        {/* ============================================ */}
        {/* BACK BUTTON */}
        {/* ============================================ */}

        <button
          type="button"
          onClick={() =>
            router.push("/freelancer/browse-projects")
          }
          className="
            mb-6
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
          Back to Browse Projects
        </button>

        {/* ============================================ */}
        {/* SUCCESS MESSAGE */}
        {/* ============================================ */}

        {proposalMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {proposalMessage}
          </div>
        )}

        {/* ============================================ */}
        {/* PROJECT CARD */}
        {/* ============================================ */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* ============================================ */}
          {/* HEADER */}
          {/* ============================================ */}

          <div className="border-b border-gray-100 p-6 sm:p-8">

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

              <div>
                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {project.title}
                  </h1>

                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      ${
                        project.status === "open"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    `}
                  >
                    {project.status || "Open"}
                  </span>

                </div>

                <p className="mt-3 text-sm font-medium text-emerald-600">
                  {project.category}
                </p>
              </div>

              {/* ============================================ */}
              {/* APPLY BUTTON */}
              {/* ============================================ */}

              {project.status === "open" && (
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="
                    w-full
                    rounded-xl
                    bg-emerald-600
                    px-6
                    py-3
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                    lg:w-auto
                  "
                >
                  Apply for Project
                </button>
              )}

              {project.status !== "open" && (
                <button
                  type="button"
                  disabled
                  className="
                    w-full
                    cursor-not-allowed
                    rounded-xl
                    bg-gray-400
                    px-6
                    py-3
                    font-semibold
                    text-white
                    lg:w-auto
                  "
                >
                  Project Unavailable
                </button>
              )}

            </div>

          </div>

          {/* ============================================ */}
          {/* PROJECT CONTENT */}
          {/* ============================================ */}

          <div className="p-6 sm:p-8">

            {/* ============================================ */}
            {/* DESCRIPTION */}
            {/* ============================================ */}

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Project Description
              </h2>

              <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                {project.description}
              </p>
            </section>

            {/* ============================================ */}
            {/* PROJECT INFORMATION */}
            {/* ============================================ */}

            <section className="mt-8">

              <h2 className="text-lg font-semibold text-gray-900">
                Project Information
              </h2>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-3
                "
              >

                {/* BUDGET */}

                <div className="rounded-xl bg-gray-50 p-4">
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

                      <p className="mt-1 font-semibold text-gray-900">
                        ${Number(project.budget).toFixed(2)}
                      </p>
                    </div>

                  </div>
                </div>

                {/* DEADLINE */}

                <div className="rounded-xl bg-gray-50 p-4">
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

                      <p className="mt-1 font-semibold text-gray-900">
                        {new Date(
                          project.deadline
                        ).toLocaleDateString()}
                      </p>
                    </div>

                  </div>
                </div>

                {/* BUDGET TYPE */}

                <div className="rounded-xl bg-gray-50 p-4">
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

                      <p className="mt-1 font-semibold capitalize text-gray-900">
                        {project.budget_type}
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* ============================================ */}
            {/* SKILLS */}
            {/* ============================================ */}

            {project.skills && (
              <section className="mt-8">

                <h2 className="text-lg font-semibold text-gray-900">
                  Required Skills
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">

                  {project.skills
                    .split(",")
                    .map((skill) => (
                      <span
                        key={skill.trim()}
                        className="
                          rounded-full
                          bg-gray-100
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-gray-700
                        "
                      >
                        {skill.trim()}
                      </span>
                    ))}

                </div>

              </section>
            )}

            {/* ============================================ */}
            {/* PROJECT ID */}
            {/* ============================================ */}

            <div className="mt-8 border-t border-gray-100 pt-5">

              <p className="text-sm text-gray-500">
                Project ID:{" "}
                <span className="font-medium text-gray-700">
                  #{project.id}
                </span>
              </p>

            </div>

          </div>
        </div>

        {/* ============================================ */}
        {/* PROPOSAL FORM */}
        {/* IMPORTANT: OUTSIDE PROJECT ERROR BLOCK */}
        {/* ============================================ */}

        {showProposalForm && (
          <div
            id="proposal-form"
            className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >

            {/* FORM HEADER */}

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Send
                  size={20}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Submit Your Proposal
                </h2>

                <p className="text-sm text-gray-500">
                  Tell the client why you are a good fit for this project.
                </p>
              </div>

            </div>

            {/* ERROR MESSAGE */}

            {proposalError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                {proposalError}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmitProposal}
              className="space-y-5"
            >

              {/* COVER LETTER */}

              <div>

                <label
                  htmlFor="coverLetter"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Cover Letter
                </label>

                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(event) =>
                    setCoverLetter(event.target.value)
                  }
                  required
                  rows={6}
                  placeholder="Explain your experience, approach, and why you are suitable for this project..."
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

              </div>

              {/* BUDGET + DELIVERY */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* PROPOSED BUDGET */}

                <div>

                  <label
                    htmlFor="proposedBudget"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Your Proposed Budget
                  </label>

                  <div className="relative">

                    <DollarSign
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="proposedBudget"
                      type="number"
                      min="1"
                      step="0.01"
                      value={proposedBudget}
                      onChange={(event) =>
                        setProposedBudget(event.target.value)
                      }
                      required
                      placeholder={String(project.budget)}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        py-3
                        pl-10
                        pr-4
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        focus:border-emerald-500
                        focus:ring-2
                        focus:ring-emerald-100
                      "
                    />

                  </div>

                </div>

                {/* DELIVERY TIME */}

                <div>

                  <label
                    htmlFor="deliveryTime"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Delivery Time
                  </label>

                  <div className="relative">

                    <Clock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="deliveryTime"
                      type="number"
                      min="1"
                      value={deliveryTime}
                      onChange={(event) =>
                        setDeliveryTime(event.target.value)
                      }
                      required
                      placeholder="14"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        py-3
                        pl-10
                        pr-4
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        focus:border-emerald-500
                        focus:ring-2
                        focus:ring-emerald-100
                      "
                    />

                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Number of days
                  </p>

                </div>

              </div>

              {/* ACTION BUTTONS */}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">

                {/* CANCEL */}

                <button
                  type="button"
                  onClick={() => {
                    setShowProposalForm(false);
                    setProposalError("");
                  }}
                  disabled={submitting}
                  className="
                    rounded-xl
                    border
                    border-gray-300
                    px-6
                    py-3
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-600
                    px-6
                    py-3
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Send size={18} />

                  {submitting
                    ? "Submitting..."
                    : "Submit Proposal"}
                </button>

              </div>

            </form>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}