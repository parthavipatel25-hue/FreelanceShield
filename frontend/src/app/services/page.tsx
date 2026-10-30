
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";

const categories: Record<
  string,
  { description: string; services: string[] }
> = {
  "Programming & Tech": {
    description: "Find professional technology services to build, improve, and maintain your digital products.",
    services: ["Software Development", "API Development", "Website Maintenance", "Custom Applications", "Database Development"],
  },
  "Web Development": {
    description: "Build modern, responsive, and high-performing websites with professional web development services.",
    services: ["Next.js Development", "React Development", "Frontend Development", "Backend Development", "E-commerce Websites"],
  },
  "Graphics & Design": {
    description: "Bring your ideas to life with creative visual designs and professional branding.",
    services: ["Logo Design", "Brand Identity", "Social Media Design", "Brochure Design", "Illustration"],
  },
  "Digital Marketing": {
    description: "Grow your online presence and reach more customers through effective digital marketing.",
    services: ["SEO", "Social Media Marketing", "Google Ads", "Email Marketing", "Content Marketing"],
  },
  "Writing & Translation": {
    description: "Communicate your ideas clearly with professional writing, editing, and translation services.",
    services: ["Content Writing", "Blog Writing", "Copywriting", "Proofreading", "Translation"],
  },
  "Video & Animation": {
    description: "Create engaging videos, animations, and visual content for your audience.",
    services: ["Video Editing", "2D Animation", "3D Animation", "Motion Graphics", "YouTube Videos"],
  },
  "AI Services": {
    description: "Use artificial intelligence to automate workflows and develop smarter digital solutions.",
    services: ["AI Chatbot Development", "AI Integration", "Machine Learning", "AI Automation", "Prompt Engineering"],
  },
  "Music & Audio": {
    description: "Find creative audio professionals for music production, recording, and sound design.",
    services: ["Audio Editing", "Voice-over", "Music Production", "Podcast Editing", "Sound Design"],
  },
  Business: {
    description: "Get professional support to organize, manage, and grow your business.",
    services: ["Business Planning", "Market Research", "Business Consulting", "Project Management", "Virtual Business Support"],
  },
  "Cyber Security": {
    description: "Improve your digital security with professional cybersecurity and protection services.",
    services: ["Security Auditing", "Vulnerability Assessment", "Penetration Testing", "Security Consulting", "Risk Assessment"],
  },
  "Mobile Development": {
    description: "Build mobile applications that deliver excellent experiences across devices.",
    services: ["Android Development", "iOS Development", "React Native", "Flutter Development", "Mobile App Testing"],
  },
  "Cloud Computing": {
    description: "Manage and scale your infrastructure using modern cloud computing solutions.",
    services: ["AWS Services", "Cloud Migration", "Azure Services", "DevOps", "Cloud Infrastructure"],
  },
  "UI/UX Design": {
    description: "Create intuitive and attractive digital experiences through user-focused design.",
    services: ["Website UI Design", "Mobile App Design", "Wireframing", "Prototyping", "User Experience Research"],
  },
  Photography: {
    description: "Get professional photography and image editing services for your creative projects.",
    services: ["Product Photography", "Portrait Photography", "Photo Editing", "Event Photography", "Commercial Photography"],
  },
  "Finance & Accounting": {
    description: "Find professional financial support for bookkeeping, accounting, and business finance.",
    services: ["Bookkeeping", "Financial Planning", "Accounting", "Financial Analysis", "Tax Preparation"],
  },
  "Consulting & Strategy": {
    description: "Make informed decisions and develop strategies with professional consultants.",
    services: ["Business Strategy", "Management Consulting", "IT Consulting", "Market Analysis", "Growth Strategy"],
  },
  "Education & Tutoring": {
    description: "Learn new skills and achieve your goals with professional educational support.",
    services: ["Online Tutoring", "Programming Lessons", "Language Teaching", "Academic Support", "Professional Training"],
  },
  "Product & Industrial Design": {
    description: "Turn product ideas into functional, attractive designs with professional product and industrial design services.",
    services: [
      "Product Concept Design",
      "3D Product Modeling",
      "Packaging Design",
      "Industrial Design",
      "Prototype Design",
    ],
  },
};

export default function ServicesPage() {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") || "");
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  const selectedCategory = categories[category];

  if (!selectedCategory) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Category not found
          </h1>
          <p className="mt-4 text-slate-600">
            Please search for one of our available service categories.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-emerald-600 px-7 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Back to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Freelance<span className="text-emerald-600">Shield</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <Search size={30} className="text-emerald-600" />
            </div>

            <p className="mt-6 font-semibold text-emerald-600">
              EXPLORE SERVICES
            </p>

            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">
              {category}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              {selectedCategory.description}
            </p>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900">
              Popular Services
            </h2>

            <p className="mt-2 text-slate-600">
              Explore the types of services available in this category.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedCategory.services.map((service) => (
                <div
                  key={service}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md"
                >
                  <h3 className="font-semibold text-slate-800">
                    {service}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-3xl bg-slate-900 px-6 py-12 text-center text-white md:px-12">
            <ShieldCheck
              size={42}
              className="mx-auto text-emerald-400"
            />

            <h2 className="mt-5 text-2xl font-bold md:text-3xl">
              Get started with FreelanceShield
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-300">
              Whether you want to hire a freelancer for your project
              or become a freelancer offering services in this category,
              sign in or create an account to get started.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register?role=client"
                className="rounded-xl bg-emerald-600 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
              >
                Hire a Freelancer
              </Link>

              <Link
                href="/register?role=freelancer"
                className="rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                Become a Freelancer
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
