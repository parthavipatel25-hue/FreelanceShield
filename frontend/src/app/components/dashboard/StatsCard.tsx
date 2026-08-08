import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: StatsCardProps) {
  return (
    <div
      className="
        w-full
        rounded-2xl
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-md
        sm:p-6
      "
    >
      {/* Icon */}

      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-emerald-100
          sm:mb-5
          sm:h-14
          sm:w-14
        "
      >
        <Icon
          size={24}
          className="text-emerald-600 sm:h-7 sm:w-7"
        />
      </div>

      {/* Title */}

      <h3
        className="
          break-words
          text-sm
          font-medium
          leading-5
          text-gray-500
          sm:text-base
        "
      >
        {title}
      </h3>

      {/* Value */}

      <h2
        className="
          mt-1
          break-words
          text-3xl
          font-bold
          leading-tight
          text-gray-900
          sm:mt-2
          sm:text-4xl
        "
      >
        {value}
      </h2>

      {/* Subtitle */}

      {subtitle && (
        <p
          className="
            mt-2
            text-xs
            leading-5
            text-gray-400
            sm:text-sm
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}