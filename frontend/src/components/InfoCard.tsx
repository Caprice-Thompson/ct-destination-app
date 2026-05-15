interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg?: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoCard({
  title,
  icon,
  iconBg = "bg-gradient-to-br from-blue-500 to-indigo-600",
  children,
  className = "",
}: InfoCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shadow-md`}
        >
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}
