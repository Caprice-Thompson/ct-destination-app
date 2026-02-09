interface ButtonProps {
  className: string;
  type: "submit" | "reset";
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent";
}
export function Button({
  className,
  type,
  onClick,
  children,
  icon,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const getButtonStyles = (variant: ButtonProps["variant"] = "primary") => {
    const baseStyles =
      "relative px-6 py-2.5 font-semibold rounded-full transition-all duration-300 transform hover:scale-105";

    const variants = {
      primary: `bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/50`,
      secondary: `bg-gradient-to-r from-indigo-400 to-blue-500 text-white shadow-lg hover:shadow-indigo-400/50`,
      accent: `bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg hover:shadow-sky-400/50`,
    };

    return `${baseStyles} ${variants[variant]}`;
  };
  return (
    <button
      className={`${getButtonStyles(variant)} ${className}`}
      type={type}
      onClick={onClick || undefined}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
