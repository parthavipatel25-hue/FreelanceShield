"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  fullname: string;
  email: string;
}

interface EditProfileFormProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function EditProfileForm({
  user,
  setUser,
}: EditProfileFormProps) {
  const [fullname, setFullname] = useState(user.fullname);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFullname(user.fullname);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullname: fullname.trim(),
          }),
        }
      );

      const text = await response.text();
      console.log(text);

      if (!response.ok) {
        setMessage("Failed to update profile.");
        setLoading(false);
        return;
      }

      const updatedUser = {
        ...user,
        fullname: fullname.trim(),
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);

      setMessage("Profile updated successfully.");

    } catch (error) {
      console.error(error);
      setMessage("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className="
        w-full
        rounded-2xl
        bg-white
        p-5
        shadow-md
        sm:p-6
        lg:p-8
      "
    >

      {/* ================= TITLE ================= */}

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
        Edit Profile
      </h2>


      {/* ================= FORM ================= */}

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-5"
      >

        {/* ================= FULL NAME ================= */}

        <div className="w-full">

          <label
            htmlFor="fullname"
            className="
              mb-2
              block
              text-sm
              font-medium
              text-gray-700
              sm:text-base
            "
          >
            Update Name
          </label>

          <input
            id="fullname"
            type="text"
            value={fullname}
            onChange={(e) => {
              setFullname(e.target.value);
              setMessage("");
            }}
            placeholder="Enter your full name"
            className="
              w-full
              min-w-0
              rounded-lg
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
            required
          />

        </div>


        {/* ================= MESSAGE ================= */}

        {message && (
          <p
            className={`
              break-words
              text-sm
              font-medium
              ${
                message.includes("success")
                  ? "text-emerald-600"
                  : "text-red-500"
              }
            `}
          >
            {message}
          </p>
        )}


        {/* ================= BUTTON ================= */}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            rounded-lg
            bg-emerald-600
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-emerald-700
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
            sm:text-base
          "
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </form>

    </div>
  );
}