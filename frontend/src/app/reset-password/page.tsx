"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import {
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [checkingToken, setCheckingToken] =
    useState(true);

  const [tokenValid, setTokenValid] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ======================================================
  // VERIFY RESET TOKEN
  // ======================================================

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError(
          "Invalid password reset link."
        );

        setCheckingToken(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/password-reset/verify?token=${encodeURIComponent(
            token
          )}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "This reset link is invalid or expired."
          );
        }

        setTokenValid(true);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Invalid reset link."
        );
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  // ======================================================
  // HANDLE PASSWORD RESET
  // ======================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------
    // TOKEN CHECK
    // ----------------------------------------------------

    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    // ----------------------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------------------

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/password-reset/reset",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to reset password."
        );
      }

      setSuccess(
        "Password changed successfully. You can now log in with your new password."
      );

      setPassword("");
      setConfirmPassword("");

      // Token has now been consumed.
      setTokenValid(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // VERIFYING TOKEN SCREEN
  // ======================================================

  if (checkingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-gray-600">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <ShieldCheck
              size={32}
              className="text-emerald-600"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            FreelanceShield
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Secure Password Reset
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">

          {/* ==================================================
              INVALID / EXPIRED TOKEN
          ================================================== */}

          {!tokenValid && !success && (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  size={22}
                  className="shrink-0 text-red-600"
                />

                <p className="text-sm text-red-700">
                  {error ||
                    "This password reset link is invalid or expired."}
                </p>
              </div>

              <a
                href="/login"
                className="mt-6 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Back to Login
              </a>
            </>
          )}

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {success && (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <CheckCircle2
                  size={42}
                  className="mx-auto text-emerald-600"
                />

                <h2 className="mt-4 text-lg font-bold text-emerald-900">
                  Password Updated
                </h2>

                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  {success}
                </p>
              </div>

              <a
                href="/login"
                className="mt-6 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Go to Login
              </a>
            </>
          )}

          {/* ==================================================
              RESET PASSWORD FORM
          ================================================== */}

          {tokenValid && !success && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create a New Password
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Your security issue has been reviewed.
                  Create a new password to secure your account.
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >

                {/* NEW PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    New Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter new password"
                      required
                      className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-11 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Minimum 8 characters.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      required
                      className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-11 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Updating Password..."
                    : "Set New Password"}
                </button>

              </form>

              <p className="mt-5 text-center text-xs text-gray-400">
                For your security, this reset link can only
                be used once and expires after 15 minutes.
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}