"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Menu,
  X,
  ChevronRight,
  Search,
} from "lucide-react";


export default function Navbar() {

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);


  const menuItems = [
    {
      name: "Home",
      href: "home",
    },
    {
      name: "Categories",
      href: "categories",
    },
    {
      name: "How It Works",
      href: "how-it-works",
    },
    {
      name: "About",
      href: "about",
    },
    {
      name: "Contact",
      href: "contact",
    },
  ];


  return (
    <>

      {/* ================= NAVBAR ================= */}

      <header
        className="
          fixed
          top-0
          z-50
          w-full
          border-b
          border-slate-200/70
          bg-white/90
          backdrop-blur-lg
          shadow-sm
        "
      >

        <nav
          className="
            mx-auto
            flex
            h-16
            max-w-screen-2xl
            items-center
            justify-between
            gap-4
            px-5
            lg:px-8
          "
        >


          {/* ================= MOBILE NAV ================= */}

          <div
            className="
              flex
              w-full
              items-center
              justify-between
              lg:hidden
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <button
                onClick={() => {
                  setOpen(true);
                  setSearchOpen(false);
                }}
                className="
                  rounded-lg
                  p-2
                  transition
                  hover:bg-slate-100
                "
              >

                <Menu
                  size={26}
                  className="text-slate-900"
                />

              </button>


              <Link
                href="/"
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Shield
                  className="
                    h-6
                    w-6
                    text-emerald-600
                  "
                />


                <span
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                  "
                >

                  Freelance
                  <span className="text-emerald-600">
                    Shield
                  </span>

                </span>

              </Link>

            </div>



            {/* SEARCH + LOGIN */}

            <div
              className="
                flex
                items-center
                gap-1
              "
            >

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="
                  rounded-lg
                  p-2
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  hover:text-emerald-600
                "
              >

                <Search size={22}/>

              </button>



              <Link
                href="/login"
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  hover:text-emerald-600
                "
              >

                Login

              </Link>

            </div>


          </div>





          {/* ================= DESKTOP LOGO ================= */}


          <Link
            href="/"
            className="
              hidden
              items-center
              gap-3
              lg:flex
            "
          >

            <span
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-emerald-600
                shadow-md
              "
            >

              <Shield
                className="
                  h-5
                  w-5
                  text-white
                "
              />

            </span>



            <span
              className="
                text-xl
                font-bold
                text-slate-900
              "
            >

              Freelance
              <span className="text-emerald-600">
                Shield
              </span>

            </span>

          </Link>





          {/* ================= DESKTOP SEARCH ================= */}


       <div
          className="
          hidden
          xl:flex
          w-[550px]
          h-12
          items-center
          overflow-hidden
          rounded-full
          border 
          border-slate-200
          bg-white
          shadow-sm
          transition-all
          duration-300
          focus-within:border-emerald-500
          focus-within:ring-2
          focus-within:ring-emerald-100
          hover:shadow-md
          "
        >

            <input
              type="text"
              placeholder="Search for any services..."
              className="
              flex-1
              bg-transparent
              px-5
              text-sm
              text-slate-700
              placeholder:text-slate-400
              outline-none
              "
            />


            <button
                className="
                flex
                h-full
                w-16
                items-center
                justify-center
                bg-emerald-600
                px-5
                py-3
                text-white
                transition
                hover:bg-emerald-700
              "
            >

              <Search size={18}/>

            </button>


          </div>

                    {/* ================= RIGHT MENU ================= */}

          <div
            className="
              hidden
              items-center
              gap-4
              lg:flex
            "
          >

            <ul
              className="
                flex
                items-center
                gap-1
              "
            >

              {menuItems.map((item) => (

                <li key={item.name}>

                  <Link
                    href={`#${item.href}`}
                    className="
                      relative
                      rounded-lg
                      px-3
                      py-2
                      text-sm
                      font-medium
                      text-slate-600
                      transition-all
                      duration-300
                      hover:text-emerald-600

                      after:absolute
                      after:left-3
                      after:bottom-0
                      after:h-[2px]
                      after:w-0
                      after:bg-emerald-600
                      after:transition-all
                      after:duration-300

                      hover:after:w-[calc(100%-24px)]
                    "
                  >

                    {item.name}

                  </Link>

                </li>

              ))}

            </ul>



            <Link
              href="/register"
              className="
                rounded-lg
                bg-emerald-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-md
                transition-all
                duration-300
                hover:scale-105
                hover:bg-emerald-700
              "
            >

              Get Started

            </Link>


          </div>


        </nav>





        {/* ================= MOBILE SEARCH BOX ================= */}


        {searchOpen && (

          <div
            className="
              absolute
              top-16
              left-0
              w-full
              bg-white
              border-b
              border-slate-200
              p-4
              shadow-md
              lg:hidden
            "
          >

            <div
              className="
                flex
                items-center
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-slate-50
              "
            >

              <input
                type="text"
                placeholder="Search for any services..."
                className="
                  flex-1
                  bg-transparent
                  px-4
                  py-3
                  text-sm
                  outline-none
                "
              />


              <button
                className="
                  bg-emerald-600
                  px-4
                  py-3
                  text-white
                  transition
                  hover:bg-emerald-700
                "
              >

                <Search size={18}/>

              </button>


            </div>


          </div>

        )}


      </header>






      {/* ================= BACKDROP ================= */}


      <div
        onClick={() => setOpen(false)}
        className={`
          fixed
          inset-0
          z-40
          bg-black/50
          transition-all
          duration-500
          lg:hidden

          ${
            open
              ? "visible opacity-100"
              : "invisible opacity-0"
          }
        `}
      />







      {/* ================= MOBILE DRAWER ================= */}


      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-[80%]
          max-w-sm
          bg-white
          shadow-2xl
          transition-all
          duration-500
          lg:hidden

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >




        {/* DRAWER HEADER */}


        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
          "
        >

          <Link
            href="/"
            className="
              flex
              items-center
              gap-2
            "
          >

            <Shield
              className="
                h-6
                w-6
                text-emerald-600
              "
            />


            <span
              className="
                text-xl
                font-bold
                text-slate-900
              "
            >

              Freelance
              <span className="text-emerald-600">
                Shield
              </span>

            </span>

          </Link>



          <button
            onClick={() => setOpen(false)}
            className="
              rounded-lg
              p-2
              transition
              hover:bg-slate-100
            "
          >

            <X size={26}/>

          </button>


        </div>

                {/* ================= MOBILE MENU LINKS ================= */}


        <div>

          {menuItems.map((item) => (

            <Link
              key={item.name}
              href={`#${item.href}`}
              onClick={() => setOpen(false)}
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-200
                px-6
                py-5
                text-lg
                font-medium
                text-slate-800
                transition
                hover:bg-slate-50
                hover:text-emerald-600
              "
            >

              {item.name}


              <ChevronRight
                size={20}
                className="text-slate-400"
              />

            </Link>

          ))}

        </div>







        {/* ================= MOBILE ACTION BUTTONS ================= */}



        <div
          className="
            absolute
            bottom-6
            left-0
            w-full
            px-6
          "
        >

          <div
            className="
              flex
              gap-4
            "
          >


            <Link
              href="/register"
              className="
                flex-1
                rounded-lg
                bg-emerald-600
                py-3.5
                text-center
                font-semibold
                text-white
                transition
                hover:bg-emerald-700
              "
            >

              Sign Up

            </Link>





            <Link
              href="/login"
              className="
                flex-1
                rounded-lg
                border
                border-slate-300
                py-3.5
                text-center
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-50
              "
            >

              Login

            </Link>


          </div>


        </div>


      </aside>


    </>
  );
}