export type Bookmark = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};

const BOOKMARKS_KEY = "bookmarks";

export function getBookmarks(): Bookmark[] {
  const saved = localStorage.getItem(BOOKMARKS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveBookmark(bookmark: Bookmark) {
  const bookmarks = getBookmarks();

  const alreadyExists = bookmarks.some((b) => b.url === bookmark.url);
  if (alreadyExists) return;

  const updated = [...bookmarks, bookmark];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
}

export function removeBookmark(id: string) {
  const bookmarks = getBookmarks();
  const updated = bookmarks.filter((b) => b.id !== id);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
}
