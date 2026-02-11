interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  className: string;
  dataTestId: string;
  required: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export function Input({
  label,
  type,
  placeholder,
  value,
  className,
  dataTestId,
  onChange,
}: InputProps) {
  return (
    <div>
      <label
        htmlFor={label}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <input
        id={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${className}`}
        data-test-id={dataTestId}
      />
    </div>
  );
}
