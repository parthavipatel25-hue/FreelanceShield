"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FreelancerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const loggedInUser = JSON.parse(storedUser);

    if (loggedInUser.role !== "freelancer") {
      router.push("/login");
      return;
    }

    setUser(loggedInUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold">
        Welcome, {user.fullname} 👋
      </h1>

      <p className="text-gray-600 mt-2">
        Role : {user.role}
      </p>

      <hr className="my-8" />

      <h2 className="text-2xl font-semibold mb-4">
        Dashboard
      </h2>

      <div className="space-y-3">

        <button className="w-full border rounded-lg p-3 text-left">
          Create Profile
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          View Profile
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          Browse Projects
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          My Applications
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          Messages
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          Settings
        </button>

      </div>

      <hr className="my-8" />

      <h2 className="text-2xl font-semibold mb-4">
        Quick Stats
      </h2>

      <div className="space-y-2">
        <p>Projects Applied : 0</p>
        <p>Projects Completed : 0</p>
        <p>Messages : 0</p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-10 bg-red-600 text-white px-6 py-3 rounded-lg"
      >
        Logout
      </button>

    </div>
  );
}
