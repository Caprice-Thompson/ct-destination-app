import type React from "react";
import { GoBell } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import type { EarthquakeNotificationData } from "../../api/api";

interface NotificationPanelProps {
  notifications: EarthquakeNotificationData[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onClose: () => void;
}

function magnitudeColor(magnitude: number): string {
  if (magnitude >= 6) return "text-red-400";
  if (magnitude >= 5) return "text-orange-400";
  if (magnitude >= 4) return "text-yellow-400";
  return "text-green-400";
}

function formatTime(occurredAt: string): string {
  return new Date(occurredAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onDismiss,
  onDismissAll,
  onClose,
}) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-96 z-50 rounded-2xl border border-white/10 bg-linear-to-b from-blue-950 to-indigo-950 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">
            Earthquake Alerts
          </span>
          {notifications.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onDismissAll}
              className="text-xs text-blue-300 hover:text-white transition-colors duration-200"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors duration-200"
            aria-label="Close notifications"
          >
            <RxCross2 />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <GoBell />
            <p className="text-blue-300 text-sm">No new alerts</p>
            <p className="text-blue-500 text-xs mt-1">You're all caught up</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="flex items-start gap-3 px-5 py-4 hover:bg-white/5 transition-colors duration-150"
              >
                {/* Magnitude badge */}
                <div className="shrink-0 mt-0.5 flex flex-col items-center gap-0.5">
                  <span
                    className={`text-lg font-bold leading-none ${magnitudeColor(notification.magnitude)}`}
                  >
                    M{notification.magnitude.toFixed(1)}
                  </span>
                  <span className="text-blue-500 text-xs">
                    {formatTime(notification.occurredAt)}
                  </span>
                </div>

                {/* Location */}
                <p className="flex-1 text-sm text-blue-100 leading-snug pt-0.5">
                  {notification.location}
                </p>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => onDismiss(notification.id)}
                  className="shrink-0 text-blue-500 hover:text-white transition-colors duration-200 mt-0.5"
                  aria-label="Dismiss notification"
                >
                  <RxCross2 />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
