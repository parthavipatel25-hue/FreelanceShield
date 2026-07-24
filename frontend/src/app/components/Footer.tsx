import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#071638] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* ================= LOGO & CONTACT ================= */}

          <div className="lg:col-span-2">
            <Link href="#home" className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-r
                  from-emerald-500
                  to-teal-500
                  shadow-lg
                "
              >
                <Shield className="h-6 w-6 text-white" />
              </div>

              <span className="text-2xl font-bold">
                Freelance
                <span className="text-emerald-400">Shield</span>
              </span>
            </Link>

            <p
              className="
                mt-6
                max-w-md
                leading-relaxed
                text-slate-300
              "
            >
              Where talent meets trust. FreelanceShield helps
              freelancers and clients collaborate securely through
              verified profiles, transparent communication, and
              protected payments.
            </p>

            {/* CONTACT DETAILS */}

            <div className="mt-8 space-y-3">
              <h3
                className="
                relative
                inline-block
                text-lg
                font-semibold
                text-white
                transition-all
                duration-300
                hover:text-emerald-400
                after:absolute
                after:left-0
                after:bottom-[-4px]
                after:h-[2px]
                after:w-0
                after:bg-emerald-400
                after:transition-all
                after:duration-300
                hover:after:w-full"
              >
                Contact Us
              </h3>

              <p className="text-slate-300">
                support@freelanceshield.com
              </p>

            </div>
          </div>

          {/* ================= QUICK LINKS ================= */}

          <div>
            <h3 className="mb-6 text-lg font-bold">
              QUICK LINKS
            </h3>

            <ul className="space-y-4 text-slate-300">
              <li>
                <Link
                  href="#home"
                  className="
                   relative
                   inline-block
                   text-slate-300
                   transition-all
                   duration-300
                   hover:text-emerald-400
                   after:absolute
                   after:left-0
                   after:bottom-[-4px]
                   after:h-[2px]
                   after:w-0
                   after:bg-emerald-400
                   after:transition-all
                   after:duration-300
                   hover:after:w-full"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="#categories"
                  className="
    relative
    inline-block
    text-slate-300
    transition-all
    duration-300
    hover:text-emerald-400

    after:absolute
    after:left-0
    after:bottom-[-4px]
    after:h-[2px]
    after:w-0
    after:bg-emerald-400
    after:transition-all
    after:duration-300

    hover:after:w-full
  "
                >
                  Categories
                </Link>
              </li>

              <li>
                <Link
                  href="#how-it-works"
                  className="
    relative
    inline-block
    text-slate-300
    transition-all
    duration-300
    hover:text-emerald-400

    after:absolute
    after:left-0
    after:bottom-[-4px]
    after:h-[2px]
    after:w-0
    after:bg-emerald-400
    after:transition-all
    after:duration-300

    hover:after:w-full
  "
                >
                  How It Works
                </Link>
              </li>

              <li>
                <Link
                  href="#about"
                  className="
    relative
    inline-block
    text-slate-300
    transition-all
    duration-300
    hover:text-emerald-400

    after:absolute
    after:left-0
    after:bottom-[-4px]
    after:h-[2px]
    after:w-0
    after:bg-emerald-400
    after:transition-all
    after:duration-300

    hover:after:w-full
  "
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= FOR FREELANCERS ================= */}

          <div>
            <h3 className="mb-6 text-lg font-bold">
              FOR FREELANCERS
            </h3>

            <ul className="space-y-4 text-slate-300">
              <li>Find Work</li>

              <li>Grow Skills</li>

              <li>Verified Profiles</li>

              <li>Secure Payments</li>
            </ul>
          </div>

          {/* ================= FOR CLIENTS ================= */}

          <div>
            <h3 className="mb-6 text-lg font-bold">
              FOR CLIENTS
            </h3>

            <ul className="space-y-4 text-slate-300">
              <li>Hire Talent</li>

              <li>Quality Work</li>

              <li>Trusted Talent</li>

              <li>Save Time</li>
            </ul>
          </div>
        </div>

        {/* ================= BOTTOM SECTION ================= */}

        <div
          className="
            mt-16
            flex
            flex-col
            items-center
            justify-between
            gap-6
            border-t
            border-slate-800
            pt-8
            lg:flex-row
          "
        >
          <p className="text-center text-slate-400">
            © 2026 FreelanceShield. All Rights Reserved.
          </p>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-full
              border
              border-emerald-500/20
              bg-slate-900
              px-5
              py-3
            "
          >
            <span
              className="
                h-3
                w-3
                rounded-full
                bg-emerald-400
              "
            />

            <span
              className="
                font-medium
                text-emerald-400
              "
            >
              Secure Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}