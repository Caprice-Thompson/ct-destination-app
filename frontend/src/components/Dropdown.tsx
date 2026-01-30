

interface Option {
    value: string | number;
    label: string;
}

interface DropdownProps {
    id: string;
    name: string;
    className?: string;
    required?: boolean;
    options: Option[];
    defaultOption?: string;
    label: string;
    value:string;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    icon?: React.ReactNode;
}

const Dropdown = ({
    id,
    name,
    className = '',
    required = false,
    options,
    defaultOption = 'Please select...',
    label,
    value,
    onChange,
    icon,
}: DropdownProps) => {
    return (
<>
            {icon && <span className="select-icon">{icon}</span>}
            <select
                id={id}
                className={className}
                name={name}
                required={required}
                aria-label={label}
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