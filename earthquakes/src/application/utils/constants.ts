const currentDate = new Date();
const eqHistoryYears = 25;
export const formattedEndDate = currentDate.toISOString().split("T")[0];
currentDate.setFullYear(currentDate.getFullYear() - eqHistoryYears);
export const formattedStartDate = currentDate.toISOString().split("T")[0];
export const maxRadiusKm = 5;
export const limit = 5;
