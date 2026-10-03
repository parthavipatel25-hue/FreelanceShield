"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [remainingAttempts, setRemainingAttempts] =
    useState<number | null>(null);

  const [failedAttempts, setFailedAttempts] =
    useState<number | null>(null);

  const [riskCreated, setRiskCreated] = useState(false);

  const [loading, setLoading] = useState(false);

  // ==================================================
  // HANDLE INPUT CHANGE
  // ==================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Only clear the old message while typing.
    // The backend will provide the new attempt count
    // when Login is pressed.
    setMessage("");
    setRiskCreated(false);
  };

  // ==================================================
  // HANDLE LOGIN
  // ==================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");
    setRiskCreated(false);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      // ==================================================
      // LOGIN FAILED
      // ==================================================

      if (!response.ok) {
        setMessage(
          data.message || "Login failed."
        );

        // IMPORTANT:
        // Get the actual values returned by backend.
        if (
          typeof data.failedAttempts === "number"
        ) {
          setFailedAttempts(
            data.failedAttempts
          );
        }

        if (
          typeof data.remainingAttempts ===
          "number"
        ) {
          setRemainingAttempts(
            data.remainingAttempts
          );
        }

        setRiskCreated(
          data.riskCreated === true
        );

        return;
      }

      // ==================================================
      // LOGIN SUCCESS
      // ==================================================

      setFailedAttempts(null);
      setRemainingAttempts(null);
      setMessage("");

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "token",
        data.token
      );

      // ==================================================
      // FORCE PASSWORD RESET
      // ==================================================

      if (
        data.forcePasswordReset === true
      ) {
        router.push(
          "/reset-password?force=true"
        );

        return;
      }

      // ==================================================
      // ROLE REDIRECT
      // ==================================================

      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (
        data.user.role === "client"
      ) {
        router.push("/client");
      } else {
        router.push("/freelancer");
      }
    } catch (error) {
      console.error(
        "LOGIN FRONTEND ERROR:",
        error
      );

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ==================================================
          LEFT BRANDING SECTION
      ================================================== */}

      <div
        className="
          hidden
          w-1/2
          flex-col
          justify-center
          bg-gradient-to-br
          from-black
          via-gray-900
          to-green-900
          px-16
          text-white
          md:flex
        "
      >
        <h1 className="text-5xl font-bold leading-tight">
          Connect.
          <br />
          Collaborate.
          <br />

          <span className="text-green-400">
            Create.
          </span>
        </h1>

        <p className="mt-6 max-w-md text-lg text-gray-300">
          Welcome back. Continue building amazing
          projects with talented people.
        </p>

        <div className="mt-10 flex gap-4">

          <div className="rounded-xl bg-white/10 p-4">
            <h3 className="text-xl font-semibold">
              10K+
            </h3>

            <p className="text-sm text-gray-400">
              Freelancers
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4">
            <h3 className="text-xl font-semibold">
              5K+
            </h3>

            <p className="text-sm text-gray-400">
              Projects
            </p>
          </div>

        </div>
      </div>

      {/* ==================================================
          LOGIN SECTION
      ================================================== */}

      <div className="flex w-full items-center justify-center md:w-1/2">

        <div className="w-full max-w-md px-8">

          {/* HEADER */}

          <div className="mb-8">

            <h2 className="text-4xl font-bold text-gray-900">
              Welcome Back 👋
            </h2>

            <p className="mt-2 text-gray-500">
              Login to continue your journey
            </p>

          </div>

          {/* ==================================================
              SECURITY MESSAGE
          ================================================== */}

          {message && (
            <div
              className={`
                mb-5
                rounded-xl
                border
                p-4
                text-sm

                ${
                  remainingAttempts !== null &&
                  remainingAttempts > 0
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }
              `}
            >

              <p className="font-medium">
                {message}
              </p>

              {/* ACTUAL FAILED ATTEMPTS */}

              {failedAttempts !== null && (
                <p className="mt-2 font-semibold">
                  Failed attempts:
                  {" "}
                  {failedAttempts}
                </p>
              )}

              {/* REMAINING ATTEMPTS */}

              {remainingAttempts !== null &&
                remainingAttempts > 0 && (
                  <p className="mt-1 font-semibold">
                    {remainingAttempts}{" "}
                    {remainingAttempts === 1
                      ? "attempt"
                      : "attempts"}{" "}
                    remaining.
                  </p>
                )}

              {/* THRESHOLD REACHED */}

              {remainingAttempts === 0 && (
                <p className="mt-2 font-semibold text-red-700">
                  Maximum failed attempts reached.
                  The activity has been flagged for
                  security review.
                </p>
              )}

              {/* RISK CREATED */}

              {riskCreated && (
                <p className="mt-2 font-semibold text-red-700">
                  Security risk created for this
                  repeated failed login activity.
                </p>
              )}

            </div>
          )}

          {/* ==================================================
              LOGIN FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                required
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  focus:border-green-600
                  focus:ring-2
                  focus:ring-green-100
                "
              />

            </div>

            {/* PASSWORD */}

            <div>

              <div className="flex items-center justify-between">

                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>


              </div>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                required
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  focus:border-green-600
                  focus:ring-2
                  focus:ring-green-100
                "
              />

              <Link
                  href="/forgot-password"
                  className="
                    text-sm
                    font-semibold
                    text-green-600
                    hover:text-green-700
                  "
                >
                  Forgot Password?
                </Link>

            </div>
            

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-green-600
                py-3
                font-semibold
                text-white
                transition
                hover:bg-green-700
                hover:scale-[1.02]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* REGISTER */}

          <p className="mt-8 text-center text-gray-500">

            Don't have an account?

            <Link
              href="/register"
              className="
                ml-2
                font-semibold
                text-green-600
                hover:text-green-700
              "
            >
              Create account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}