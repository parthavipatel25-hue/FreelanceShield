
"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type FormData = {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
};

type Errors = {
  fullname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
};

const initialForm: FormData = {
  fullname: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
};

function RegisterForm() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // Get role from URL
  useEffect(() => {
    const role = searchParams.get("role");

    if (role === "client" || role === "freelancer") {
      setForm((prev) => ({
        ...prev,
        role,
      }));
    }
  }, [searchParams]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!form.fullname.trim()) {
      newErrors.fullname = "Full name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        form.email.trim()
      )
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,8}$/;

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be 6–8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!form.role) {
      newErrors.role = "Please select an account type.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading || !validate()) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullname: form.fullname.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        alert(data.message || "Account created successfully!");

        setForm({
          ...initialForm,
          role: "freelancer",
        });

        setErrors({});
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Handle role selection
  const selectRole = (role: "freelancer" | "client") => {
    setForm((prev) => ({
      ...prev,
      role,
    }));

    setErrors((prev) => ({
      ...prev,
      role: undefined,
    }));
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Left Branding */}
      <div
        className="
          hidden md:flex
          w-1/2
          bg-gradient-to-br
          from-black
          via-gray-900
          to-green-900
          text-white
          flex-col
          justify-center
          px-16
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

        <p className="mt-6 text-gray-300 text-lg max-w-md">
          Join thousands of freelancers and clients
          creating opportunities together.
        </p>

        <div className="mt-10 flex gap-4">

          <div className="bg-white/10 p-4 rounded-xl">
            <h3 className="font-semibold text-xl">
              10K+
            </h3>
            <p className="text-sm text-gray-400">
              Freelancers
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl">
            <h3 className="font-semibold text-xl">
              5K+
            </h3>
            <p className="text-sm text-gray-400">
              Projects
            </p>
          </div>

        </div>
      </div>

      {/* Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-10">

        <div className="w-full max-w-md px-8">

          <div className="mb-7">
            <h1 className="text-4xl font-bold text-gray-900">
              Create Account
            </h1>

            <p className="text-gray-500 mt-2">
              Join as a Freelancer or Client
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-4"
          >

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium">
                Full Name
              </label>

              <input
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="
                  mt-2 w-full px-4 py-3
                  border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2
                  focus:ring-green-600
                "
              />

              {errors.fullname && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullname}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="
                  mt-2 w-full px-4 py-3
                  border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2
                  focus:ring-green-600
                "
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                  mt-2 w-full px-4 py-3
                  border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2
                  focus:ring-green-600
                "
              />

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="
                  mt-2 w-full px-4 py-3
                  border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2
                  focus:ring-green-600
                "
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium">
                Select Account Type
              </label>

              <div className="grid grid-cols-2 gap-3 mt-3">

                {/* Freelancer */}
                <button
                  type="button"
                  onClick={() => selectRole("freelancer")}
                  aria-pressed={form.role === "freelancer"}
                  className={`
                    cursor-pointer rounded-xl border p-4
                    text-center transition
                    ${
                      form.role === "freelancer"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300 hover:border-green-400"
                    }
                  `}
                >
                  <div className="text-2xl">
                    👨‍💻
                  </div>

                  <h3 className="font-semibold">
                    Freelancer
                  </h3>

                  <p className="text-xs text-gray-500">
                    Offer your skills
                  </p>
                </button>

                {/* Client */}
                <button
                  type="button"
                  onClick={() => selectRole("client")}
                  aria-pressed={form.role === "client"}
                  className={`
                    cursor-pointer rounded-xl border p-4
                    text-center transition
                    ${
                      form.role === "client"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300 hover:border-green-400"
                    }
                  `}
                >
                  <div className="text-2xl">
                    🏢
                  </div>

                  <h3 className="font-semibold">
                    Client
                  </h3>

                  <p className="text-xs text-gray-500">
                    Hire freelancers
                  </p>
                </button>

              </div>

              {errors.role && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full bg-green-600
                hover:bg-green-700
                disabled:bg-green-400
                disabled:cursor-not-allowed
                text-white py-3 rounded-xl
                font-semibold transition
                hover:scale-[1.02]
              "
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center mt-7 text-gray-500">
            Already have an account?

            <Link
              href="/login"
              className="
                text-green-600 font-semibold ml-2
              "
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

// Suspense boundary for useSearchParams
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
