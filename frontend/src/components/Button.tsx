interface ButtonProps {
  className: string;
  type: "submit" | "reset";
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}
export function Button({
  className,
  type,
  onClick,
  children,
  icon,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={className}
      type={type}
      onClick={onClick || undefined}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
