interface ButtonProps {
  className?: string;
  type: "submit" | "reset" | "button";
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent" | "pink" | "green" | "grey";
}
export function Button({
  type,
  onClick,
  children,
  icon,
  disabled = false,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const getButtonStyles = (variant: ButtonProps["variant"] = "primary") => {
    const baseStyles =
      "relative px-6 py-2.5 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 cursor-pointer";

    const variants = {
      primary: `bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/50`,
      secondary: `bg-gradient-to-r from-indigo-400 to-blue-500 text-white shadow-lg hover:shadow-indigo-400/50`,
      accent: `bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg hover:shadow-sky-400/50`,
      pink: `bg-gradient-to-r from-pink-400 to-pink-600 text-white shadow-lg hover:shadow-pink-400/50`,
      green: `bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:shadow-green-400/50`,
      grey: `bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg hover:shadow-gray-400/50`,
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
