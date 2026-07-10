import { months } from "./constants";

export const convertMonthValue = (monthValue: number | string): string => {
  const monthNumber =
    typeof monthValue === "string"
      ? Number.parseInt(monthValue, 10)
      : monthValue;
  const monthNames = months.map((month) => month.label);
  return monthNames[monthNumber - 1] || "";
};
