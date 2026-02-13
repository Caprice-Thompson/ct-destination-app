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
  const colorClasses: Record<ColorVariant, { bg: string; icon: string; border: string }> = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      icon: "text-blue-600",
      border: "border-blue-100/50",
    },
    pink: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      icon: "text-purple-600",
      border: "border-purple-100/50",
    },
    orange: {
      bg: "bg-gradient-to-br from-yellow-50 to-orange-50",
      icon: "text-orange-600",
      border: "border-orange-100/50",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-teal-50",
      icon: "text-teal-600",
      border: "border-green-100/50",
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} rounded-2xl p-6 border ${classes.border}`}>
      {icon && (
        <div className="flex items-center gap-2 mb-3">
          <span className={classes.icon}>{icon}</span>
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
