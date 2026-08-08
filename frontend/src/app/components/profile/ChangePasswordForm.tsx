"use client";

import { useState } from "react";

type Errors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================
  // PASSWORD VALIDATION
  // 6-8 characters
  // At least:
  // 1 uppercase
  // 1 lowercase
  // 1 number
  // 1 special character
  // =========================================

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,8}$/;

  // =========================================
  // VALIDATION
  // =========================================

  const validate = () => {
    const newErrors: Errors = {};

    // Current Password
    if (!currentPassword.trim()) {
      newErrors.currentPassword =
        "Current password is required.";
    }

    // New Password
    if (!newPassword.trim()) {
      newErrors.newPassword =
        "New password is required.";
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword =
        "Password must be 6-8 characters and include uppercase, lowercase, number and special character.";
    } else if (currentPassword === newPassword) {
      newErrors.newPassword =
        "New password cannot be same as current password.";
    }

    // Confirm Password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================
  // HANDLE SUBMIT
  // =========================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrors({});
    setMessage("");

    // Validate form
    if (!validate()) {
      return;
    }

    // =========================================
    // GET LOGGED-IN USER
    // =========================================

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      setMessage("Please login again.");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );

      setMessage("Please login again.");
      return;
    }

    // Check user ID
    if (!user?.id) {
      setMessage(
        "User ID not found. Please login again."
      );
      return;
    }

    setLoading(true);

    // =========================================
    // CHANGE PASSWORD API
    // =========================================

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/${user.id}/password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      // =========================================
      // HANDLE RESPONSE
      // =========================================

      let data;

      try {
        data = await response.json();
      } catch (error) {
        console.error(
          "Invalid server response:",
          error
        );

        setMessage(
          "Invalid response from server."
        );

        setLoading(false);
        return;
      }

      if (!response.ok) {
        setMessage(
          data?.message ||
            "Unable to change password."
        );

        setLoading(false);
        return;
      }

      // =========================================
      // SUCCESS
      // =========================================

      setMessage(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setErrors({});
    } catch (error) {
      console.error(
        "Password Change Error:",
        error
      );

      setMessage(
        "Server error. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

      {/* =========================================
          TITLE
      ========================================= */}

      <h2
        className="
          mb-5
          text-xl
          font-bold
          text-gray-800
          sm:mb-6
          sm:text-2xl
        "
      >
        Security
      </h2>

      {/* =========================================
          FORM
      ========================================= */}

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-5"
      >

        {/* =========================================
            CURRENT PASSWORD
        ========================================= */}

        <div className="w-full">

          <label
            htmlFor="currentPassword"
            className="
              block
              text-sm
              font-medium
              text-gray-700
              sm:text-base
            "
          >
            Current Password
          </label>

          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(
                e.target.value
              );

              setMessage("");

              setErrors((prev) => ({
                ...prev,
                currentPassword: undefined,
              }));
            }}
            placeholder="Enter current password"
            autoComplete="current-password"
            className="
              mt-2
              w-full
              min-w-0
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              text-sm
              text-gray-700
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-100
              sm:text-base
            "
          />

          {errors.currentPassword && (
            <p className="mt-1.5 break-words text-sm text-red-500">
              {errors.currentPassword}
            </p>
          )}

        </div>

        {/* =========================================
            NEW PASSWORD
        ========================================= */}

        <div className="w-full">

          <label
            htmlFor="newPassword"
            className="
              block
              text-sm
              font-medium
              text-gray-700
              sm:text-base
            "
          >
            New Password
          </label>

          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(
                e.target.value
              );

              setMessage("");

              setErrors((prev) => ({
                ...prev,
                newPassword: undefined,
              }));
            }}
            placeholder="Enter new password"
            autoComplete="new-password"
            className="
              mt-2
              w-full
              min-w-0
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              text-sm
              text-gray-700
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-100
              sm:text-base
            "
          />

          {errors.newPassword && (
            <p className="mt-1.5 break-words text-sm leading-5 text-red-500">
              {errors.newPassword}
            </p>
          )}

        </div>

        {/* =========================================
            CONFIRM PASSWORD
        ========================================= */}

        <div className="w-full">

          <label
            htmlFor="confirmPassword"
            className="
              block
              text-sm
              font-medium
              text-gray-700
              sm:text-base
            "
          >
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(
                e.target.value
              );

              setMessage("");

              setErrors((prev) => ({
                ...prev,
                confirmPassword: undefined,
              }));
            }}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="
              mt-2
              w-full
              min-w-0
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              text-sm
              text-gray-700
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-100
              sm:text-base
            "
          />

          {errors.confirmPassword && (
            <p className="mt-1.5 break-words text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}

        </div>


        {/* =========================================
            SUCCESS / ERROR MESSAGE
        ========================================= */}

        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              message
                .toLowerCase()
                .includes("success")
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* =========================================
            SAVE BUTTON
        ========================================= */}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            rounded-xl
            bg-emerald-600
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-emerald-700
            hover:scale-[1.01]
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:text-base
          "
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>

      </form>
    </div>
  );
}
