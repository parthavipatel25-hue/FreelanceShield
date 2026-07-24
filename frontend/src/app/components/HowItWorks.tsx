"use client";

import {
  Briefcase,
  UserCheck,
  CreditCard,
  UserPlus,
  Search,
  Wallet,
} from "lucide-react";

import { useState } from "react";

const clientSteps = [
  {
    icon: Briefcase,
    title: "Post Project",
    description:
      "Share your requirements, budget and timeline easily.",
  },
  {
    icon: UserCheck,
    title: "Hire Talent",
    description:
      "Choose verified freelancers based on skills and reviews.",
  },
  {
    icon: CreditCard,
    title: "Get Work Done",
    description:
      "Pay securely and receive quality work on time.",
  },
];

const freelancerSteps = [
  {
    icon: UserPlus,
    title: "Create Profile",
    description:
      "Build your profile and showcase your skills.",
  },
  {
    icon: Search,
    title: "Find Work",
    description:
      "Discover projects matching your expertise.",
  },
  {
    icon: Wallet,
    title: "Get Paid",
    description:
      "Receive secure payments after completion.",
  },
];

function StepCard({
  item,
  index,
  active,
  setActive,
}: {
  item: {
    icon: React.ElementType;
    title: string;
    description: string;
  };
  index: number;
  active: number | null;
  setActive: (value: number | null) => void;
}) {
  const Icon = item.icon;

  const stepActive =
    active !== null &&
    index <= active;

  return (
    <div className="relative flex items-center justify-center">

      {/* CARD */}

      <div
        onMouseEnter={() => setActive(index)}
        onMouseLeave={() => setActive(null)}
        className="
        group
        relative
        z-10
        w-[260px]
        rounded-2xl
        bg-white
        p-5
        text-center
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
        "
      >

        {/* STEP BADGE */}

        <div
          className={`
          mx-auto
          w-fit
          rounded-full
          px-3
          py-1
          text-xs
          font-bold
          transition-all
          duration-300

          ${
            stepActive
              ? "bg-emerald-500 text-white"
              : "bg-emerald-50 text-emerald-600"
          }
          `}
        >
          Step {index + 1}
        </div>

        {/* ICON */}

        <div
          className="
          mx-auto
          mt-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-emerald-50
          transition-all
          duration-300
          group-hover:scale-110
          "
        >
          <Icon
            size={24}
            className="text-emerald-600"
          />
        </div>

        {/* TITLE */}

        <h4
          className="
          mt-3
          text-base
          font-bold
          text-slate-900
          "
        >
          {item.title}
        </h4>

        {/* DESCRIPTION */}

        <p
          className="
          mt-2
          text-xs
          leading-5
          text-slate-600
          "
        >
          {item.description}
        </p>

      </div>

      {/* DESKTOP CONNECTOR */}

      {index !== 2 && (
        <div
          className="
          absolute
          left-[calc(50%+130px)]
          top-1/2
          hidden
          h-1
          w-[60px]
          -translate-y-1/2
          md:block
          "
        >

          <div
            className="
            absolute
            h-full
            w-full
            rounded-full
            bg-slate-200
            "
          />

          <div
            className={`
            absolute
            h-full
            rounded-full
            bg-emerald-500
            transition-all
            duration-500

            ${
              active !== null &&
              index < active
                ? "w-full"
                : "w-0"
            }
            `}
          />

        </div>
      )}

      {/* MOBILE CONNECTOR */}

      {index !== 2 && (
        <div
          className="
          absolute
          left-1/2
          top-full
          block
          h-8
          w-1
          -translate-x-1/2
          md:hidden
          "
        >

          <div
            className="
            absolute
            h-full
            w-full
            rounded-full
            bg-slate-200
            "
          />

          <div
            className={`
            absolute
            w-full
            rounded-full
            bg-emerald-500
            transition-all
            duration-500

            ${
              active !== null &&
              index < active
                ? "h-full"
                : "h-0"
            }
            `}
          />

        </div>
      )}

    </div>
  );
}

function ProcessSection({
  title,
  steps,
}: {
  title: string;
  steps: any[];
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="mt-20">

      <h3
        className="
        text-center
        text-2xl
        font-bold
        text-slate-900
        "
      >
        {title}
      </h3>

      <div
        className="
        mt-10
        grid
        grid-cols-1
        justify-items-center
        gap-y-10
        md:grid-cols-2
        lg:grid-cols-3
        "
      >
        {steps.map((item, index) => (
          <StepCard
            key={item.title}
            item={item}
            index={index}
            active={active}
            setActive={setActive}
          />
        ))}
      </div>

    </div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="
      bg-slate-50
      py-20
      "
    >

      <div
        className="
        mx-auto
        max-w-5xl
        px-5
        "
      >

        <div className="text-center">

          <span
            className="
            rounded-full
            bg-emerald-50
            px-4
            py-2
            text-sm
            font-semibold
            text-emerald-600
            "
          >
            HOW IT WORKS
          </span>

          <h2
            className="
            mt-5
            text-3xl
            font-bold
            text-slate-900
            sm:text-4xl
            "
          >
            Simple Steps For Everyone
          </h2>

          <p
            className="
            mx-auto
            mt-4
            max-w-2xl
            text-slate-600
            "
          >
            FreelanceShield connects clients and freelancers
            through a secure workflow.
          </p>

        </div>

        <ProcessSection
          title="For Clients"
          steps={clientSteps}
        />

        <ProcessSection
          title="For Freelancers"
          steps={freelancerSteps}
        />

      </div>

    </section>
  );
}