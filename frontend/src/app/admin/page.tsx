"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const loggedInUser = JSON.parse(storedUser);

    if (loggedInUser.role !== "admin") {
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
          Manage Users
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          Manage Freelancers
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          Manage Clients
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          Manage Categories
        </button>

        <button className="w-full border rounded-lg p-3 text-left">
          Reports
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
        <p>Total Users : 0</p>
        <p>Total Freelancers : 0</p>
        <p>Total Clients : 0</p>
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