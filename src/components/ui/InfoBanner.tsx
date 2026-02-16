import type { ReactNode } from "react";

type Variant = "info" | "warning" | "error" | "tip";

interface InfoBannerProps {
  readonly variant?: Variant;
  readonly title: string;
  readonly description: ReactNode;
  readonly className?: string;
}

const variantStyles: Record<Variant, { bg: string; border: string; icon: string; title: string; desc: string }> = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    title: "text-blue-900",
    desc: "text-blue-700",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "text-yellow-600",
    title: "text-yellow-900",
    desc: "text-yellow-700",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-600",
    title: "text-red-900",
    desc: "text-red-700",
  },
  tip: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "text-violet-600",
    title: "text-violet-900",
    desc: "text-violet-700",
  },
};

const icons: Record<Variant, string> = {
  info: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
  warning:
    "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
  error:
    "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
  tip: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
};

export default function InfoBanner({
  variant = "info",
  title,
  description,
  className = "",
}: InfoBannerProps) {
  const style = variantStyles[variant];

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-4 ${className}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <svg
            className={`w-5 h-5 ${style.icon}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d={icons[variant]} clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 className={`text-sm font-medium ${style.title} mb-1`}>{title}</h4>
          <p className={`text-sm ${style.desc}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
