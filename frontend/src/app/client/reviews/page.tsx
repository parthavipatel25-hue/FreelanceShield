"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface User {
  id: number;
  fullname: string;
  email: string;
  role: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  freelancer_id: number | null;
  status: string;
}

export default function ClientReviewsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD USER
  // =====================================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setLoading(false);
      return;
    }

    const loggedInUser: User = JSON.parse(storedUser);

    setUser(loggedInUser);

    fetchProjects(loggedInUser.id);
  }, []);

  // =====================================================
  // GET CLIENT PROJECTS
  // =====================================================
  const fetchProjects = async (userId: number) => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/projects/client/${userId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load projects.");
      }

      // Only completed projects can be reviewed
      const completedProjects = (data.projects || []).filter(
        (project: Project) =>
          project.status === "completed" && project.freelancer_id
      );

      setProjects(completedProjects);

      if (completedProjects.length > 0) {
        setSelectedProject(completedProjects[0]);
      }
    } catch (err) {
      console.error("FETCH PROJECTS ERROR:", err);
      setError("Unable to load completed projects.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================
  const handleSubmitReview = async () => {
    setMessage("");
    setError("");

    if (!user || !selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    if (review.trim() === "") {
      setError("Please write a review.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: selectedProject.id,
            client_id: user.id,
            rating: rating,
            review: review.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review.");
      }

      setMessage("Review submitted successfully!");

      // Clear form
      setRating(0);
      setReview("");

      // Remove reviewed project from the list
      setProjects((previousProjects) =>
        previousProjects.filter(
          (project) => project.id !== selectedProject.id
        )
      );

      setSelectedProject(null);
    } catch (err) {
      console.error("SUBMIT REVIEW ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to submit review.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading completed projects...</p>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Ratings & Reviews
            </h1>

            <p className="text-gray-600 mt-1">
              Review freelancers after completing your projects.
            </p>
          </div>

          <Link
            href="/client"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>

        {/* Success message */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* No projects */}
        {projects.length === 0 && !selectedProject ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <CheckCircle
              size={50}
              className="mx-auto text-green-500 mb-4"
            />

            <h2 className="text-xl font-semibold text-gray-900">
              No Projects to Review
            </h2>

            <p className="text-gray-500 mt-2">
              You have no completed projects waiting for a review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Project list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Completed Projects
              </h2>

              <div className="space-y-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      setRating(0);
                      setReview("");
                      setMessage("");
                      setError("");
                    }}
                    className={`w-full text-left rounded-xl border p-4 transition ${
                      selectedProject?.id === project.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <p className="font-medium text-gray-900">
                      {project.title}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <CheckCircle size={15} />
                      Completed
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Review form */}
            <div className="lg:col-span-2">
              {selectedProject && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">

                  <div className="mb-6">
                    <p className="text-sm text-gray-500">
                      Project
                    </p>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                      {selectedProject.title}
                    </h2>
                  </div>

                  {/* Rating */}
                  <div className="mb-7">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Your Rating
                    </label>

                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={34}
                            className={
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        </button>
                      ))}

                      {rating > 0 && (
                        <span className="ml-2 text-gray-600 font-medium">
                          {rating}/5
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review */}
                  <div className="mb-6">
                    <label
                      htmlFor="review"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Your Review
                    </label>

                    <textarea
                      id="review"
                      value={review}
                      onChange={(event) =>
                        setReview(event.target.value)
                      }
                      rows={6}
                      placeholder="Share your experience working with this freelancer..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Send size={18} />

                    {submitting
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}