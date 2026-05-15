export interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownProps {
  name: string;
  className?: string;
  options: DropdownOption[];
  defaultOption?: string;
  label: string;
  value: string | number;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: React.ReactNode;
}

const Dropdown = ({
  name,
  className = "",
  options,
  defaultOption = "Please select...",
  label,
  value,
  onChange,
  icon,
}: DropdownProps) => {
  return (
    <>
      {icon && <span className="select-icon">{icon}</span>}
      <select
        className={className}
        name={name}
        data-test-id={label}
        onChange={onChange}
        value={value}
      >
        <option value="">{defaultOption}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default Dropdown;
