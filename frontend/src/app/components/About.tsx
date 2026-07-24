"use client";

import {
  ShieldCheck,
  Lightbulb,
  Users,
  Rocket,
} from "lucide-react";


export default function About() {


  const values = [
    {
      icon: ShieldCheck,
      title: "Trust",
      description:
        "Creating a secure environment where freelancers and clients can collaborate confidently.",
    },
    {
      icon: Lightbulb,
      title: "Opportunity",
      description:
        "Helping talented individuals discover projects and turn skills into careers.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building meaningful connections between freelancers, students, and businesses.",
    },
    {
      icon: Rocket,
      title: "Growth",
      description:
        "Supporting continuous learning, improvement, and professional success.",
    },
  ];



  return (

    <section
      id="about"
      className="
        scroll-mt-20
        bg-white
        py-16
        lg:py-20
      "
    >

      <div
        className="
          mx-auto
          max-w-screen-2xl
          px-5
          lg:px-10
        "
      >



        {/* ================= HEADER ================= */}


        <div
          className="
            mx-auto
            max-w-3xl
            text-center
          "
        >


          <span
            className="
              inline-block
              rounded-full
              border
              border-emerald-200
              bg-emerald-50
              px-5
              py-2
              text-sm
              font-semibold
              text-emerald-600
            "
          >
            ABOUT FREELANCESHIELD
          </span>



          <h2
            className="
              mt-6
              text-3xl
              font-bold
              leading-tight
              text-slate-900
              md:text-5xl
            "
          >

            Where Skills Meet

            <span className="text-emerald-600">
              {" "}Opportunities
            </span>

          </h2>



          <p
            className="
              mt-5
              text-lg
              leading-relaxed
              text-slate-600
            "
          >
            FreelanceShield is a secure freelancing platform
            designed to connect skilled freelancers with
            meaningful opportunities while creating a trusted
            space for clients and talent to grow together.
          </p>


        </div>








        {/* ================= OUR VALUES ================= */}



        <div
          className="
            mt-16
          "
        >



          <h3
            className="
              text-center
              text-3xl
              font-bold
              text-slate-900
            "
          >
            Our Values
          </h3>





          <div
            className="
              mt-10
              grid
              gap-6
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >


            {values.map((item)=>{


              const Icon = item.icon;


              return (

                <div
                  key={item.title}
                  className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-7
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:shadow-xl
                  "
                >


                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-emerald-50
                    "
                  >

                    <Icon
                      size={30}
                      className="text-emerald-600"
                    />

                  </div>



                  <h4
                    className="
                      mt-5
                      text-xl
                      font-bold
                      text-slate-900
                    "
                  >
                    {item.title}
                  </h4>



                  <p
                    className="
                      mt-3
                      text-sm
                      leading-relaxed
                      text-slate-600
                    "
                  >
                    {item.description}
                  </p>


                </div>

              );


            })}


          </div>


        </div>






        {/* ================= BOTTOM HIGHLIGHT ================= */}



        <div
          className="
            mt-16
            rounded-3xl
            bg-emerald-600
            p-8
            text-center
            text-white
            lg:p-10
          "
        >

          <h3
            className="
              text-2xl
              font-bold
              md:text-3xl
            "
          >
            Building A Safer Future For Freelancing
          </h3>


          <p
            className="
              mx-auto
              mt-4
              max-w-3xl
              leading-relaxed
              text-emerald-50
            "
          >
            We believe every skill deserves an opportunity
            and every project deserves trusted talent.
            FreelanceShield bridges the gap between both.
          </p>


        </div>



      </div>


    </section>

  );

}