import React, { useState } from "react";

interface NavButton {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

interface NavbarProps {
  buttons: NavButton[];
  logo?: React.ReactNode;
  logoText?: string;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  buttons,
  logo,
  logoText = "Brand",
  onLogoClick,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getButtonStyles = (
    variant: NavButton["variant"] = "primary",
    isActive: boolean,
  ) => {
    const baseStyles =
      "relative px-6 py-2.5 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:-rotate-1";

    const variants = {
      primary: `bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
      secondary: `bg-gradient-to-r from-indigo-400 to-blue-500 text-white shadow-lg hover:shadow-indigo-400/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
      accent: `bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg hover:shadow-sky-400/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
    };

    return `${baseStyles} ${variants[variant]}`;
  };

  return (
    <nav className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-900 shadow-2xl">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={onLogoClick}
          >
            {logo ? (
              <div className="transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                {logo}
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-cyan-500 to-indigo-600 rounded-2xl transform rotate-12 group-hover:rotate-45 transition-all duration-300 shadow-lg flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            )}
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-200 tracking-tight">
              {logoText}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  button.onClick();
                }}
                className={getButtonStyles(
                  button.variant,
                  activeIndex === index,
                )}
              >
                <span className="flex items-center space-x-2">
                  {button.icon && (
                    <span className="text-lg">{button.icon}</span>
                  )}
                  <span>{button.label}</span>
                </span>
                {activeIndex === index && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-bounce"></span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-3 pt-4">
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  button.onClick();
                  setIsMenuOpen(false);
                }}
                className={`${getButtonStyles(button.variant, activeIndex === index)} text-center`}
              >
                <span className="flex items-center justify-center space-x-2">
                  {button.icon && (
                    <span className="text-lg">{button.icon}</span>
                  )}
                  <span>{button.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-600 animate-pulse"></div>
    </nav>
  );
};
