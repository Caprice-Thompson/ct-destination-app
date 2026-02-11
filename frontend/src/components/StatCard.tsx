interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
}

export function StatCard({
  label,
  value,
  icon,
  bgColor = "bg-blue-50",
  textColor = "text-blue-900",
}: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 border border-blue-100/50`}>
      {icon && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-600">{icon}</span>
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}
