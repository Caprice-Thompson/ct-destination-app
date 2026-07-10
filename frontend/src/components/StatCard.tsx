type ColorVariant = "blue" | "pink" | "orange" | "green";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: ColorVariant;
}

export function StatCard({
  label,
  value,
  icon,
  color = "blue",
}: StatCardProps) {
  const colorClasses: Record<ColorVariant, { border: string; label: string }> =
    {
      blue: {
        border: "border-blue-200",
        label: "text-blue-600",
      },
      pink: {
        border: "border-purple-200",
        label: "text-purple-600",
      },
      orange: {
        border: "border-orange-200",
        label: "text-orange-600",
      },
      green: {
        border: "border-green-200",
        label: "text-green-600",
      },
    };

  const classes = colorClasses[color];

  return (
    <div className={`bg-white rounded-xl border ${classes.border} p-5`}>
      {icon && (
        <div className="mb-2">
          <span className={classes.label}>{icon}</span>
        </div>
      )}
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${classes.label} mb-1.5`}
      >
        {label}
      </p>
      <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
    </div>
  );
}
