import { Link } from "@tanstack/react-router";
import { RiErrorWarningLine } from "react-icons/ri";
import { AppRoute } from "../../common/enums";
import { Button } from "../UI/Button";

interface FailureDialogProps {
  title: string;
  message: string;
  retryButtonText: string;
}

export const FailureDialog = ({
  title,
  message,
  retryButtonText,
}: FailureDialogProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-sm w-full">
        <div className="w-12 h-12 bg-red-500 rounded-xl mx-auto mb-5 flex items-center justify-center">
          <RiErrorWarningLine className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 text-sm mb-8">{message}</p>
        <Link to={AppRoute.Home}>
          <Button className="" type="button" variant="primary">
            {retryButtonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};
