"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  X,
  MapPin,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  FileText,
  UserRound,
  Code2,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

interface FreelancerProfile {
  id: number | null;
  profile_picture: string | null;
  professional_title: string | null;
  category: string | null;
  city: string | null;
  skills: string[] | null;
  about: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  google_drive_url: string | null;
  resume_url: string | null;
}

interface ClientProfile {
  id: number | null;
  full_name: string | null;
  company_name: string | null;
  industry: string | null;
  city: string | null;
  about: string | null;
  requirements: string | null;
  preferred_skills: string[] | null;
  company_website: string | null;
  profile_image: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  google_drive_url: string | null;
}

interface VerificationRequest {
  id: number;
  user_id: number;
  status: "pending";
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;

  user: {
    fullname: string;
    email: string;
    role: "freelancer" | "client";
  };

  profile_type: "freelancer" | "client";

  freelancer_profile: FreelancerProfile | null;

  client_profile: ClientProfile | null;
}

export default function VerificationPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "admin") {
        router.push("/login");
        return;
      }

      fetchRequests(loggedInUser.id);
    } catch (error) {
      console.error("Invalid user data:", error);

      localStorage.removeItem("user");

      router.push("/login");
    }
  }, [router]);

  // ============================================
  // FETCH REQUESTS
  // ============================================

  const fetchRequests = async (adminId: number) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/user-verification/admin/pending?admin_id=${adminId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load verification requests."
        );
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error(
        "Error fetching verification requests:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load verification requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // APPROVE
  // ============================================

  const handleApprove = async (id: number) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      setProcessingId(id);

      const response = await fetch(
        `http://localhost:5000/api/user-verification/admin/${id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_id: loggedInUser.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to approve request."
        );
      }

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request.id !== id
        )
      );

      setSelectedRequest(null);
    } catch (error) {
      console.error(
        "Error approving verification:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to approve verification request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================
  // REJECT
  // ============================================

  const handleReject = async (id: number) => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    if (!reason || !reason.trim()) {
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      setProcessingId(id);

      const response = await fetch(
        `http://localhost:5000/api/user-verification/admin/${id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_id: loggedInUser.id,
            rejection_reason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reject request."
        );
      }

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request.id !== id
        )
      );

      setSelectedRequest(null);
    } catch (error) {
      console.error(
        "Error rejecting verification:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to reject verification request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================
  // CLOSE DETAILS PANEL
  // ============================================

  const closeDetails = () => {
    if (processingId !== null) {
      return;
    }

    setSelectedRequest(null);
  };

  // ============================================
  // DISPLAY VALUE
  // ============================================

  const displayValue = (
    value: string | null | undefined
  ) => {
    if (!value || !value.trim()) {
      return "Not provided";
    }

    return value;
  };

  // ============================================
  // SKILLS
  // ============================================

  const renderSkills = (
    skills: string[] | null | undefined
  ) => {
    if (!skills || skills.length === 0) {
      return (
        <span className="text-sm text-gray-400">
          Not provided
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
          >
            {skill}
          </span>
        ))}
      </div>
    );
  };

  // ============================================
  // PROFILE DETAILS PANEL
  // ============================================

  const renderDetailsPanel = () => {
    if (!selectedRequest) {
      return null;
    }

    const isFreelancer =
      selectedRequest.profile_type ===
      "freelancer";

    const freelancer =
      selectedRequest.freelancer_profile;

    const client =
      selectedRequest.client_profile;

    return (
      <div className="fixed inset-0 z-50">
        {/* BACKDROP */}

        <button
          type="button"
          aria-label="Close details"
          onClick={closeDetails}
          className="absolute inset-0 h-full w-full bg-black/40"
        />

        {/* SIDE PANEL */}

        <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
          {/* PANEL HEADER */}

          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Profile Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review the information submitted by
                the user.
              </p>
            </div>

            <button
              type="button"
              onClick={closeDetails}
              disabled={processingId !== null}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={22} />
            </button>
          </div>

          {/* PANEL CONTENT */}

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
            {/* USER SUMMARY */}

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-4">
                {/* PROFILE IMAGE */}

                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100">
                  {isFreelancer &&
                  freelancer?.profile_picture ? (
                    <img
                      src={
                        freelancer.profile_picture
                      }
                      alt={
                        selectedRequest.user.fullname
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : !isFreelancer &&
                    client?.profile_image ? (
                    <img
                      src={client.profile_image}
                      alt={
                        selectedRequest.user.fullname
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound
                      className="text-emerald-600"
                      size={30}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedRequest.user.fullname}
                    </h3>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium capitalize text-amber-700">
                      {selectedRequest.user.role}
                    </span>
                  </div>

                  <p className="mt-1 break-all text-sm text-gray-500">
                    {selectedRequest.user.email}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Submitted{" "}
                    {new Date(
                      selectedRequest.submitted_at
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* FREELANCER DETAILS */}

            {isFreelancer && freelancer && (
              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <BriefcaseBusiness
                      size={19}
                      className="text-emerald-600"
                    />

                    <h3 className="text-lg font-bold text-gray-900">
                      Freelancer Profile
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* PROFESSIONAL TITLE */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Professional Title
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {displayValue(
                          freelancer.professional_title
                        )}
                      </p>
                    </div>

                    {/* CATEGORY + CITY */}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2">
                          <Code2
                            size={17}
                            className="text-emerald-600"
                          />

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Category
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-gray-800">
                          {displayValue(
                            freelancer.category
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={17}
                            className="text-emerald-600"
                          />

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            City
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-gray-800">
                          {displayValue(
                            freelancer.city
                          )}
                        </p>
                      </div>
                    </div>

                    {/* SKILLS */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Skills
                      </p>

                      {renderSkills(
                        freelancer.skills
                      )}
                    </div>

                    {/* ABOUT */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        About
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {displayValue(
                          freelancer.about
                        )}
                      </p>
                    </div>

                    {/* LINKS */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Links & Documents
                      </p>

                      <div className="space-y-2">
                        {freelancer.linkedin_url ? (
                          <a
                            href={
                              freelancer.linkedin_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-50"
                          >
                            <ExternalLink
                              size={16}
                            />
                            LinkedIn
                          </a>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            LinkedIn: Not provided
                          </p>
                        )}

                        {freelancer.github_url ? (
                          <a
                            href={
                              freelancer.github_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                          >
                            <ExternalLink
                              size={16}
                            />
                            GitHub
                          </a>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            GitHub: Not provided
                          </p>
                        )}

                        {freelancer.google_drive_url ? (
                          <a
                            href={
                              freelancer.google_drive_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                          >
                            <ExternalLink
                              size={16}
                            />
                            Google Drive
                          </a>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            Google Drive: Not provided
                          </p>
                        )}

                        {freelancer.resume_url ? (
                          <a
                            href={
                              freelancer.resume_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-50"
                          >
                            <FileText
                              size={16}
                            />
                            View Resume
                          </a>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            Resume: Not provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CLIENT DETAILS */}

            {!isFreelancer && client && (
              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Building2
                      size={19}
                      className="text-emerald-600"
                    />

                    <h3 className="text-lg font-bold text-gray-900">
                      Client Profile
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* FULL NAME */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Full Name
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {displayValue(
                          client.full_name
                        )}
                      </p>
                    </div>

                    {/* COMPANY + INDUSTRY */}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Company
                        </p>

                        <p className="mt-2 text-sm text-gray-800">
                          {displayValue(
                            client.company_name
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Industry
                        </p>

                        <p className="mt-2 text-sm text-gray-800">
                          {displayValue(
                            client.industry
                          )}
                        </p>
                      </div>
                    </div>

                    {/* CITY */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={17}
                          className="text-emerald-600"
                        />

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          City
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-gray-800">
                        {displayValue(client.city)}
                      </p>
                    </div>

                    {/* ABOUT */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        About
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {displayValue(client.about)}
                      </p>
                    </div>

                    {/* HIRING REQUIREMENTS */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Hiring Requirements
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {displayValue(
                          client.requirements
                        )}
                      </p>
                    </div>

                    {/* PREFERRED SKILLS */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Preferred Skills
                      </p>

                      {renderSkills(
                        client.preferred_skills
                      )}
                    </div>

                    {/* COMPANY WEBSITE */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Company Website
                      </p>

                      {client.company_website ? (
                        <a
                          href={
                            client.company_website
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center gap-2 break-all text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink
                            size={16}
                          />
                          {client.company_website}
                        </a>
                      ) : (
                        <p className="mt-2 text-sm text-gray-400">
                          Not provided
                        </p>
                      )}
                    </div>

                    {/* LINKS */}

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Links
                      </p>

                      <div className="space-y-2">
                        {client.linkedin_url ? (
                          <a
                            href={
                              client.linkedin_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-50"
                          >
                            <ExternalLink
                              size={16}
                            />
                            LinkedIn
                          </a>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            LinkedIn: Not provided
                          </p>
                        )}

                        {client.github_url ? (
                          <a
                            href={
                              client.github_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                          >
                            <ExternalLink
                              size={16}
                            />
                            GitHub
                          </a>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            GitHub: Not provided
                          </p>
                        )}

                        {client.google_drive_url ? (
                          <a
                            href={
                              client.google_drive_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                          >
                            <ExternalLink
                              size={16}
                            />
                            Google Drive
                          </a>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            Google Drive: Not provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NO PROFILE */}

            {!selectedRequest.freelancer_profile &&
              !selectedRequest.client_profile && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800">
                    Profile information has not been
                    completed yet.
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    The user submitted a verification
                    request without completing their
                    profile details.
                  </p>
                </div>
              )}
          </div>

          {/* PANEL FOOTER */}

          <div className="border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  handleReject(selectedRequest.id)
                }
                disabled={
                  processingId ===
                  selectedRequest.id
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={18} />

                {processingId ===
                selectedRequest.id
                  ? "Processing..."
                  : "Reject"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApprove(selectedRequest.id)
                }
                disabled={
                  processingId ===
                  selectedRequest.id
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle size={18} />

                {processingId ===
                selectedRequest.id
                  ? "Processing..."
                  : "Approve"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    );
  };

  // ============================================
  // PAGE
  // ============================================

  return (
    <DashboardLayout role="admin">
      <div className="w-full">
        {/* HEADER */}

        <section className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                User Verification
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Review and manage pending user
                verification requests.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review the user&apos;s existing profile
              information before making a decision.
            </p>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading verification requests...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            requests.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-gray-300" />

                <h3 className="mt-3 text-lg font-semibold text-gray-700">
                  No Pending Requests
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  There are currently no user verification
                  requests waiting for review.
                </p>
              </div>
            )}

          {/* REQUEST LIST */}

          {!loading &&
            !error &&
            requests.length > 0 && (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-gray-200 p-4 transition hover:border-emerald-200 hover:shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* USER INFO */}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.user.fullname}
                          </h3>

                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium capitalize text-amber-700">
                            {request.user.role}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          {request.user.email}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Submitted{" "}
                          {new Date(
                            request.submitted_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-col gap-2 sm:flex-row">
                        {/* VIEW DETAILS */}

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRequest(
                              request
                            )
                          }
                          disabled={
                            processingId ===
                            request.id
                          }
                          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Eye size={18} />
                          View Details
                        </button>

                        {/* APPROVE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleApprove(
                              request.id
                            )
                          }
                          disabled={
                            processingId ===
                            request.id
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>

                        {/* REJECT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleReject(
                              request.id
                            )
                          }
                          disabled={
                            processingId ===
                            request.id
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>

      {/* DETAILS SIDE PANEL */}

      {renderDetailsPanel()}
    </DashboardLayout>
  );
}