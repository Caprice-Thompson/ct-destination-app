import { useState } from "react";
import { FaRegBookmark } from "react-icons/fa";
import { addCurrentPageToBookmarks } from "../../utils/addBookmarks";
import { Button } from "../UI/Button";

export function BookmarkIcon() {
  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          setBookmarkSaved(true);
          addCurrentPageToBookmarks();
          setTimeout(() => setBookmarkSaved(false), 3000);
        }}
      >
        <FaRegBookmark />
      </Button>
      <span
        className={`absolute top-full mt-1 right-0 whitespace-nowrap text-xs font-medium text-green-600 transition-opacity ${
          bookmarkSaved ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        Bookmark saved!
      </span>
    </>
  );
}
