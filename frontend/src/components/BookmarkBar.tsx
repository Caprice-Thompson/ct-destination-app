import { useState, useEffect } from "react";
import {
  Bookmark,
  getBookmarks,
  removeBookmark,
} from "../helpers/getBookmarks";

export function BookmarksBar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getBookmarks());

  useEffect(() => {
    if (isOpen) {
      setBookmarks(getBookmarks());
    }
  }, [isOpen]);

  function handleRemove(id: string) {
    removeBookmark(id);
    setBookmarks(getBookmarks());
  }

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
      {bookmarks.length === 0 ? (
        <div className="px-4 py-2 text-sm text-gray-700">
          No bookmarks saved.
        </div>
      ) : (
        bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
          >
            <a
              href={bookmark.url}
              className="text-sm text-blue-600 hover:underline truncate mr-2"
              onClick={onClose}
            >
              {bookmark.title}
            </a>
            <button
              onClick={() => handleRemove(bookmark.id)}
              className="text-red-500 hover:text-red-700 focus:outline-none"
              aria-label="Remove bookmark"
            >
              &times;
            </button>
          </div>
        ))
      )}
    </div>
  );
}
