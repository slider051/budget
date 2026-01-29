interface CircularProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

export default function CircularProgress({
  percentage,
  size = 'md',
  strokeWidth,
  showPercentage = false,
  children,
}: CircularProgressProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  const sizes = {
    sm: { width: 80, defaultStroke: 8 },
    md: { width: 120, defaultStroke: 10 },
    lg: { width: 160, defaultStroke: 12 },
    xl: { width: 200, defaultStroke: 14 },
  };

  const { width, defaultStroke } = sizes[size];
  const stroke = strokeWidth ?? defaultStroke;
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={width} height={width} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900">
            {Math.round(clampedPercentage)}%
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
