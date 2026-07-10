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
  iconBg = "bg-blue-600",
  children,
  className = "",
}: InfoCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center text-white`}
        >
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
