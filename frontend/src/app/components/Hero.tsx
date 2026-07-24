"use client";

import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="
        relative
        h-[85vh]
        overflow-hidden
        md:h-[75vh]
        lg:h-[80vh]
      "
    >

      {/* HERO IMAGE */}

      <Image
        src="/images/hero.png"
        alt="FreelanceShield Hero Image"
        fill
        priority
        className="object-cover"
      />


      {/* DARK OVERLAY */}

      <div className="absolute inset-0 bg-black/55" />



      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          max-w-7xl
          items-center
          px-6
          lg:px-8
        "
      >

        <div
          className="
            w-full
            pt-24
            text-center

            lg:max-w-4xl
            lg:pt-0
            lg:text-left
          "
        >


          {/* HEADING */}

          <h1
            className="
              text-5xl
              font-light
              leading-tight
              text-white

              md:text-6xl

              lg:text-8xl
            "
          >
           Connect with talent.
            <br />
            Build what's next.
          </h1>
             
             <p
  className="
    mt-6
    max-w-2xl
    text-lg
    italic
    leading-relaxed
    text-white/80

    md:text-xl
  "
>
  One platform to hire professionals
  and grow your freelance career.
</p>




          {/* CTA BUTTONS */}

          <div
            className="
              mt-10
              flex
              flex-col
              gap-4

              sm:flex-row
              sm:justify-center

              lg:justify-start
            "
          >

            {/* HIRE TALENT BUTTON */}

            <Link
              href="/hire-talent"
              className="
                rounded-xl
                bg-emerald-600
                px-8
                py-4
                text-center
                text-lg
                font-semibold
                text-white
                shadow-lg

                transition-all
                duration-300

                hover:-translate-y-1
                hover:bg-emerald-700
                hover:shadow-emerald-500/30
              "
            >
              Hire a Talent
            </Link>




            {/* FREELANCER BUTTON */}

            <Link
              href="/register"
              className="
                rounded-xl
                border
                border-white/40
                bg-white/10
                px-8
                py-4
                text-center
                text-lg
                font-semibold
                text-white

                backdrop-blur-sm

                transition-all
                duration-300

                hover:-translate-y-1
                hover:bg-white
                hover:text-slate-900
              "
            >
              Become a Freelancer
            </Link>


          </div>





          {/* TRUSTED TEXT */}

          <div
            className="
              mt-12
              flex
              flex-wrap
              gap-6

              justify-center

              text-sm
              font-medium
              text-white/90

              lg:justify-start
            "
          >

            <span>
              ✔ Verified Freelancers
            </span>


            <span>
              ✔ Secure Payments
            </span>


            <span>
              ✔ 24/7 Support
            </span>


          </div>



        </div>


      </div>


    </section>
  );
}