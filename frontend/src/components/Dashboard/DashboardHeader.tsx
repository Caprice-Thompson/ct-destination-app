import { Link } from "@tanstack/react-router";
import { FaArrowLeft } from "react-icons/fa";
import { AppRoute } from "../../common/enums";
import { BookmarkIcon } from "../Bookmark/BookmarkIcon";

export const DashboardHeader = ({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) => {
  return (
    <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to={AppRoute.Home}>
          <button
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            type="button"
          >
            <FaArrowLeft />
            Explore the World
          </button>
        </Link>
        <div className="relative flex flex-col items-end">
          {isAuthenticated && <BookmarkIcon />}
        </div>
      </div>
    </nav>
  );
};
