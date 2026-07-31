"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();

 const [form, setForm] = useState({
  fullname: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
});

useEffect(() => {
  const role = searchParams.get("role");

  if (role === "client" || role === "freelancer") {
    setForm((prev) => ({
      ...prev,
      role,
    }));
  }
}, [searchParams]);


  type Errors = {
    fullname?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };


  const [errors, setErrors] = useState<Errors>({});



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };



  const validate = () => {

    const newErrors: Errors = {};


    if (!form.fullname.trim()) {
      newErrors.fullname = "Full name is required.";
    }


    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } 
    else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {

      newErrors.email =
        "Enter a valid email address.";

    }



    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,8}$/;


    if (!form.password) {

      newErrors.password =
        "Password is required.";

    } 
    else if (!passwordRegex.test(form.password)) {

      newErrors.password =
        "Password must be 6–8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.";

    }



    if (!form.confirmPassword) {

      newErrors.confirmPassword =
        "Please confirm your password.";

    } 
    else if (
      form.password !== form.confirmPassword
    ) {

      newErrors.confirmPassword =
        "Passwords do not match.";

    }



    setErrors(newErrors);


    return Object.keys(newErrors).length === 0;

  };



const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: form.fullname,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message);

      setForm({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "freelancer",
      });

      setErrors({});
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server.");
  }
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



                <div

                  onClick={() =>
                    setForm({
                      ...form,
                      role:"freelancer"
                    })
                  }

                  className={`
                  cursor-pointer
                  rounded-xl
                  border
                  p-4
                  text-center
                  transition
                  ${
                    form.role === "freelancer"
                    ?
                    "border-green-600 bg-green-50"
                    :
                    "border-gray-300 hover:border-green-400"
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


                </div>







                <div

                  onClick={() =>
                    setForm({
                      ...form,
                      role:"client"
                    })
                  }


                  className={`
                  cursor-pointer
                  rounded-xl
                  border
                  p-4
                  text-center
                  transition
                  ${
                    form.role === "client"
                    ?
                    "border-green-600 bg-green-50"
                    :
                    "border-gray-300 hover:border-green-400"
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


                </div>


              </div>


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

              Create Account

            </button>



          </form>






          <p className="text-center mt-7 text-gray-500">


            Already have an account?


            <Link

              href="/login"

              className="
              text-green-600
              font-semibold
              ml-2
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