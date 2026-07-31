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


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


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


      if (!response.ok) {
        setMessage(
          data.message || "Login failed"
        );
        return;
      }


      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

if (data.user.role === "admin") {

  router.push("/admin");

}
else if (data.user.role === "client") {

  router.push("/client");

}
else {

  router.push("/freelancer");

}


    } catch {

      setMessage(
        "Server error. Please try again."
      );

    }

  };



  return (

    <div className="min-h-screen flex bg-gray-50">


      {/* Left Branding Section */}

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

          Welcome back. Continue building amazing
          projects with talented people.

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




      {/* Login Form */}

      <div className="w-full md:w-1/2 flex items-center justify-center">


        <div className="w-full max-w-md px-8">


          <div className="mb-8">


            <h2 className="text-4xl font-bold text-gray-900">

              Welcome Back 👋

            </h2>


            <p className="text-gray-500 mt-2">

              Login to continue your journey

            </p>


          </div>



          {
            message && (

              <p className="text-red-500 mb-4">

                {message}

              </p>

            )
          }




          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >



            <div>

              <label className="text-sm font-medium">

                Email

              </label>


              <input

                type="email"

                name="email"

                value={form.email}

                onChange={handleChange}

                placeholder="example@gmail.com"

                className="
                mt-2
                w-full
                px-4
                py-3
                border
                border-gray-300
                rounded-xl
                focus:outline-none
                focus:ring-2
                focus:ring-green-600
                "

              />


            </div>





            <div>

              <label className="text-sm font-medium">

                Password

              </label>


              <input

                type="password"

                name="password"

                value={form.password}

                onChange={handleChange}

                placeholder="********"

                className="
                mt-2
                w-full
                px-4
                py-3
                border
                border-gray-300
                rounded-xl
                focus:outline-none
                focus:ring-2
                focus:ring-green-600
                "

              />


            </div>




       





            <button

              type="submit"

              className="
              w-full
              bg-green-600
              hover:bg-green-700
              text-white
              py-3
              rounded-xl
              font-semibold
              transition
              hover:scale-[1.02]
              "

            >

              Login

            </button>




          </form>





          <p className="text-center mt-8 text-gray-500">


            Don't have an account?


            <Link

              href="/register"

              className="
              text-green-600
              font-semibold
              ml-2
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