import { saveBookmark } from "./getBookmarks";

function getMonthName(monthNumber: string): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const index = parseInt(monthNumber.replace(/"/g, ""), 10) - 1;
  return months[index] || monthNumber;
}

export function addCurrentPageToBookmarks() {
  let title = document.title;
  try {
    const url = new URL(window.location.href);
    const country = url.searchParams.get("country");
    const month = url.searchParams.get("month");

    if (country && month) {
      title = `${country} | ${getMonthName(month)}`;
    }
  } catch (e) {
    console.error("Failed to parse URL for bookmark title", e);
  }

  saveBookmark({
    id: crypto.randomUUID(),
    title: title,
    url: window.location.href,
    createdAt: new Date().toISOString(),
  });
  console.log("Bookmark added:", {
    title: title,
    url: window.location.href,
  });
}
