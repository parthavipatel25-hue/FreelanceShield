
"use client";

import Link from "next/link";
import { useState } from "react";

const API_URL = "${process.env.NEXT_PUBLIC_API_URL}/api/password-reset";

type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

interface StatusData {
  success: boolean;
  status?: RequestStatus;
  email?: string;
  message?: string;
  rejectionReason?: string;
  resetLink?: string;
  expiresInMinutes?: number;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [requestLoading, setRequestLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [statusData, setStatusData] = useState<StatusData | null>(null);

  // ==================================================
  // SUBMIT PASSWORD RESET REQUEST
  // ==================================================

  const handleRequestSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setStatusData(null);
    setRequestLoading(true);
    setRequestSubmitted(false);

    try {
      const response = await fetch(
        `${API_URL}/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to submit your request."
        );
        return;
      }

      setMessage(
        data.message || "Your request has been submitted."
      );

      setRequestSubmitted(true);

      // Show the tracking code returned by the backend.
      if (data.trackingCode) {
        setTrackingCode(data.trackingCode);
      }
    } catch (err) {
      console.error("PASSWORD RESET REQUEST ERROR:", err);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // ==================================================
  // CHECK REQUEST STATUS
  // ==================================================

  const handleCheckStatus = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setStatusData(null);
    setStatusLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackingCode: trackingCode.trim(),
          }),
        }
      );

      const data: StatusData = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to check request status."
        );
        return;
      }

      setStatusData(data);
    } catch (err) {
      console.error("CHECK STATUS ERROR:", err);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // ==================================================
  // COPY TRACKING CODE
  // ==================================================

  const copyTrackingCode = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setMessage("Tracking code copied successfully.");
    } catch {
      setError(
        "Unable to copy the tracking code. Please select and copy it manually."
      );
    }
  };

  return (
    <div className="min-h-screen bg-white px-5 py-12">

      <div className="mx-auto w-full max-w-2xl">

        {/* HEADER */}

        <div className="mb-10 text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            🔐
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password?
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
            Submit a password-reset request and wait for
            administrator approval. You can check your
            request status using your tracking code.
          </p>

        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {message}
          </div>
        )}

        {/* ==================================================
            SECTION 1: SUBMIT REQUEST
        ================================================== */}

        <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-100">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700">
              1
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Submit Reset Request
              </h2>

              <p className="text-sm text-gray-500">
                Enter your registered email address.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleRequestSubmit}
            className="space-y-5"
          >

            <div>

              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Registered Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
                disabled={requestLoading}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
              />

            </div>

            <button
              type="submit"
              disabled={requestLoading}
              className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {requestLoading
                ? "Submitting Request..."
                : "Submit Reset Request"}
            </button>

          </form>

          {/* TRACKING CODE */}

          {requestSubmitted && trackingCode && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">

              <h3 className="font-bold text-emerald-900">
                Your Tracking Code
              </h3>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Save this code carefully. You will need it
                to check your request status.
              </p>

              <div className="mt-4 break-all rounded-lg border border-emerald-200 bg-white p-3 font-mono text-xs text-gray-800">
                {trackingCode}
              </div>

              <button
                type="button"
                onClick={copyTrackingCode}
                className="mt-4 w-full rounded-xl border border-emerald-300 bg-white py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                Copy Tracking Code
              </button>

              <p className="mt-3 text-xs leading-5 text-emerald-700">
                Keep this code private. It gives access to
                your password-reset request status.
              </p>

            </div>
          )}

        </div>

        {/* ==================================================
            SECTION 2: CHECK STATUS
        ================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-100">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
              2
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Check Request Status
              </h2>

              <p className="text-sm text-gray-500">
                Enter your tracking code.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleCheckStatus}
            className="space-y-5"
          >

            <div>

              <label
                htmlFor="trackingCode"
                className="text-sm font-semibold text-gray-700"
              >
                Tracking Code
              </label>

              <input
                id="trackingCode"
                type="text"
                value={trackingCode}
                onChange={(e) => {
                  setTrackingCode(e.target.value);
                  setStatusData(null);
                }}
                placeholder="Paste your tracking code"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

            </div>

            <button
              type="submit"
              disabled={statusLoading}
              className="w-full rounded-xl border border-green-600 bg-white py-3 font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {statusLoading
                ? "Checking Status..."
                : "Check Status"}
            </button>

          </form>

          {/* STATUS RESULT */}

          {statusData && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">

              <div className="flex flex-wrap items-center justify-between gap-3">

                <h3 className="font-bold text-gray-900">
                  Request Status
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    statusData.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : statusData.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : statusData.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {statusData.status}
                </span>

              </div>

              <p className="mt-3 text-sm leading-6 text-gray-700">
                {statusData.message}
              </p>

              {statusData.email && (
                <p className="mt-2 text-xs text-gray-500">
                  Account: {statusData.email}
                </p>
              )}

              {/* PENDING */}

              {statusData.status === "pending" && (
                <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                  Your request is waiting for the administrator
                  to review it. Please check again later.
                </div>
              )}

              {/* APPROVED */}

              {statusData.status === "approved" &&
                statusData.resetLink && (
                  <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">

                    <p className="font-semibold text-green-900">
                      Your request has been approved!
                    </p>

                    <p className="mt-2 text-sm text-green-800">
                      Your reset link is valid for{" "}
                      {statusData.expiresInMinutes} minutes.
                    </p>

                    <Link
                      href={statusData.resetLink}
                      className="mt-4 flex w-full items-center justify-center rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
                    >
                      Reset My Password
                    </Link>

                  </div>
                )}

              {/* REJECTED */}

              {statusData.status === "rejected" && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">

                  <p className="font-semibold text-red-900">
                    Request Rejected
                  </p>

                  <p className="mt-2 text-sm text-red-800">
                    Reason:{" "}
                    {statusData.rejectionReason ||
                      "No reason provided."}
                  </p>

                  <p className="mt-3 text-xs text-red-700">
                    You may submit a new request if needed.
                  </p>

                </div>
              )}

              {/* COMPLETED */}

              {statusData.status === "completed" && (
                <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  Your password has been successfully changed.
                  You can now log in using your new password.
                </div>
              )}

            </div>
          )}

        </div>

        {/* BACK TO LOGIN */}

        <p className="mt-8 text-center text-sm text-gray-500">
          Remember your password?

          <Link
            href="/login"
            className="ml-2 font-semibold text-green-600 hover:text-green-700"
          >
            Back to Login
          </Link>
        </p>

      </div>

    </div>
  );
}
