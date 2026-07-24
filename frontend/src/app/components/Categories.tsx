"use client";

import { useEffect, useState } from "react";

import {
  Code2,
  Palette,
  Globe,
  Languages,
  Image,
  Brain,
  Music,
  Briefcase,
  Shield,
  Smartphone,
  Cloud,
  Camera,
  Database,
  Monitor,
  Blocks,
  Pencil,
} from "lucide-react";

const categories = [
  {
    title: "Programming & Tech",
    icon: Code2,
  },
  {
    title: "Graphics & Design",
    icon: Palette,
  },
  {
    title: "Digital Marketing",
    icon: Globe,
  },
  {
    title: "Writing & Translation",
    icon: Languages,
  },
  {
    title: "Video & Animation",
    icon: Image,
  },
  {
    title: "AI Services",
    icon: Brain,
  },
  {
    title: "Music & Audio",
    icon: Music,
  },
  {
    title: "Business",
    icon: Briefcase,
  },
  {
    title: "Cyber Security",
    icon: Shield,
  },
  {
    title: "Mobile Development",
    icon: Smartphone,
  },
  {
    title: "Cloud Computing",
    icon: Cloud,
  },
  {
    title: "UI/UX Design",
    icon: Monitor,
  },
];

export default function Categories() {
  const [showAll, setShowAll] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  const visibleCategories = isDesktop
    ? categories
    : showAll
    ? categories
    : categories.slice(0, 8);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <h2
          className="
          text-center
          text-4xl
          font-bold
          text-slate-900
          "
        >
          Explore Categories
        </h2>

        <p
          className="
          mx-auto
          mt-4
          max-w-2xl
          text-center
          text-slate-600
          "
        >
          Find trusted freelancers across
          hundreds of professional services.
        </p>

        {/* Categories */}

        <div className=" mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {visibleCategories.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className="
                rounded-2xl
                bg-white
                p-5
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:border
                hover:border-emerald-500
                "
              >
                {/* Icon */}

                <div
                  className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                  "
                >
                  <Icon
                    size={24}
                    className="text-emerald-600"
                  />
                </div>

                {/* Title */}

                <h3
                  className="
                  mt-3
                  text-base
                  font-semibold
                  text-slate-900
                  "
                >
                  {item.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* View More Button */}

        {!isDesktop && (
          <div className="mt-10 text-center">
            <button
              onClick={() =>
                setShowAll(!showAll)
              }
              className="
              rounded-xl
              border
              border-slate-300
              px-7
              py-3
              font-semibold
              transition-all
              duration-300
              hover:bg-white
              hover:shadow-lg
              "
            >
              {showAll
                ? "Show Less ↑"
                : "View More ↓"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}