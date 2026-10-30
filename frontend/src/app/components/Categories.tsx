
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  Monitor,
  Camera,
  Database,
  Lightbulb,
  GraduationCap,
  Blocks,
  Box,
} from "lucide-react";

const categories = [
  { title: "Programming & Tech", icon: Code2 },
  { title: "Web Development", icon: Blocks },
  { title: "Graphics & Design", icon: Palette },
  { title: "Digital Marketing", icon: Globe },
  { title: "Writing & Translation", icon: Languages },
  { title: "Video & Animation", icon: Image },
  { title: "AI Services", icon: Brain },
  { title: "Music & Audio", icon: Music },
  { title: "Business", icon: Briefcase },
  { title: "Cyber Security", icon: Shield },
  { title: "Mobile Development", icon: Smartphone },
  { title: "Cloud Computing", icon: Cloud },
  { title: "UI/UX Design", icon: Monitor },
  { title: "Photography", icon: Camera },
  { title: "Finance & Accounting", icon: Database },
  { title: "Consulting & Strategy", icon: Lightbulb },
  { title: "Education & Tutoring", icon: GraduationCap },
  { title: "Product & Industrial Design", icon: Box },
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
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const visibleCategories = showAll
    ? categories
    : isDesktop
    ? categories.slice(0, 12)
    : categories.slice(0, 8);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold text-slate-900">
          Explore Categories
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
          Find trusted freelancers across
          hundreds of professional services.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {visibleCategories.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={`/services?category=${encodeURIComponent(item.title)}`}
                className="
                  rounded-2xl
                  bg-white
                  p-5
                  text-center
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:border
                  hover:border-emerald-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500
                "
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon size={24} className="text-emerald-600" />
                </div>

                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  {item.title}
                </h3>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
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
            {showAll ? "See Less ↑" : "See More ↓"}
          </button>
        </div>
      </div>
    </section>
  );
}
