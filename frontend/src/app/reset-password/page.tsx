"use client";
import { BASE_URL } from '@/lib/api'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"loading" | "force" | "normal" | "invalid">(
    "loading"
  );
  const [token, setToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const force = params.get("force");
    const resetToken = params.get("token");

    if (force === "true") {
      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        setMode("invalid");
        setError("Your session has expired. Please log in again.");
        return;
      }

      setMode("force");
      return;
    }

    if (resetToken) {
      setToken(resetToken);
      setMode("normal");
      return;
    }

    setMode("invalid");
    setError("Invalid or expired password reset link.");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (new TextEncoder().encode(newPassword).length > 72) {
      setError("Password is too long.");
      return;
    }

    setLoading(true);

    try {
      let response: Response;

      if (mode === "force") {
        const authToken = localStorage.getItem("token");

        if (!authToken) {
          setError("Your session has expired. Please log in again.");
          setLoading(false);
          return;
        }

        response = await fetch(
          `${BASE_URL}/api/auth/force-change-password`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ newPassword }),
          }
        );
      } else if (mode === "normal") {
        response = await fetch(
          `${BASE_URL}/api/password-reset/reset-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              newPassword,
            }),
          }
        );
      } else {
        setError("Invalid password reset request.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to change password.");
      }

      setSuccess(data.message || "Password changed successfully.");

      if (mode === "force") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  if (mode === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm10-11V7a4 4 0 00-8 0v3h8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "force"
              ? "Change Your Password"
              : mode === "normal"
                ? "Reset Your Password"
                : "Password Reset"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {mode === "force"
              ? "You must create a new password before continuing."
              : mode === "normal"
                ? "Create a new secure password for your account."
                : "Please request a new password reset link."}
          </p>
        </div>

        {mode === "invalid" ? (
          <div className="text-center">
            <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>

            <Link
              href="/forgot-password"
              className="inline-flex w-full justify-center rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to Forgot Password
            </Link>

            <div className="mt-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-emerald-600"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="text-center">
            <div className="mb-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
              {success}
            </div>

            <button
              onClick={handleLoginRedirect}
              className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Continue to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                New Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Confirm New Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Show passwords
            </label>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-7 border-t border-gray-100 pt-5 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 transition hover:text-emerald-600"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
