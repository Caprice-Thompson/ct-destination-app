import type React from "react";
import { useRef, useEffect, useState } from "react";
import { Button } from "./Button";
import { NotificationPanel } from "./NotificationPanel";
import type { EarthquakeNotificationData } from "../pages/api";
import { FaRegFolder } from "react-icons/fa";
import { BookmarksBar } from "./BookmarkBar";

export interface NavButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "accent";
}

interface NavbarProps {
  buttons: NavButton[];
  logoText?: string;
  onLogoClick?: () => void;
  notifications?: EarthquakeNotificationData[];
  onDismissNotification?: (id: string) => void;
  onDismissAllNotifications?: () => void;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  buttons,
  logoText = "Destination App",
  onLogoClick,
  notifications = [],
  onDismissNotification,
  onDismissAllNotifications,
  isAuthenticated = false,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const bookmarksRef = useRef<HTMLDivElement>(null);

  const handleFolderClick = () => {
    setBookmarksOpen(!bookmarksOpen);
  };
  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
      if (
        bookmarksRef.current &&
        !bookmarksRef.current.contains(e.target as Node)
      ) {
        setBookmarksOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getButtonStyles = (
    variant: NavButton["variant"] = "primary",
    isActive: boolean,
  ) => {
    const baseStyles =
      "relative px-6 py-2.5 font-semibold rounded-full transition-all duration-300 transform hover:scale-105";

    const variants = {
      primary: `bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
      secondary: `bg-linear-to-r from-indigo-400 to-blue-500 text-white shadow-lg hover:shadow-indigo-400/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
      accent: `bg-linear-to-r from-sky-400 to-blue-600 text-white shadow-lg hover:shadow-sky-400/50 ${isActive ? "scale-105 shadow-2xl" : ""}`,
    };

    return `${baseStyles} ${variants[variant]}`;
  };

  return (
    <nav className="relative bg-linear-to-r from-blue-900 via-indigo-900 to-cyan-900 shadow-2xl">
      <div className="relative w-full px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={onLogoClick}
          >
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-200 via-cyan-200 to-indigo-200 tracking-tight">
              {logoText}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Bell icon */}
            {onDismissNotification && (
              <div className="relative" ref={panelRef}>
                <button
                  type="button"
                  onClick={() => setPanelOpen((open) => !open)}
                  className="relative p-2 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-200"
                  aria-label="Notifications"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none">
                      {notifications.length > 99 ? "99+" : notifications.length}
                    </span>
                  )}
                </button>

                {panelOpen && (
                  <NotificationPanel
                    notifications={notifications}
                    onDismiss={onDismissNotification}
                    onDismissAll={() => {
                      onDismissAllNotifications?.();
                      setPanelOpen(false);
                    }}
                    onClose={() => setPanelOpen(false)}
                  />
                )}
              </div>
            )}

            {/* Folder / Bookmarks icon — authenticated users only */}
            {isAuthenticated && (
              <div className="relative" ref={bookmarksRef}>
                <button
                  type="button"
                  onClick={handleFolderClick}
                  className="p-2 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-200"
                  aria-label="Bookmarks"
                >
                  <FaRegFolder className="w-6 h-6" />
                </button>
                <BookmarksBar
                  isOpen={bookmarksOpen}
                  onClose={() => setBookmarksOpen(false)}
                />
              </div>
            )}

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
      <div className="h-1 bg-linear-to-r from-blue-400 via-cyan-200 to-indigo-600 animate-pulse" />
    </nav>
  );
};
