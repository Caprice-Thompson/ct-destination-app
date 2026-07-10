interface DataRowProps {
  label: string;
  value: string | number;
  bold?: boolean;
}

export function DataRow({ label, value, bold = false }: DataRowProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span
        className={`text-sm text-gray-900 ${bold ? "font-bold" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
