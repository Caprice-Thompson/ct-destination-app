import { months } from "./constants";

export const convertMonthValue = (monthValue: number): string => {
  const monthNames = months.map((month) => month.label);
  return monthNames[monthValue - 1] || "";
};
