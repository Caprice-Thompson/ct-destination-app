import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";

type AuthFormFooterProps = {
  message: string;
  link: string;
  linkText: string;
  returnLink: string;
  returnLinkText: string;
};

export const AuthFormFooter = ({
  message,
  link,
  linkText,
  returnLink,
  returnLinkText,
}: AuthFormFooterProps) => {
  return (
    <div className="text-center space-y-2">
      <div className="text-sm text-gray-600 dark:text-gray-400">{message}</div>
      <Link
        to={link}
        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
      >
        {linkText}
      </Link>
      <div className="pt-2">
        <Link
          to={returnLink}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <span className="flex items-center gap-2 justify-center">
            <ArrowUturnLeftIcon height={16} width={16} />
            {returnLinkText}
          </span>
        </Link>
      </div>
    </div>
  );
};
