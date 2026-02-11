import type React from "react";
import { useState } from "react";
import { Button } from "./Button";

interface NavButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "accent";
}

interface NavbarProps {
  buttons: NavButton[];
  logoText?: string;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  buttons,
  logoText = "Destination App",
  onLogoClick,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getButtonStyles = (
    variant: NavButton["variant"] = "primary",
    isActive: boolean,
  ) => {
    const baseStyles =
      "relative px-6 py-2.5 font-semibold rounded-full transition-all duration-300 transform hover:scale-105";

    const variants = {
      primary: `bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
      secondary: `bg-gradient-to-r from-indigo-400 to-blue-500 text-white shadow-lg hover:shadow-indigo-400/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
      accent: `bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg hover:shadow-sky-400/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
    };

    return `${baseStyles} ${variants[variant]}`;
  };

  return (
    <nav className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-900 shadow-2xl">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={onLogoClick}
          >
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-200 tracking-tight">
              {logoText}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {buttons.map((button, index) => (
              <Button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  button.onClick();
                }}
                className={getButtonStyles(
                  button.variant,
                  activeIndex === index,
                )}
                type="submit"
                variant={button.variant as "primary" | "secondary" | "accent"}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-cyan-200 to-indigo-600 animate-pulse"></div>
    </nav>
  );
};
